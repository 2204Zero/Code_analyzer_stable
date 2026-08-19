import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Ensure backend directory is in sys.path
backend_dir = str(Path(__file__).resolve().parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

load_dotenv()

import asyncio
from arq.connections import RedisSettings, ArqRedis

# Ensure compatibility if from_url is referenced
if not hasattr(RedisSettings, "from_url"):
    RedisSettings.from_url = RedisSettings.from_dsn

from agents.analyzer_agents import run_pipeline
from config.database import SessionLocal
from config.settings import settings
from models.db_models import Job, RepoAnalysis
import structlog
from config.logging_config import logger
from services.aggregator import aggregate_results, calculate_repo_score
from services.llm_aggregator import generate_final_summary
from utils.graph_parser import build_architecture_graph
from agents.graph_agent import enrich_graph_semantics
from agents.profiler_agent import profile_codebase_performance
import time


# ---------------- REPO PROGRESS HELPER ---------------- #

async def update_repo_progress(repo_id: str, db, arq_redis: ArqRedis):
    """
    Updates the completion progress of a repository and enqueues
    finalize_repo_task when all files have been processed.
    """
    if not repo_id:
        return

    try:
        total = db.query(Job).filter(Job.repo_id == repo_id).count()
        completed = db.query(Job).filter(Job.repo_id == repo_id, Job.status == "completed").count()
        failed = db.query(Job).filter(Job.repo_id == repo_id, Job.status == "failed").count()

        repo_analysis = db.query(RepoAnalysis).filter(RepoAnalysis.repo_id == repo_id).first()
        if repo_analysis and repo_analysis.status == "processing":
            progress = int((completed / total) * 100) if total > 0 else 100
            repo_analysis.progress = progress
            db.commit()

            if completed + failed == total:
                # Prevent multiple finalize jobs with distributed lock
                lock_acquired = await arq_redis.set(f"finalize_lock:{repo_id}", "1", nx=True, ex=3600)
                if lock_acquired:
                    logger.info(f"All jobs finished for repo {repo_id}. Enqueuing finalize_repo_task.")
                    await arq_redis.enqueue_job("finalize_repo_task", repo_id)
    except Exception as e:
        logger.error(f"Error updating repo progress for {repo_id}: {e}")
        db.rollback()


# ---------------- ARQ TASKS ---------------- #

async def process_file_task(ctx: dict, job_id: int):
    """
    Process an individual file analysis job with ARQ native retries.
    """
    db = SessionLocal()
    job_try = ctx.get("job_try", 1)
    arq_redis: ArqRedis = ctx["redis"]

    try:
        structlog.contextvars.clear_contextvars()
        
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            logger.warning("Job not found", job_id=job_id)
            return

        structlog.contextvars.bind_contextvars(job_id=job_id, repo_id=job.repo_id)

        logger.info("task_started", attempt=job_try)
        start_time = time.time()

        job.status = "processing"
        job.attempts = job_try
        db.commit()

        try:
            result = await run_pipeline(job.submission.code)
            job.result = result
            job.status = "completed"
            db.commit()

            duration = time.time() - start_time
            logger.info("task_finished", status="success", duration_seconds=round(duration, 2))
            await update_repo_progress(job.repo_id, db, arq_redis)

        except Exception as e:
            logger.warning(f"Error in run_pipeline for job {job_id} (try {job_try}): {e}")
            if job_try >= 3:
                logger.error(f"Job {job_id} reached max retries ({job_try}). Marking as failed.")
                job.status = "failed"
                job.error = f"LLM failed after retries: {str(e)}"
                db.commit()
                await update_repo_progress(job.repo_id, db, arq_redis)
            else:
                job.retry_count = job_try
                db.commit()
                # Re-raise so ARQ handles the retry natively
                raise e

    except Exception as e:
        db.rollback()
        # If it's a retryable attempt (< 3), propagate to ARQ
        if job_try < 3:
            raise e
        else:
            logger.exception(f"Unhandled error in process_file_task for job {job_id}: {e}")
    finally:
        db.close()


async def finalize_repo_task(ctx: dict, repo_id: str):
    """
    Finalize repository analysis by aggregating all file results,
    generating an AI summary, and calculating repo scores.
    """
    logger.info(f"Processing repo finalize for {repo_id}")
    db = SessionLocal()
    arq_redis: ArqRedis = ctx["redis"]

    try:
        repo_analysis = db.query(RepoAnalysis).filter(RepoAnalysis.repo_id == repo_id).first()
        if not repo_analysis:
            logger.warning(f"RepoAnalysis {repo_id} not found")
            return

        jobs = db.query(Job).filter(Job.repo_id == repo_id).all()
        results = [j.result for j in jobs if j.result]

        if not results:
            repo_analysis.status = "failed"
            repo_analysis.report = {"message": "No valid results generated"}
        else:
            final_report = aggregate_results(results)
            issues_list = [i["issue"] for i in final_report.get("top_issues", [])]

            try:
                ai_summary = await generate_final_summary(issues_list)
            except Exception as e:
                logger.warning(f"Failed to generate AI summary for repo {repo_id}: {e}")
                ai_summary = {
                    "summary": "Failed to generate AI summary",
                    "critical_issues": [],
                    "recommendations": []
                }

            score_data = calculate_repo_score(final_report)

            # Build architecture graph
            files_dict = {}
            for j in jobs:
                if j.submission and j.submission.code:
                    code = j.submission.code
                    # Try to parse filepath if it was prepended as a comment, else fallback to job id
                    filepath = f"file_{j.id}.py"
                    first_line = code.split('\n')[0]
                    if first_line.startswith("// File:"):
                        filepath = first_line.replace("// File:", "").strip()
                    files_dict[filepath] = code
                    
            try:
                graph = build_architecture_graph(files_dict)
                graph = await enrich_graph_semantics(graph, files_dict)
                repo_analysis.architecture_graph = graph.model_dump()
            except Exception as e:
                logger.warning("Failed to build architecture graph", repo_id=repo_id, error=str(e))
                
            try:
                performance_report = await profile_codebase_performance(files_dict)
                repo_analysis.performance_profile = performance_report.model_dump()
            except Exception as e:
                logger.warning("Failed to profile codebase performance", repo_id=repo_id, error=str(e))

            repo_analysis.status = "completed"
            repo_analysis.progress = 100
            repo_analysis.report = final_report
            repo_analysis.ai_summary = ai_summary
            repo_analysis.score = score_data

        db.commit()
        
        # Invalidate the cache
        try:
            await arq_redis.delete(f"arch_graph:{repo_id}")
        except Exception as e:
            logger.warning("Failed to invalidate arch_graph cache", repo_id=repo_id, error=str(e))
            
        logger.info(f"Repo finalize {repo_id} completed")
    except Exception as e:
        logger.exception(f"Error in finalize repo {repo_id}: {e}")
        db.rollback()
    finally:
        try:
            await arq_redis.delete(f"finalize_lock:{repo_id}")
        except Exception as lock_err:
            logger.warning(f"Could not release finalize lock for {repo_id}: {lock_err}")
        db.close()


# ---------------- WORKER SETTINGS ---------------- #

async def startup(ctx):
    logger.info("ARQ Worker started... ready to process jobs")


async def shutdown(ctx):
    logger.info("ARQ Worker shutting down...")


class WorkerSettings:
    functions = [process_file_task, finalize_repo_task]
    max_tries = 3
    redis_settings = RedisSettings.from_dsn(settings.REDIS_URL) if hasattr(RedisSettings, "from_dsn") else RedisSettings.from_url(settings.REDIS_URL)
    on_startup = startup
    on_shutdown = shutdown


# ---------------- ENTRY POINT ---------------- #

if __name__ == "__main__":
    from arq import run_worker
    run_worker(WorkerSettings)