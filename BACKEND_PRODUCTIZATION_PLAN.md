# Backend Productization Plan

This document outlines a detailed plan to elevate the current MVP backend of Agentic AI to product-level quality. It addresses architectural, structural, and operational shortcomings while maintaining a safe upgrade path for the frontend.

## 1. Current Backend Strengths
- **Decoupled Architecture Idea:** Uses Redis and a worker process for background job execution.
- **RAG Implementation:** Uses ChromaDB and SentenceTransformers for intelligent repository querying.
- **Relational Database Model:** Uses SQLAlchemy ORM correctly.
- **FastAPI Framework:** Inherently asynchronous and type-hint friendly.

## 2. Current Backend Problems
- **Query Parameter Misuse:** `POST` routes like `/login`, `/register`, and `/analyze-repo` receive data via URL query parameters instead of standard JSON bodies, leading to security and length limitation issues.
- **Synchronous Bottlenecks in Async Routes:** Heavy LLM summary generation blocks the `GET /repo/{repo_id}` API route instead of being handled by background workers.
- **Lack of Authorization:** Unauthenticated routes exist (e.g. `/export/jobs` exposes all repo job states to anyone).
- **Hard Dependencies on External Services:** Missing Hugging Face models previously crashed the app.

## 3. API Design Improvements
- **Problem:** Data mutations use query parameters instead of JSON bodies.
- **Why it matters:** Query params have length limits and are often logged by reverse proxies, exposing passwords and sensitive data.
- **Proposed change:** Migrate `POST /login`, `POST /register`, `POST /analyze-repo`, and `POST /ask-repo` to accept Pydantic models (JSON Request Bodies).
- **Files likely affected:** `backend/api/routes.py`, `backend/models/schemas.py`.
- **Risk level:** High.
- **Frontend impact:** Yes, the frontend API wrapper will require updates to send JSON bodies instead of URL query parameters.

## 4. Job Processing Improvements
- **Problem:** The final repository summary is generated on-the-fly during a `GET /repo/{repo_id}` call once all child jobs finish.
- **Why it matters:** Generating a final summary via an LLM takes time and will cause the `GET` request to timeout or block the main thread.
- **Proposed change:** Move the summary generation step into a background task. When the last file chunk job completes, a separate "Finalize Repo" job should be queued to generate the AI summary and write it to the database.
- **Files likely affected:** `backend/api/routes.py`, `backend/worker.py`, `backend/services/aggregator.py`.
- **Risk level:** Medium.
- **Frontend impact:** Minimal, frontend just polls until the repo status is marked "completed".

## 5. RAG / Ask Repo Improvements
- **Problem:** The RAG system in `ask-repo` is hardcoded with a highly constrained system prompt meant solely for codebase review, ignoring general architectural queries.
- **Why it matters:** Limits the user's ability to chat with the repo freely.
- **Proposed change:** Inject a more flexible system prompt in `utils/llm.py` or `routes.py`, possibly exposing a "mode" parameter (e.g., `mode=review` vs `mode=chat`).
- **Files likely affected:** `backend/api/routes.py`, `backend/services/vector_store.py`.
- **Risk level:** Low.
- **Frontend impact:** Optional. Frontend can send a mode parameter if supported.

## 6. Repository Analysis Output Improvements
- **Problem:** Top issues are arbitrarily deduced and sometimes poorly formatted or deduplicated.
- **Why it matters:** Diminishes the perceived intelligence and usefulness of the tool.
- **Proposed change:** Refine the `aggregate_results` logic to group issues semantically (perhaps using a fast, local lightweight LLM call or simple semantic clustering).
- **Files likely affected:** `backend/services/aggregator.py`.
- **Risk level:** Low.
- **Frontend impact:** None (schema remains identical).

