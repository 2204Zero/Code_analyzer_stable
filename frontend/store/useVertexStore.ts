import { create } from "zustand";
import type { ArchitectureGraph, CodeIssue, PerformanceProfile } from "@/types";

const FALLBACK_GRAPH = {
  nodes: [
    { id: 'main.py', label: 'main.py (Router)', type: 'file' },
    { id: 'auth.py', label: 'auth.py (Security)', type: 'file' },
    { id: 'database.py', label: 'database.py (Core)', type: 'file' },
    { id: 'worker.py', label: 'worker.py (ARQ)', type: 'file' },
    { id: 'models.py', label: 'models.py (Schemas)', type: 'file' }
  ],
  edges: [
    { source: 'main.py', target: 'auth.py', weight: 1 },
    { source: 'main.py', target: 'database.py', weight: 1 },
    { source: 'worker.py', target: 'database.py', weight: 1 },
    { source: 'auth.py', target: 'models.py', weight: 1 },
    { source: 'database.py', target: 'models.py', weight: 1 }
  ]
};

interface VertexState {
  graph: ArchitectureGraph | null;
  issues: CodeIssue[];
  performance: PerformanceProfile | null;
  isAnalyzing: boolean;
  selectedPatch: CodeIssue | null;
  
  setGraph: (graph: ArchitectureGraph | null) => void;
  setIssues: (issues: CodeIssue[]) => void;
  setPerformance: (performance: PerformanceProfile | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setSelectedPatch: (patch: CodeIssue | null) => void;
  fetchArchitecture: (repoId: string) => Promise<void>;
}

const MOCK_ISSUES: CodeIssue[] = [
  {
    filepath: "auth.py",
    issue: "O(N^2) nested loop in token validation",
    suggested_fix: "Use a hash set for O(1) lookups.",
    git_patch: "--- a/auth.py\n+++ b/auth.py\n@@ -10,6 +10,4 @@\n-    for token in valid_tokens:\n-        for user_token in user.tokens:\n-            if token == user_token:\n-                return True\n+    valid_set = set(valid_tokens)\n+    return any(t in valid_set for t in user.tokens)\n"
  },
  {
    filepath: "database.py",
    issue: "N+1 query problem fetching user roles.",
    suggested_fix: "Use eager loading (joinedload).",
    git_patch: "--- a/database.py\n+++ b/database.py\n@@ -45,2 +45,2 @@\n-    users = db.query(User).all()\n+    users = db.query(User).options(joinedload(User.roles)).all()\n"
  }
];

export const useVertexStore = create<VertexState>((set) => ({
  graph: null,
  issues: MOCK_ISSUES,
  performance: null,
  isAnalyzing: false,
  selectedPatch: null,
  
  setGraph: (graph) => set({ graph }),
  setIssues: (issues) => set({ issues }),
  setPerformance: (performance) => set({ performance }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setSelectedPatch: (patch) => set({ selectedPatch: patch }),
  
  fetchArchitecture: async (repoId: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/repo/${repoId}/architecture`);
      if (res.ok) {
        const data = await res.json();
        // Check if data is nested inside a property (e.g., data.architecture_graph) or is the root object
        set({ graph: data.architecture_graph || data }); 
      } else {
        console.warn("Backend returned error. Injecting Fallback Graph.");
        set({ graph: FALLBACK_GRAPH });
      }
    } catch (error) {
      console.error("Fetch failed (CORS or Server Offline). Injecting Fallback Graph.", error);
      set({ graph: FALLBACK_GRAPH });
    }
  }
}));
