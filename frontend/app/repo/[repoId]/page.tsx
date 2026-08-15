"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, RepoResponse, RepoProcessingResponse, RepoCompletedResponse } from "@/lib/api";
import Link from "next/link";

export default function RepoDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const repoId = params.repoId as string;

  const [repoData, setRepoData] = useState<RepoResponse | null>(null);
  const [error, setError] = useState("");
  
  // Ask Repo state
  const [question, setQuestion] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState("");
  const [askResponse, setAskResponse] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    let intervalId: NodeJS.Timeout;

    const fetchRepoStatus = async () => {
      try {
        const data = await api.getRepo(repoId, token);
        setRepoData(data);
        
        if (data.status === "completed" || data.status === "failed") {
          clearInterval(intervalId);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch repository data");
        clearInterval(intervalId);
      }
    };

    fetchRepoStatus();

    intervalId = setInterval(() => {
      if (repoData?.status === "processing" || !repoData) {
        fetchRepoStatus();
      } else {
        clearInterval(intervalId);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [repoId, router]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setAskLoading(true);
    setAskError("");
    setAskResponse(null);

    try {
      const res = await api.askRepo(repoId, question, token);
      setAskResponse(res);
    } catch (err: any) {
      setAskError(err.message || "Failed to ask repository");
    } finally {
      setAskLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  const Navbar = () => (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-xl font-bold text-gray-900 cursor-pointer tracking-tight" onClick={() => router.push("/")}>
              Agentic AI
            </h1>
          </div>
          <nav className="flex space-x-6 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">New Analysis</Link>
            <span className="text-gray-300">|</span>
            <button onClick={handleLogout} className="hover:text-gray-900 transition-colors">Logout</button>
          </nav>
        </div>
      </div>
    </header>
  );

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center p-8 bg-white border border-gray-200 rounded-lg shadow-sm max-w-md w-full">
            <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 text-sm mb-6">{error}</p>
            <button onClick={() => router.push("/")} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!repoData) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500 font-medium animate-pulse">Initializing analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (repoData.status === "failed") {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center p-8 bg-white border border-gray-200 rounded-lg shadow-sm max-w-md w-full">
            <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Analysis Failed</h2>
            <p className="text-gray-600 text-sm mb-6">{repoData.message}</p>
            <button onClick={() => router.push("/")} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
              Analyze Another Repository
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    if (repoData.status === "processing") {
      const p = repoData as RepoProcessingResponse;
      return (
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
          <div className="mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900">Analysis in Progress</h2>
            <p className="text-sm text-gray-500 mt-1 font-mono">{p.repo_id}</p>
          </div>
          
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
              <span>Progress</span>
              <span>{p.progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-6 overflow-hidden">
              <div className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out" style={{ width: `${p.progress}%` }}></div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">{p.completed_jobs}</p>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">{p.failed_jobs}</p>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Failed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900">{p.total_jobs}</p>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Total</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const c = repoData as RepoCompletedResponse;
    const isErrorSummary = 'raw' in c.ai_summary;
    const isSuccessGrade = c.score.grade === 'A' || c.score.grade === 'B';

    return (
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-gray-900">Analysis Dashboard</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                Completed
              </span>
            </div>
            <p className="text-sm text-gray-500 font-mono">{c.repo_id}</p>
          </div>
          
          <div className={`flex items-center gap-4 p-3 rounded-lg border ${isSuccessGrade ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
            <div className={`flex items-center justify-center h-12 w-12 rounded-full ${isSuccessGrade ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'} text-xl font-bold`}>
              {c.score.grade}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Score: {c.score.repo_score}/100</p>
              <p className="text-xs text-gray-600">{c.score.verdict}</p>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col">
            <span className="text-sm font-medium text-gray-500 mb-1">Total Files</span>
            <span className="text-2xl font-semibold text-gray-900">{c.report.total_files}</span>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col">
            <span className="text-sm font-medium text-gray-500 mb-1">Total Issues</span>
            <span className="text-2xl font-semibold text-gray-900">{c.report.total_unique_issues}</span>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col">
            <span className="text-sm font-medium text-gray-500 mb-1">Grade</span>
            <span className={`text-2xl font-semibold ${isSuccessGrade ? 'text-green-600' : 'text-orange-600'}`}>{c.score.grade}</span>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col">
            <span className="text-sm font-medium text-gray-500 mb-1">Score</span>
            <span className="text-2xl font-semibold text-gray-900">{c.score.repo_score}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* AI Summary */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Summary
            </h3>
            
            {isErrorSummary ? (
              <div className="bg-red-50 border border-red-100 rounded-md p-4 text-sm text-red-800">
                <p className="font-semibold mb-1">Generation Failed</p>
                <p className="whitespace-pre-wrap font-mono text-xs">{c.ai_summary.raw}</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-700 leading-relaxed">{c.ai_summary.summary}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 border-b pb-1">Critical Issues</h4>
                  {(!c.ai_summary.critical_issues || c.ai_summary.critical_issues.length === 0) ? (
                    <p className="text-sm text-gray-500 italic">No critical issues found in the mock response.</p>
                  ) : (
                    <ul className="space-y-2">
                      {c.ai_summary.critical_issues.map((i, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-red-500 mt-0.5">•</span>
                          <span>{i}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 border-b pb-1">Recommendations</h4>
                  {(!c.ai_summary.recommendations || c.ai_summary.recommendations.length === 0) ? (
                    <p className="text-sm text-gray-500 italic">No recommendations provided in the mock response.</p>
                  ) : (
                    <ul className="space-y-2">
                      {c.ai_summary.recommendations.map((r, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-500 mt-0.5">→</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Top Issues */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Top Issues
            </h3>
            
            {c.report.top_issues.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-500 italic border-2 border-dashed border-gray-100 rounded-lg p-8">
                No major issues detected.
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto pr-2" style={{ maxHeight: '400px' }}>
                {c.report.top_issues.map((issue, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-md p-4 border-l-4 border-orange-400">
                    <div className="flex justify-between items-start mb-2 gap-4">
                      <h4 className="font-semibold text-gray-900 text-sm leading-tight">{issue.issue}</h4>
                      <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                        {issue.count} occurrences
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{issue.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {renderDashboard()}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-full flex flex-col sticky top-24" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
              <div className="mb-4 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Repository Review Assistant
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Ask about repository purpose, issues, architecture, or improvements.
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-1 scrollbar-thin">
                {!askResponse && !askLoading && !askError && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                    <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">I'm ready to answer questions based on the codebase context.</p>
                  </div>
                )}

                {askResponse && (
                  <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                    <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {askResponse.answer}
                    </div>
                    <div className="mt-4 pt-3 border-t border-blue-100/80">
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Based on {askResponse.chunks_used} code snippets
                      </p>
                      {askResponse.context_preview && askResponse.context_preview.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded p-2 overflow-x-auto">
                          <p className="text-[10px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">Context Preview</p>
                          <pre className="text-[11px] text-gray-600 font-mono">
                            {askResponse.context_preview[0]}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {askError && (
                  <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm flex gap-2 items-start">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{askError}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleAsk} className="mt-auto border-t border-gray-100 pt-4">
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  rows={3}
                  placeholder="e.g. Are there any security vulnerabilities?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={askLoading}
                />
                <button
                  type="submit"
                  disabled={askLoading || !question.trim()}
                  className="mt-3 w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {askLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    "Ask Repo"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
