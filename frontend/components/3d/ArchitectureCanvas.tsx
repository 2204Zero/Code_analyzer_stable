"use client";

import dynamic from "next/dynamic";
import React from "react";
import { useVertexStore } from "@/store/useVertexStore";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), { ssr: false });

export function ArchitectureCanvas() {
  const { graph } = useVertexStore();

  if (!graph) return <div className="text-emerald-500/50 font-mono text-sm absolute inset-0 flex items-center justify-center pointer-events-none">Loading Canvas...</div>;
  
  return (
    <div className="fixed inset-0 z-10 pointer-events-auto mix-blend-screen opacity-90">
      <ForceGraph3D
        graphData={{
          nodes: graph.nodes,
          links: graph.edges
        }}
        backgroundColor="rgba(0,0,0,0)"
        nodeLabel="label"
        nodeColor={(node: any) => node.type === 'file' ? '#10b981' : '#34d399'}
        linkColor={() => "rgba(16, 185, 129, 0.2)"}
        linkWidth={1}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => "#34d399"}
        linkDirectionalParticleSpeed={0.01}
        nodeRelSize={6}
        nodeOpacity={0.9}
        nodeResolution={32}
        showNavInfo={false}
      />
    </div>
  );
}
