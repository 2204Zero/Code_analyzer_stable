import {
  LoginResponse,
  RegisterResponse,
  AnalyzeRepoResponse,
  RepoResponse,
  AskRepoResponse,
  AnalyzeCodeResponse,
  ExportJobsResponse
} from './types';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const realApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }
    return response.json();
  },

  register: async (email: string, password: string): Promise<RegisterResponse> => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      throw new Error(`Register failed: ${response.status}`);
    }
    return response.json();
  },

  analyzeRepo: async (repoUrl: string, token: string): Promise<AnalyzeRepoResponse> => {
    const response = await fetch(`${API_BASE_URL}/analyze-repo`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ repo_url: repoUrl })
    });
    if (!response.ok) {
      throw new Error(`Analyze repo failed: ${response.status}`);
    }
    return response.json();
  },

  getRepo: async (repoId: string, token: string): Promise<RepoResponse> => {
    const response = await fetch(`${API_BASE_URL}/repo/${repoId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`Get repo failed: ${response.status}`);
    }
    return response.json();
  },

  askRepo: async (repoId: string, question: string, token: string, mode?: string): Promise<AskRepoResponse> => {
    const response = await fetch(`${API_BASE_URL}/ask-repo`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ repo_id: repoId, question, mode })
    });
    if (!response.ok) {
      throw new Error(`Ask repo failed: ${response.status}`);
    }
    return response.json();
  },

  analyzeCode: async (code: string, token: string): Promise<AnalyzeCodeResponse> => {
    const response = await fetch(`${API_BASE_URL}/analyze-code`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ code })
    });
    if (!response.ok) {
      throw new Error(`Analyze code failed: ${response.status}`);
    }
    return response.json();
  },

  exportJobs: async (token: string): Promise<ExportJobsResponse> => {
    const response = await fetch(`${API_BASE_URL}/export/jobs`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`Export jobs failed: ${response.status}`);
    }
    return response.json();
  },

  healthCheck: async (): Promise<{ status: string }> => {
    const response = await fetch(`http://127.0.0.1:8000/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return response.json();
  }
};
