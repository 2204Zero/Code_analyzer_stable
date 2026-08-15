export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterResponse {
  message: string;
}

export interface AnalyzeRepoResponse {
  message: string;
  repo_id: string;
  total_files: number;
  job_ids: number[];
}

export interface RepoProcessingResponse {
  repo_id: string;
  status: 'processing';
  progress: number;
  completed_jobs: number;
  failed_jobs: number;
  total_jobs: number;
}

export interface Issue {
  issue: string;
  description: string;
  count: number;
}

export interface RepoCompletedResponse {
  repo_id: string;
  status: 'completed';
  progress: number;
  report: {
    total_files: number;
    total_unique_issues: number;
    top_issues: Issue[];
  };
  ai_summary: {
    summary: string;
    critical_issues?: string[];
    recommendations?: string[];
    raw?: string;
  };
  score: {
    repo_score: number;
    grade: string;
    verdict: string;
  };
}

export interface RepoFailedResponse {
  repo_id: string;
  status: 'failed';
  message: string;
}

export type RepoResponse = RepoProcessingResponse | RepoCompletedResponse | RepoFailedResponse;

export interface AskRepoResponse {
  answer: string;
  chunks_used: number;
  context_preview: string[];
}

export interface AnalyzeCodeResponse {
  job_id: number;
  status: string;
}

export interface ExportJobsResponse {
  total: number;
  data: any[];
}
