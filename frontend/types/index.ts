export interface GraphNode {
  id: string;
  label: string;
  type: string;
  semantic_summary?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

export interface ArchitectureGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface CodeIssue {
  filepath: string;
  issue: string;
  suggested_fix: string;
  git_patch?: string; // Phase 15 Auto-Healer output
}

export interface PerformanceProfile {
  overall_repo_complexity: string;
  critical_bottlenecks: any[];
}
