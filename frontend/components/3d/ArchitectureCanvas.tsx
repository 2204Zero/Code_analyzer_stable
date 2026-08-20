"use client";

import dynamic from "next/dynamic";
import React from "react";
import { useVertexStore } from "@/store/useVertexStore";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), { ssr: false });

export function ArchitectureCanvas() {
  const { graph } = useVertexStore();

  if (!graph) return <div className="text-cyan-400 absolute inset-0 flex items-center justify-center">Loading WebGL Architecture...</div>;
  return (
    <div className="fixed inset-0 z-0 bg-[#09090B]">
      <ForceGraph3D
        graphData={{
          nodes: graph.nodes,
          links: graph.edges
        }}
        backgroundColor="#09090B"
        nodeLabel="label"
        nodeColor={(node: any) => node.type === 'file' ? '#00E5FF' : '#10B981'}
        linkColor={() => "rgba(255, 255, 255, 0.15)"}
        linkWidth={1.5}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleSpeed={0.01}
        nodeRelSize={6}
        showNavInfo={false}
      />
    </div>
  );
}
