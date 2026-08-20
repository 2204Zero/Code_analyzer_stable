"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), { ssr: false });

export default function HeroGraph() {
  const graphData = useMemo(() => {
    const N = 70;
    const nodes = Array.from({ length: N }).map((_, id) => ({ id }));
    
    const links = Array.from({ length: N * 1.5 }).map(() => ({
      source: Math.floor(Math.random() * N),
      target: Math.floor(Math.random() * N)
    }));

    return { nodes, links };
  }, []);

  return (
    <div className="w-full h-full opacity-60">
      <ForceGraph3D
        graphData={graphData}
        backgroundColor="rgba(0,0,0,0)"
        nodeColor={() => 'rgba(255, 255, 255, 0.6)'}
        nodeRelSize={3}
        linkColor={() => 'rgba(255, 255, 255, 0.08)'}
        linkWidth={1}
        linkDirectionalParticles={1}
        linkDirectionalParticleWidth={1}
        linkDirectionalParticleColor={() => 'rgba(255, 255, 255, 0.3)'}
        linkDirectionalParticleSpeed={0.002}
        showNavInfo={false}
        enableNodeDrag={false}
        enableZoomInteraction={false}
        enablePanInteraction={false}
      />
    </div>
  );
}
