# Frontend Backend Handoff

## Purpose

This file tells the frontend team how to build mock APIs that match the current real backend API.

## Current Backend Base URL

```txt
http://127.0.0.1:8000
```

## Required Auth Header

For protected endpoints, frontend must send:

```txt
Authorization: Bearer <token>
```

Protected endpoints:

- POST /analyze-repo
- GET /repo/{repo_id}
- POST /ask-repo
- POST /analyze-code

## Frontend API Functions To Create

```ts
login(email: string, password: string)
register(email: string, password: string)
analyzeRepo(repoUrl: string, token: string)
getRepo(repoId: string, token: string)
askRepo(repoId: string, question: string, token: string)
analyzeCode(code: string, token: string)
exportJobs()
healthCheck()
```

## API Function Details

- **login**
  - **Purpose**: Authenticates user and returns JWT token.
  - **Real backend endpoint**: `POST /login`
  - **Request format**: Query parameters `email` and `password`.
  - **Headers**: None.
  - **Success response**: `{"access_token": "...", "token_type": "bearer"}`
  - **Error response**: `404 User not found` or `401 Incorrect password`
  - **Frontend page/component that uses it**: Login page
  - **Mock response to use**: `mockLoginResponse`

- **register**
  - **Purpose**: Registers a new user.
  - **Real backend endpoint**: `POST /register`
  - **Request format**: Query parameters `email` and `password`.
  - **Headers**: None.
  - **Success response**: `{"message": "User created"}`
  - **Error response**: `400 User already exists` or `400 Password too long`
  - **Frontend page/component that uses it**: Register page
  - **Mock response to use**: `{"message": "User created"}`

- **analyzeRepo**
  - **Purpose**: Submits a repo for background analysis.
  - **Real backend endpoint**: `POST /analyze-repo`
  - **Request format**: Query parameter `repo_url`.
  - **Headers**: `Authorization: Bearer <token>`
  - **Success response**: `{"message": "Repo analysis started", "repo_id": "...", "total_files": 5, "job_ids": [...]}`
  - **Error response**: `401 Unauthorized`
  - **Frontend page/component that uses it**: Repository input page
  - **Mock response to use**: `mockAnalyzeRepoResponse`

- **getRepo**
  - **Purpose**: Polls for analysis progress and fetches final results.
  - **Real backend endpoint**: `GET /repo/{repo_id}`
  - **Request format**: Path parameter `repo_id`.
  - **Headers**: `Authorization: Bearer <token>`
  - **Success response**:
    - **Processing**: `{"repo_id": "...", "status": "processing", "progress": 60, "completed_jobs": 3, "failed_jobs": 0, "total_jobs": 5}`
    - **Completed**: `{"repo_id": "...", "status": "completed", "progress": 100, "report": {...}, "ai_summary": {...}, "score": {...}}`
  - **Error response**: `404 Repo not found`
  - **Frontend page/component that uses it**: Analysis progress/dashboard page
  - **Mock response to use**: `mockRepoProcessingResponse` or `mockRepoCompletedResponse`

- **askRepo**
  - **Purpose**: Queries the repo context using RAG.
  - **Real backend endpoint**: `POST /ask-repo`
  - **Request format**: Query parameters `repo_id` and `question`.
  - **Headers**: `Authorization: Bearer <token>`
  - **Success response**: `{"answer": "...", "chunks_used": 2, "context_preview": [...]}`
  - **Error response**: `401 Unauthorized`
  - **Frontend page/component that uses it**: Ask Repo / Chat panel
  - **Mock response to use**: `mockAskRepoResponse`

- **analyzeCode**
  - **Purpose**: Analyzes a code snippet.
  - **Real backend endpoint**: `POST /analyze-code`
  - **Request format**: JSON Body `{"code": "..."}`.
  - **Headers**: `Authorization: Bearer <token>`
  - **Success response**: `{"job_id": 123, "status": "queued"}`
  - **Error response**: `401 Unauthorized`
  - **Frontend page/component that uses it**: Direct code snippet analysis feature
  - **Mock response to use**: `{"job_id": 123, "status": "queued"}`

- **exportJobs**
  - **Purpose**: Exports all system jobs.
  - **Real backend endpoint**: `GET /export/jobs`
  - **Request format**: None.
  - **Headers**: None.
  - **Success response**: `{"total": 1, "data": [{...}]}`
  - **Error response**: None expected.
  - **Frontend page/component that uses it**: Admin/export page
  - **Mock response to use**: `{"total": 1, "data": []}`

- **healthCheck**
  - **Purpose**: Checks backend availability.
  - **Real backend endpoint**: `GET /`
  - **Request format**: None.
  - **Headers**: None.
  - **Success response**: Implementation dependent (typically `{"status": "ok"}`)
  - **Error response**: Connection failed.
  - **Frontend page/component that uses it**: Global app initialization / status bar
  - **Mock response to use**: `{"status": "ok"}`

## Important Frontend Warnings

1. Most POST endpoints currently use query parameters, not JSON body.
2. Login and register send email/password as query parameters.
3. Main protected endpoints require Bearer token.
4. `GET /repo/{repo_id}` response shape changes between processing and completed states.
5. `POST /ask-repo` is not fully free-form chat yet; current backend prompt behaves like repository review/Q&A.
6. `ai_summary` may contain LLM error text if API quota is exceeded.
7. Frontend components must not call `fetch` directly.
8. Frontend components should only call functions from `api.ts`.

## Recommended Frontend Mock API Shape

```ts
// Mock data references
const MOCK_DATA = {
  mockLoginResponse: {
    "access_token": "mock-jwt-token-12345",
    "token_type": "bearer"
  },
  mockAnalyzeRepoResponse: {
    "message": "Repo analysis started",
    "repo_id": "mock-uuid-9999",
    "total_files": 5,
    "job_ids": [101, 102, 103]
  },
  mockRepoProcessingResponse: {
    "repo_id": "mock-uuid-9999",
    "status": "processing",
    "progress": 60,
    "completed_jobs": 3,
    "failed_jobs": 0,
    "total_jobs": 5
  },
  mockRepoCompletedResponse: {
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
  mockAskRepoResponse: {
    "answer": "The repository is a minimal sample project...",
    "chunks_used": 2,
    "context_preview": [
      "def add_one(number): return number + 1"
    ]
  }
};

// api.ts
export const api = {
  login: async (email, password) => {
    return Promise.resolve(MOCK_DATA.mockLoginResponse);
  },
  register: async (email, password) => {
    return Promise.resolve({ message: "User created" });
  },
  analyzeRepo: async (repoUrl, token) => {
    return Promise.resolve(MOCK_DATA.mockAnalyzeRepoResponse);
  },
  getRepo: async (repoId, token) => {
    // Note: Can simulate processing state here, returning processing initially and completed later.
    return Promise.resolve(MOCK_DATA.mockRepoCompletedResponse);
  },
  askRepo: async (repoId, question, token) => {
    return Promise.resolve(MOCK_DATA.mockAskRepoResponse);
  }
};
```

## Recommended Frontend Route Mapping

| Frontend Page | API Function |
|---|---|
| Login page | login |
| Register page | register |
| Repository input page | analyzeRepo |
| Analysis progress/dashboard page | getRepo |
| Ask Repo / Chat panel | askRepo |

## Integration Rule

> Frontend may use mock data internally, but mock data must match the real backend response shape documented here.

## Final Confirmation

> This handoff document was created from the verified current backend API. No backend or frontend code changes were made.
