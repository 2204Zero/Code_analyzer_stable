"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!repoUrl.startsWith("https://github.com/")) {
      setError("Repository URL must start with https://github.com/");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await api.analyzeRepo(repoUrl, token);
      router.push(`/repo/${res.repo_id}`);
    } catch (err: any) {
      setError(err.message || "Failed to analyze repository");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">Agentic AI Code Analyzer</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Logout
        </button>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-xl w-full p-8 bg-white rounded shadow text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Analyze a Repository</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Enter a public GitHub repository URL to start the AI-powered analysis.
          </p>

          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

          <form onSubmit={handleAnalyze} className="space-y-4">
            <input
              type="url"
              required
              placeholder="https://github.com/username/repo"
              className="block w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
