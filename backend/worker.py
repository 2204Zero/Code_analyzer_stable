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
import json
import traceback
import time

from agents.analyzer_agents import run_pipeline
from config.database import SessionLocal
from config.redis_client import redis_client
from models.db_models import Job, RepoAnalysis
from config.logging_config import logger
from services.aggregator import aggregate_results, calculate_repo_score
from services.llm_aggregator import generate_final_summary


# ---------------- RECOVERY (IMPORTANT) ---------------- #

def recover_pending_jobs(db):
    logger.info("Recovering pending jobs...")

    pending_jobs = db.query(Job).filter(Job.status == "pending").all()

    for job in pending_jobs:
        redis_client.lpush(
            "job_queue",
            json.dumps({"job_id": job.id})
        )

    logger.info(f"Recovered {len(pending_jobs)} jobs")

def update_repo_progress(repo_id, db):
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
                # Prevent multiple finalize jobs
                if redis_client.setnx(f"finalize_lock:{repo_id}", "1"):
                    redis_client.expire(f"finalize_lock:{repo_id}", 3600)
                    redis_client.lpush("job_queue", json.dumps({"repo_finalize_id": repo_id}))
    except Exception as e:
        logger.error(f"Error updating repo progress: {e}")
        db.rollback()


# ---------------- WORKER ---------------- #

async def run_worker():
    logger.info("Worker started... waiting for jobs...")

    db = SessionLocal()

    # Recover jobs at startup
    recover_pending_jobs(db)

    while True:
        try:
            # ---------------- DELAYED JOBS ---------------- #

            now = time.time()

            ready_jobs = redis_client.zrangebyscore(
                "delayed_jobs",
                0,
                now
            )

            for job_str in ready_jobs:
                job_data = json.loads(job_str)

                redis_client.lpush(
                    "job_queue",
                    json.dumps({"job_id": job_data["job_id"]})
                )

                redis_client.zrem("delayed_jobs", job_str)

                logger.info(f"Moved scheduled job {job_data['job_id']} to main queue")

            # ---------------- FETCH JOB ---------------- #

            job_data = redis_client.brpop("job_queue", timeout=2)

            if not job_data:
                continue

            _, job_data_str = job_data
            job_data = json.loads(job_data_str)
            
            if "repo_finalize_id" in job_data:
                repo_id = job_data["repo_finalize_id"]
                logger.info(f"Processing repo finalize for {repo_id}")
                
                try:
                    repo_analysis = db.query(RepoAnalysis).filter(RepoAnalysis.repo_id == repo_id).first()
                    if not repo_analysis:
                        logger.warning(f"RepoAnalysis {repo_id} not found")
                        continue
                        
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
                        except Exception:
                            ai_summary = {
                                "summary": "Failed to generate AI summary",
                                "critical_issues": [],
                                "recommendations": []
                            }
                            
                        score_data = calculate_repo_score(final_report)
                        
                        repo_analysis.status = "completed"
                        repo_analysis.progress = 100
                        repo_analysis.report = final_report
                        repo_analysis.ai_summary = ai_summary
                        repo_analysis.score = score_data
                        
                    db.commit()
                    logger.info(f"Repo finalize {repo_id} completed")
                except Exception as e:
                    logger.exception(f"Error in finalize repo {repo_id}")
                    db.rollback()
                finally:
                    redis_client.delete(f"finalize_lock:{repo_id}")
                continue

            job_id = job_data.get("job_id")
            if not job_id:
                continue

            try:
                job = db.query(Job).filter(Job.id == job_id).first()
            except Exception as e:
                logger.error(f"DB error while fetching job: {str(e)}")
                db.rollback()

                # requeue job so it's not lost
                redis_client.lpush(
                    "job_queue",
                    json.dumps({"job_id": job_id})
                )

                continue

            if not job:
                logger.warning(f"Job {job_id} not found")
                continue

            # Prevent duplicate processing
            if job.status != "pending":
                continue

            logger.info(f"Processing job: {job_id}")

            job.status = "processing"

            try:
                db.commit()
            except Exception as e:
                logger.error(f"DB commit error: {str(e)}")
                db.rollback()

                redis_client.lpush(
                    "job_queue",
                    json.dumps({"job_id": job.id})
                )

                continue

            # ---------------- PROCESS JOB ---------------- #

            try:
                # simulate delay (optional)
                # await asyncio.sleep(5)

                result = await run_pipeline(job.submission.code)

                job.result = result
                job.status = "completed"
                db.commit()

                logger.info(f"Job {job.id} completed")
                
                update_repo_progress(job.repo_id, db)

            except Exception as e:
                MAX_RETRIES = 3

                job.retry_count = (job.retry_count or 0) + 1

                if job.retry_count < MAX_RETRIES:
                    logger.warning(f"Retrying job {job.id} ({job.retry_count})")

                    job.status = "pending"
                    db.commit()

                    delay = 2 ** job.retry_count

                    redis_client.zadd(
                        "delayed_jobs",
                        {
                            json.dumps({"job_id": job.id}): time.time() + delay
                        }
                    )

                else:
                    logger.error(f"Job {job.id} failed after retries")

                    job.status = "failed"
                    job.error = f"LLM failed after retries: {str(e)}"
                    db.commit()

                    redis_client.lpush(
                        "failed_jobs",
                        json.dumps({
                            "job_id": job.id,
                            "error": job.error,
                            "failed_at": time.time()
                        })
                    )

                    logger.exception(f"Job {job.id} exception traceback:")
                    
                    update_repo_progress(job.repo_id, db)

        except Exception as e:
            logger.exception(f"Worker loop error: {str(e)}")

        finally:
            db.rollback()  # safety


# ---------------- ENTRY ---------------- #

if __name__ == "__main__":
    asyncio.run(run_worker())