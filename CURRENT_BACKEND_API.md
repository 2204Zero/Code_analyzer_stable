# Current Backend API

## Summary

This document verifies the real backend API behavior of the FastAPI backend. It covers the current endpoints, their request formats, authentication requirements, and response structures based on the existing code in `backend/api/routes.py`.

## Endpoint Inventory

| Method | Path | Purpose | Auth Required | Frontend Use |
|---|---|---|---|---|
| POST | `/analyze-repo` | Clones a repo, extracts files, and queues jobs | Yes | `analyzeRepo(repoUrl)` |
| GET | `/repo/{repo_id}` | Gets the progress/results of a repo analysis | Yes | `getRepo(repoId)` |
| POST | `/ask-repo` | Queries a repo's code context via RAG | Yes | `askRepo(repoId, question)` |
| POST | `/login` | Authenticates a user and returns a token | No | `login(email, password)` |
| POST | `/register` | Creates a new user | No | `register(email, password)` |
| POST | `/analyze-code` | Queues a snippet of code for analysis | Yes | `analyzeCode(code)` |
| GET | `/export/jobs` | Exports all jobs | No | `exportJobs()` |
| GET | `/` | Health check (assumed) | No | `healthCheck()` |

## Priority Endpoint Details

### POST /analyze-repo

#### Purpose
Starts a background analysis of a GitHub repository by cloning it, chunking files, and enqueuing jobs.

#### Auth Required
Yes (`Depends(get_current_user)`).

#### Request Body
None.

#### Query Parameters
- `repo_url` (string): Sent as a query parameter (not in the JSON body).

#### Path Parameters
None.

#### Success Response Example
```json
{
  "message": "Repo analysis started",
  "repo_id": "uuid-string",
  "total_files": 10,
  "job_ids": [1, 2, 3]
}
```

#### Error Response Example
- 401 Unauthorized (if token is missing/invalid)

#### Frontend Use
`analyzeRepo(repoUrl)`

#### Notes / Risks
- Important: `repo_url` must be sent as a **query parameter**, not in a JSON body.

### GET /repo/{repo_id}

#### Purpose
Fetches the analysis progress or final results for a given repository.

#### Auth Required
Yes.

#### Request Body
None.

#### Query Parameters
None.

#### Path Parameters
- `repo_id` (string)

#### Success Response Example - Processing
```json
{
  "repo_id": "uuid-string",
  "status": "processing",
  "progress": 50,
  "completed_jobs": 5,
  "failed_jobs": 0,
  "total_jobs": 10
}
```

#### Success Response Example - Completed
```json
{
  "repo_id": "uuid-string",
  "status": "completed",
  "progress": 100,
  "report": { ... },
  "ai_summary": {
    "summary": "...",
    "critical_issues": [],
    "recommendations": []
  },
  "score": { ... }
}
```

#### Error Response Example
- 404 Not Found (if repo has no jobs): `{"detail": "Repo not found"}`
- 200 OK (if jobs exist but no results): `{"repo_id": "uuid-string", "status": "failed", "message": "No valid results generated"}`

#### Frontend Use
`getRepo(repoId)` - typically polled while status is "processing".

#### Notes / Risks
- Polling may be necessary since there are no websockets.

### POST /ask-repo

#### Purpose
Ask a question about the repository using RAG.

#### Auth Required
Yes.

#### Request Body
None.

#### Query Parameters
- `repo_id` (string)
- `question` (string)

Both must be sent as query parameters, not in a JSON body.

#### Path Parameters
None.

#### Success Response Example
```json
{
  "answer": "...",
  "chunks_used": 2,
  "context_preview": ["chunk1 text", "chunk2 text"]
}
```
Or if no context found: `{"answer": "No relevant context found"}`

#### Error Response Example
- 401 Unauthorized (if token is missing/invalid)

#### Frontend Use
`askRepo(repoId, question)`