## 7. Error Handling Improvements
- **Problem:** Unhandled exceptions can bubble up as generic 500 errors, leaking internal implementation details.
- **Why it matters:** Poor developer experience and potential security risk.
- **Proposed change:** Implement global exception handlers in FastAPI for SQLAlchemy errors, Redis connection issues, and general exceptions, mapping them to structured JSON responses.
- **Files likely affected:** `backend/main.py`.
- **Risk level:** Low.
- **Frontend impact:** Low. Frontend will receive cleaner error messages to display.

## 8. Security Improvements
- **Problem:** Endpoints like `/export/jobs` lack authentication. Passwords sent in URL query strings are insecure.
- **Why it matters:** Severe security vulnerabilities.
- **Proposed change:** Add `Depends(get_current_user)` to `/export/jobs`. Move all passwords to JSON bodies. Ensure CORS is strictly configured.
- **Files likely affected:** `backend/api/routes.py`, `backend/main.py`.
- **Risk level:** Medium.
- **Frontend impact:** Yes, frontend must send an Authorization header for the export endpoint.

## 9. Database Improvements
- **Problem:** SQLite is used as the database (`test.db`), which handles concurrency poorly.
- **Why it matters:** Cannot be horizontally scaled; background workers will cause database lock errors under load.
- **Proposed change:** Migrate to PostgreSQL. Introduce Alembic for database migrations.
- **Files likely affected:** `backend/config/database.py`, `backend/requirements.txt`, new `alembic/` folder.
- **Risk level:** High.
- **Frontend impact:** None.

## 10. Deployment Readiness Improvements
- **Problem:** Hardcoded configurations, print statements instead of structured logging.
- **Why it matters:** Difficult to deploy, monitor, and scale in a production environment (like AWS, GCP, or render).
- **Proposed change:** Introduce the standard `logging` library. Use environment variables (via `pydantic-settings`) for all secrets and paths. Add a Dockerfile and docker-compose.yml.
- **Files likely affected:** All backend files.
- **Risk level:** Medium.
- **Frontend impact:** None.

## 11. Recommended New API v1 Contract
The revised endpoints should look like:
- `POST /api/v1/auth/login` (Body: `{ "email", "password" }`)
- `POST /api/v1/auth/register` (Body: `{ "email", "password" }`)
- `POST /api/v1/repos/analyze` (Body: `{ "repo_url" }`) -> Returns `{ "repo_id" }`
- `GET /api/v1/repos/{repo_id}` -> Returns `{ "status", "progress", ... }`
- `POST /api/v1/repos/{repo_id}/ask` (Body: `{ "question" }`)
- `GET /api/v1/admin/jobs/export` (Requires Auth)

## 12. Step-by-Step Implementation Order
1. **Phase 1: Environment & Tooling:** Introduce Docker, PostgreSQL, Alembic, and `pydantic-settings`.
2. **Phase 2: Security & Logging:** Implement structured logging, add global error handlers, secure `/export/jobs`.
3. **Phase 3: API Redesign:** Change routes to accept JSON payloads and introduce the `/api/v1/` prefix.
4. **Phase 4: Async Processing:** Refactor the heavy LLM summary generation into the background worker.
5. **Phase 5: Output Polish:** Improve the RAG prompt and issue deduplication algorithms.

## 13. What Not To Change Yet
- Do not swap out ChromaDB or Redis until scaling limits are actually reached.
- Do not introduce complex OAuth (Google/GitHub login) until the basic JSON-body authentication is robust.

## 14. Risks and How To Avoid Breaking Frontend
- **Risk:** Changing query parameters to JSON bodies immediately breaks the frontend.
  - **Mitigation:** The frontend relies on an abstraction layer (`frontend/lib/api/real-api.ts`). We can update this single file to change how requests are shaped before deploying the backend changes.
- **Risk:** Introducing `/api/v1/` prefixes breaks routing.
  - **Mitigation:** Configure a base URL in the frontend abstraction layer, allowing a single-point update.
- **Risk:** Moving summary generation to background workers alters the `completed` state timing.
  - **Mitigation:** The frontend already polls `status`. It will gracefully handle a slightly longer `processing` state without requiring code changes.
