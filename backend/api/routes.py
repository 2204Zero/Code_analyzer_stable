from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import uuid
from arq.connections import ArqRedis

from services.github_service import clone_repo, extract_code_files
from config.database import get_db
from config.arq_client import get_arq_pool

from models.db_models import User, CodeSubmission, Job, RepoAnalysis
from models.schemas import CodeRequest, UserAuthRequest, AnalyzeRepoRequest, AskRepoRequest

from services.aggregator import aggregate_results, calculate_repo_score
from services.llm_aggregator import generate_final_summary
from services.vector_store import store_repo_chunks, query_repo, collection
from utils.llm import call_llm, stream_llm
import json

from utils.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

from config.logging_config import logger
from config.rate_limiter import limiter

router = APIRouter()


# ---------------- AUTH ---------------- #

@router.post("/login")
def login(request: UserAuthRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(request.password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    token = create_access_token({"sub": user.email})

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.post("/register")
def register(request: UserAuthRequest, db: Session = Depends(get_db)):
    logger.info(f"Registering new user: {request.email}")
    if len(request.password) > 72:
        raise HTTPException(status_code=400, detail="Password too long")

    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    user = User(
        email=request.email,
        password=hash_password(request.password)
    )

    db.add(user)
    db.commit()

    return {"message": "User created"}


# ---------------- ANALYZE CODE ---------------- #

@router.post("/analyze-code")
async def analyze_code(
    request: CodeRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
    arq_pool: ArqRedis = Depends(get_arq_pool)
):
    submission = CodeSubmission(code=request.code)
    db.add(submission)
    db.commit()
    db.refresh(submission)

    job = Job(
        submission_id=submission.id,
        status="pending",
        retry_count=0
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    await arq_pool.enqueue_job("process_file_task", job.id)

    return {
        "job_id": job.id,
        "status": "queued"
    }


# ---------------- ANALYZE REPO ---------------- #

@router.post("/analyze-repo")
@limiter.limit("5/minute")
async def analyze_repo(
    request: Request,
    analyze_request: AnalyzeRepoRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
    arq_pool: ArqRedis = Depends(get_arq_pool)
):
    # CREATE repo_id ONLY ONCE
    repo_id = str(uuid.uuid4())

    repo_analysis = RepoAnalysis(repo_id=repo_id, status="processing", progress=0)
    db.add(repo_analysis)
    db.commit()
    db.refresh(repo_analysis)

    # clone + extract
    repo_path = clone_repo(analyze_request.repo_url)
    files = extract_code_files(repo_path)

    # STORE EMBEDDINGS (RAG)
    try:
        store_repo_chunks(repo_id, files)
    except RuntimeError as e:
        if "Embedding model unavailable" in str(e):
            raise HTTPException(status_code=503, detail="Embedding model unavailable. Backend could not load sentence-transformers/all-MiniLM-L6-v2. Check internet connection or local model cache.")
        raise

    job_ids = []

    for file in files:
        submission = CodeSubmission(code=file["content"])
        db.add(submission)
        db.commit()
        db.refresh(submission)

        job = Job(
            submission_id=submission.id,
            repo_id=repo_id,
            status="pending",
            retry_count=0
        )
        db.add(job)
        db.commit()
        db.refresh(job)

        await arq_pool.enqueue_job("process_file_task", job.id)

        job_ids.append(job.id)

    return {
        "message": "Repo analysis started",
        "repo_id": repo_id,
        "total_files": len(job_ids),
        "job_ids": job_ids
    }


# ---------------- REPO RESULT ---------------- #

@router.get("/repo/{repo_id}")
async def get_repo_analysis(
    repo_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    repo_analysis = db.query(RepoAnalysis).filter(RepoAnalysis.repo_id == repo_id).first()

    if not repo_analysis:
        raise HTTPException(status_code=404, detail="Repo not found")

    if repo_analysis.status == "processing":
        total_jobs = db.query(Job).filter(Job.repo_id == repo_id).count()
        completed_jobs = db.query(Job).filter(Job.repo_id == repo_id, Job.status == "completed").count()
        failed_jobs = db.query(Job).filter(Job.repo_id == repo_id, Job.status == "failed").count()

        return {
            "repo_id": repo_id,
            "status": "processing",
            "progress": repo_analysis.progress,
            "completed_jobs": completed_jobs,
            "failed_jobs": failed_jobs,
            "total_jobs": total_jobs
        }

    if repo_analysis.status == "failed":
        return {
            "repo_id": repo_id,
            "status": "failed",
            "message": "Repository analysis failed"
        }

    return {
        "repo_id": repo_id,
        "status": "completed",
        "progress": 100,
        "report": repo_analysis.report,
        "ai_summary": repo_analysis.ai_summary,
        "score": repo_analysis.score
    }

@router.get("/repo/{repo_id}/architecture")
@limiter.limit("60/minute")
async def get_repo_architecture(
    request: Request,
    repo_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
    arq_pool: ArqRedis = Depends(get_arq_pool)
):
    cache_key = f"arch_graph:{repo_id}"
    
    cached_graph = await arq_pool.get(cache_key)
    if cached_graph:
        return json.loads(cached_graph)
        
    repo = db.query(RepoAnalysis).filter(RepoAnalysis.repo_id == repo_id).first()
    if not repo or not repo.architecture_graph:
        raise HTTPException(status_code=404, detail="Architecture graph not found or still processing")
        
    await arq_pool.setex(cache_key, 3600, json.dumps(repo.architecture_graph))
    return repo.architecture_graph

# ---------------- ASK REPO (RAG) ---------------- #

@router.post("/ask-repo")
@limiter.limit("30/minute")
async def ask_repo(
    request: Request,
    payload: AskRepoRequest,
    user=Depends(get_current_user)
):
    chunks = query_repo(payload.repo_id, payload.question)

    # DEBUG: print FINAL chunks used
    logger.info("----- FINAL CHUNKS USED -----")
    for c in chunks:
        logger.info(c[:300])
        logger.info("-----")
    logger.info("-----------------------------")

    if not chunks:
        return {"answer": "No relevant context found"}

    # Build context
    context = "\n\n--- CODE CONTEXT ---\n\n"
    for i, chunk in enumerate(chunks):
        context += f"[Chunk {i+1}]\n{chunk}\n\n"

    if payload.mode in ["chat", "architecture"]:
        prompt = f"""
You are a senior software engineer explaining a codebase.

TASK:
- Explain concepts, architectural decisions, and general repo structure.
- Answer the user's question clearly using the provided context.
- You do NOT need to strictly look for bugs or issues. Be helpful and informative.

Context:
{context}

Question:
{payload.question}

Answer in a clear and structured format.
"""
    else:
        prompt = f"""
You are a senior software engineer reviewing a codebase.

STRICT RULES:
- ONLY report issues that are clearly visible in the provided code
- DO NOT assume anything not present
- DO NOT include generic issues
- Every issue MUST reference actual code behavior

TASK:
- Identify multiple real issues from the code
- For EACH issue:
    1. Describe the issue
    2. Explain WHY it is a problem
    3. Reference the code behavior (evidence)
    4. Suggest a fix

IMPORTANT:
If you are not 100% sure from code → DO NOT include that issue

Context:
{context}

Question:
{payload.question}

Answer in structured bullet points.
"""

    async def event_stream():
        yield f"data: {json.dumps({'type': 'metadata', 'chunks_used': len(chunks), 'context_preview': chunks[:2]})}\n\n"
        
        async for text_chunk in stream_llm(prompt):
            yield f"data: {json.dumps({'type': 'text', 'delta': text_chunk})}\n\n"
            
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

@router.get("/export/jobs")
def export_jobs(db: Session = Depends(get_db), user=Depends(get_current_user)):
    jobs = db.query(Job).all()

    result = []

    for job in jobs:
        result.append({
            "job_id": job.id,
            "repo_id": job.repo_id,
            "result": job.result,
            "status": job.status
        })

    return {
        "total": len(result),
        "data": result
    }