#### Notes / Risks
- `repo_id` and `question` must be sent as query parameters.
- The LLM prompt inside the endpoint strictly asks the model to "Identify multiple real issues from the code", meaning even if the user asks a free-form question, the system is explicitly prompted to act as a reviewer finding issues.

## Other Endpoints

- **POST /login**: Expects `email` and `password` as query parameters. Returns `{"access_token": "...", "token_type": "bearer"}`.
- **POST /register**: Expects `email` and `password` as query parameters. Returns `{"message": "User created"}`.
- **POST /analyze-code**: Expects a JSON body matching `CodeRequest` (has `code` field). Returns `{"job_id": 123, "status": "queued"}`. Auth required.
- **GET /export/jobs**: No auth required. Returns `{"total": 1, "data": [{"job_id": 1, "repo_id": "...", "result": {}, "status": "..."}]}`.
- **GET /**: Needs runtime verification.

## Frontend Mock API Functions To Create

```ts
login(email, password)
register(email, password)
analyzeRepo(repoUrl)
getRepo(repoId)
askRepo(repoId, question)
analyzeCode(code)
exportJobs()
healthCheck()
```

## Frontend Integration Warnings

- **Query parameter usage:** Most POST endpoints (`/login`, `/register`, `/analyze-repo`, `/ask-repo`) do not accept JSON bodies for their main parameters. Inputs like `email`, `password`, `repo_url`, `repo_id`, and `question` **must** be appended to the URL as query parameters.
- **Auth token requirement:** Ensure the `Authorization: Bearer <token>` header is added to `analyzeRepo`, `getRepo`, `askRepo`, and `analyzeCode`.
- **Response shape inconsistencies:** `GET /repo/{repo_id}` changes its response structure significantly between `processing` and `completed` states.
- **Possible long-running requests:** RAG via `/ask-repo` is synchronous and might take a long time, potentially causing timeout issues on the frontend.
- **Fields that may be missing:** `ai_summary` might have string values or lack fields if the AI generation fails, although it falls back to a dictionary with `summary`, `critical_issues`, and `recommendations` upon exception.

## Runtime Verification Results

### POST /login

#### Runtime Test Status
Tested successfully.

#### Exact Request Used
```bash
curl -X POST "http://127.0.0.1:8000/login?email=test_user2@test.com&password=password123" -H "accept: application/json" -H "Content-Length: 0"
```

#### Headers Used
- `accept: application/json`

#### Success Response Observed
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### Error Response Observed
Not tested, but code indicates `404 User not found` and `401 Incorrect password`.

#### Frontend Notes
Must use query parameters `email` and `password`.

### POST /analyze-repo

#### Runtime Test Status
Tested successfully.

#### Exact Request Used
```bash
curl -X POST "http://127.0.0.1:8000/analyze-repo?repo_url=https://github.com/pypa/sampleproject" -H "accept: application/json" -H "Authorization: Bearer <redacted>" -H "Content-Length: 0"
```

#### Headers Used
- `accept: application/json`
- `Authorization: Bearer <redacted>`

#### Success Response Observed
```json
{
  "message": "Repo analysis started",
  "repo_id": "193202c9-f2e9-4034-ad3e-0219ae96faf3",
  "total_files": 5,
  "job_ids": [137, 138, 139, 140, 141]
}
```

#### Error Response Observed
None.

#### Frontend Notes
Returns a `repo_id` that you must then poll via `GET /repo/{repo_id}`.

### GET /repo/{repo_id}

#### Runtime Test Status
Tested successfully.

#### Exact Request Used
```bash
curl -X GET "http://127.0.0.1:8000/repo/193202c9-f2e9-4034-ad3e-0219ae96faf3" -H "accept: application/json" -H "Authorization: Bearer <redacted>"
```

#### Headers Used
- `accept: application/json`
- `Authorization: Bearer <redacted>`

#### Success Response Observed - Processing
```json
{
  "repo_id": "193202c9-f2e9-4034-ad3e-0219ae96faf3",
  "status": "processing",
  "progress": 80,
  "completed_jobs": 4,
  "failed_jobs": 0,
  "total_jobs": 5
}
```

#### Success Response Observed - Completed or Failed
```json
{
  "repo_id": "193202c9-f2e9-4034-ad3e-0219ae96faf3",
  "status": "completed",
  "progress": 100,
  "report": {
    "total_files": 5,
    "total_unique_issues": 21,
    "top_issues": [
      {
        "issue": "Missing `readme_renderer` dependency",
        "description": "The `session.install('readme_renderer')` line is commented out...",
        "count": 1
      }
    ]
  },
  "ai_summary": {
    "summary": "Failed to parse AI response",
    "raw": "LLM Error: 429 You exceeded your current quota..."
  },
  "score": {
    "repo_score": 0,
    "grade": "D",
    "verdict": "Poor quality, needs major fixes"
  }
}
```

#### Error Response Observed
`{"detail": "Repo not found"}` (404) if no jobs exist for that ID (e.g., if a repo with 0 code files was submitted).

#### Frontend Notes
Notice the structure completely changes when `status` shifts from `processing` to `completed`. `report`, `ai_summary`, and `score` fields appear. The `ai_summary` field may contain error text if rate-limited.

### POST /ask-repo

#### Runtime Test Status
Tested successfully.

#### Exact Request Used
```bash
curl -X POST "http://127.0.0.1:8000/ask-repo?repo_id=193202c9-f2e9-4034-ad3e-0219ae96faf3&question=what%20is%20this%20repo%20about" -H "accept: application/json" -H "Authorization: Bearer <redacted>" -H "Content-Length: 0"
```

#### Headers Used
- `accept: application/json`
- `Authorization: Bearer <redacted>`

#### Success Response Observed
```json
{
  "answer": "This repository is about:\n\n*   **A minimal Python package demonstration:**...",
  "chunks_used": 10,
  "context_preview": [
    "FULL FILE: repos\\sampleproject_be7ed4e0\\src\\sample\\simple.py\n\ndef add_one(number):\n    return number + 1\n"
  ]
}
```

#### Error Response Observed
None.

#### Frontend Notes
Must use `repo_id` and `question` as query parameters.

## Frontend Mock Data Seed

Provide realistic mock JSON objects based on the runtime responses:

```json
{
  "mockLoginResponse": {
    "access_token": "mock-jwt-token-12345",
    "token_type": "bearer"
  },
  "mockAnalyzeRepoResponse": {
    "message": "Repo analysis started",
    "repo_id": "mock-uuid-9999",
    "total_files": 5,
    "job_ids": [101, 102, 103]
  },
  "mockRepoProcessingResponse": {
    "repo_id": "mock-uuid-9999",
    "status": "processing",
    "progress": 60,
    "completed_jobs": 3,
    "failed_jobs": 0,
    "total_jobs": 5
  },
  "mockRepoCompletedResponse": {
    "repo_id": "mock-uuid-9999",
    "status": "completed",
    "progress": 100,
    "report": {
      "total_files": 5,
      "total_unique_issues": 1,
      "top_issues": [
        {
          "issue": "Missing dependency",
          "description": "Dependencies not found in requirements.txt",
          "count": 1
        }
      ]
    },
    "ai_summary": {
      "summary": "The repository is a basic sample.",
      "critical_issues": [],
      "recommendations": []
    },
    "score": {
      "repo_score": 85,
      "grade": "B",
      "verdict": "Good quality"
    }
  },
  "mockAskRepoResponse": {
    "answer": "The repository is a minimal sample project...",
    "chunks_used": 2,
    "context_preview": [
      "def add_one(number): return number + 1"
    ]
  }
}
```

This document was created by inspecting and/or testing the current backend API. No backend or frontend code changes were made.
