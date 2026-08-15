import {
  LoginResponse,
  RegisterResponse,
  AnalyzeRepoResponse,
  RepoResponse,
  AskRepoResponse,
  AnalyzeCodeResponse,
  ExportJobsResponse
} from './types';

const MOCK_DATA = {
  mockLoginResponse: {
    access_token: "mock-jwt-token-12345",
    token_type: "bearer"
  },
  mockAnalyzeRepoResponse: {
    message: "Repo analysis started",
    repo_id: "mock-uuid-9999",
    total_files: 5,
    job_ids: [101, 102, 103]
  },
  mockRepoProcessingResponse: {
    repo_id: "mock-uuid-9999",
    status: "processing" as const,
    progress: 60,
    completed_jobs: 3,
    failed_jobs: 0,
    total_jobs: 5
  },
  mockRepoCompletedResponse: {
    repo_id: "mock-uuid-9999",
    status: "completed" as const,
    progress: 100,
    report: {
      total_files: 5,
      total_unique_issues: 1,
      top_issues: [
        {
          issue: "Missing dependency",
          description: "Dependencies not found in requirements.txt",
          count: 1
        }
      ]
    },
    ai_summary: {
      summary: "The repository is a basic sample.",
      critical_issues: [],
      recommendations: []
    },
    score: {
      repo_score: 85,
      grade: "B",
      verdict: "Good quality"
    }
  },
  mockAskRepoResponse: {
    answer: "The repository is a minimal sample project...",
    chunks_used: 2,
    context_preview: [
      "def add_one(number): return number + 1"
    ]
  },
  mockAnalyzeCodeResponse: {
    job_id: 123,
    status: "queued"
  },
  mockExportJobsResponse: {
    total: 1,
    data: [
      {
        job_id: 1,
        repo_id: "mock-uuid-9999",
        result: {},
        status: "completed"
      }
    ]
  }
};

// We can simulate processing to completed state transition
let repoCallCount = 0;

export const mockApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return Promise.resolve(MOCK_DATA.mockLoginResponse);
  },
  register: async (email: string, password: string): Promise<RegisterResponse> => {
    console.log("mock register called");
    return Promise.resolve({ message: "User created" });
  },
  analyzeRepo: async (repoUrl: string, token: string): Promise<AnalyzeRepoResponse> => {
    repoCallCount = 0; // reset simulation
    return Promise.resolve(MOCK_DATA.mockAnalyzeRepoResponse);
  },
  getRepo: async (repoId: string, token: string): Promise<RepoResponse> => {
    repoCallCount++;
    if (repoCallCount < 3) {
      return Promise.resolve(MOCK_DATA.mockRepoProcessingResponse);
    }
    return Promise.resolve(MOCK_DATA.mockRepoCompletedResponse);
  },
  askRepo: async (repoId: string, question: string, token: string, mode?: string): Promise<AskRepoResponse> => {
    return Promise.resolve(MOCK_DATA.mockAskRepoResponse);
  },
  analyzeCode: async (code: string, token: string): Promise<AnalyzeCodeResponse> => {
    return Promise.resolve(MOCK_DATA.mockAnalyzeCodeResponse);
  },
  exportJobs: async (token: string): Promise<ExportJobsResponse> => {
    return Promise.resolve(MOCK_DATA.mockExportJobsResponse);
  },
  healthCheck: async (): Promise<{ status: string }> => {
    return Promise.resolve({ status: "ok" });
  }
};
