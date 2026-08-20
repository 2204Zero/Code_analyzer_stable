"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GitMerge, Bug } from "lucide-react";

export default function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  });

  const leftX = useTransform(scrollYProgress, [0, 1], [0, -250]);
  const rightX = useTransform(scrollYProgress, [0, 1], [0, 250]);
  const opacity = useTransform(scrollYProgress, [0.3, 1], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col items-center justify-center px-4">
        
      <div className="relative w-full max-w-5xl flex items-center justify-center">
        
        {/* The Connector Beam: Mechanical dashed line with Git Commit Node */}
        <div className="absolute z-0 w-[500px] flex items-center justify-center">
          <motion.div 
            style={{ opacity, scaleX: opacity }}
            className="w-full h-[1px] border-t border-dashed border-zinc-300 origin-center absolute" 
          />
          {/* Git Merge Node */}
          <motion.div
            style={{ opacity, scale }}
            className="w-4 h-4 rounded-full border-[3px] border-zinc-200 bg-white z-10 relative shadow-[0_0_15px_rgba(0,0,0,0.1)]"
          />
        </div>

        {/* Left Block: The Legacy Bug */}
        <motion.div style={{ x: leftX, scale }} className="absolute z-10 w-full max-w-sm">
          <GlassPanel className="p-6 border-zinc-200 bg-white/70 shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2 mb-4 text-zinc-600">
              <Bug className="w-5 h-5" />
              <span className="font-mono text-sm tracking-wide text-zinc-900 font-semibold">Legacy Block [O(N²)]</span>
            </div>
            <pre className="text-xs font-mono text-zinc-600 bg-zinc-50 p-4 rounded-lg overflow-x-auto border border-zinc-200">
{`for user in users:
    for role in roles:
        if user.role_id == role.id:
            process(user)`}
            </pre>
          </GlassPanel>
        </motion.div>

        {/* Right Block: The Healed Code */}
        <motion.div style={{ x: rightX, opacity, scale }} className="absolute z-10 w-full max-w-sm">
          <GlassPanel className="p-6 border-zinc-200 bg-white/70 shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2 mb-4 text-zinc-600">
              <GitMerge className="w-5 h-5" />
              <span className="font-mono text-sm tracking-wide text-zinc-900 font-semibold">Vertex Synthesis [O(1)]</span>
            </div>
            <pre className="text-xs font-mono text-zinc-600 bg-zinc-50 p-4 rounded-lg overflow-x-auto border border-zinc-200">
{`roles_dict = {r.id: r for r in roles}
for user in users:
    if user.role_id in roles_dict:
        process(user)`}
            </pre>
          </GlassPanel>
        </motion.div>
      </div>

      {/* Narrative Text */}
      <motion.div style={{ opacity }} className="absolute bottom-32 text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-6">
          <div className="w-2 h-2 rounded-full bg-zinc-900 shadow-[0_0_15px_rgba(0,0,0,0.2)] animate-pulse" />
        </div>
        <h3 className="text-3xl font-bold text-zinc-900 mb-4 tracking-tight">Algorithmic Synthesis</h3>
        <p className="text-zinc-600 max-w-lg mx-auto leading-relaxed font-medium">
          The Multi-Agent framework doesn't just isolate bottlenecks—it compiles resolutions. 
          Experience real-time structural optimizations pushed directly to your workflow.
        </p>
      </motion.div>

    </div>
  );
}
