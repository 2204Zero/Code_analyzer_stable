"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Network, Activity, Wrench, ShieldAlert } from "lucide-react";

export default function SwarmTopology() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const stage1 = useTransform(scrollYProgress, [0.1, 0.2], [0, 1]);
  const stage2 = useTransform(scrollYProgress, [0.3, 0.4], [0, 1]);
  const stage3 = useTransform(scrollYProgress, [0.5, 0.6], [0, 1]);

  const dashOffset = useTransform(scrollYProgress, [0, 1], [1000, 0]);

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-[#09090b] text-white">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4">
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(6,182,212,0.05),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 text-center mb-16 lg:mb-24">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6 drop-shadow-2xl">
            Swarm Orchestration.
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
            A real-time look into the multi-agent orchestration. A central dispatcher routes AST graphs to specialized heuristic workers, analyzing execution pathways in parallel.
          </p>
        </div>

        {/* High-Fidelity Graph Container */}
        <div className="relative w-full max-w-5xl aspect-square md:aspect-video rounded-3xl p-4 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 z-10">
           
           {/* Connecting SVGs (Absolute Background) */}
           <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" style={{ zIndex: 0 }}>
             <defs>
               <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="#3f3f46" stopOpacity="1" />
                 <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
               </linearGradient>
               <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                 <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                 <stop offset="100%" stopColor="#ef4444" stopOpacity="1" />
               </linearGradient>
               <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="-100%">
                 <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                 <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
               </linearGradient>
             </defs>
             
             {/* Dispatcher to Mapper */}
             <motion.path 
               d="M 180 250 L 450 250" 
               stroke="url(#grad1)" 
               strokeWidth="2" 
               fill="none" 
               strokeDasharray="4 4"
               style={{ opacity: stage1, strokeDashoffset: dashOffset }}
             />
             
             {/* Mapper to Profiler */}
             <motion.path 
               d="M 550 250 C 650 250 650 120 800 120" 
               stroke="url(#grad3)" 
               strokeWidth="2" 
               fill="none" 
               strokeDasharray="4 4"
               style={{ opacity: stage2, strokeDashoffset: dashOffset }}
             />
             
             {/* Mapper to Healer */}
             <motion.path 
               d="M 550 250 C 650 250 650 380 800 380" 
               stroke="url(#grad2)" 
               strokeWidth="2" 
               fill="none" 
               strokeDasharray="4 4"
               style={{ opacity: stage3, strokeDashoffset: dashOffset }}
             />
           </svg>

           {/* --- Node 1: Input / Dispatcher --- */}
           <div className="flex flex-col items-center gap-6 relative z-10">
              <div className="w-24 h-24 bg-black border border-zinc-700/50 rounded-3xl flex items-center justify-center shadow-[inset_0_0_20px_rgba(255,255,255,0.05),0_0_30px_rgba(0,0,0,0.8)] relative group">
                 <div className="absolute inset-0 rounded-3xl border border-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity blur-[2px]" />
                 <Network className="w-10 h-10 text-zinc-300" />
              </div>
              <div className="flex flex-col items-center">
                <div className="text-center font-mono text-sm font-bold tracking-widest text-zinc-300">DISPATCHER</div>
                <div className="text-[10px] text-zinc-500 font-mono text-center tracking-widest mt-1">ENTRY NODE</div>
              </div>
           </div>

           {/* --- Node 2: Middle Workers (Mapper) --- */}
           <motion.div style={{ opacity: stage1 }} className="flex flex-col items-center gap-6 relative z-10">
              <div className="w-24 h-24 bg-black border border-emerald-500/30 rounded-3xl flex items-center justify-center shadow-[inset_0_0_20px_rgba(16,185,129,0.1),0_0_40px_rgba(16,185,129,0.2)] relative group">
                 <div className="absolute inset-0 rounded-3xl border border-emerald-500 opacity-50 blur-[4px] animate-pulse" />
                 <Activity className="w-10 h-10 text-emerald-400" />
              </div>
              <div className="flex flex-col items-center">
                <div className="text-center font-mono text-sm font-bold tracking-widest text-emerald-400">MAPPER_AGENT</div>
                <div className="text-[10px] text-emerald-500/60 font-mono text-center tracking-widest mt-1">AST PARSING</div>
              </div>
           </motion.div>

           {/* --- Node 3: Right Workers (Profiler & Healer) --- */}
           <div className="flex flex-col gap-16 relative z-10">
              <motion.div style={{ opacity: stage2 }} className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 bg-black border border-cyan-500/30 rounded-3xl flex items-center justify-center shadow-[inset_0_0_20px_rgba(6,182,212,0.1),0_0_40px_rgba(6,182,212,0.2)] relative">
                   <ShieldAlert className="w-10 h-10 text-cyan-400" />
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-center font-mono text-sm font-bold tracking-widest text-cyan-400">PROFILER</div>
                  <div className="text-[10px] text-cyan-500/60 font-mono text-center tracking-widest mt-1">TRACE SEARCH</div>
                </div>
              </motion.div>

              <motion.div style={{ opacity: stage3 }} className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 bg-black border border-red-500/30 rounded-3xl flex items-center justify-center shadow-[inset_0_0_20px_rgba(239,68,68,0.1),0_0_40px_rgba(239,68,68,0.3)] relative group">
                   <div className="absolute inset-0 rounded-3xl border border-red-500/50 blur-[8px] animate-pulse delay-150" />
                   <Wrench className="w-10 h-10 text-red-400 relative z-10" />
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-center font-mono text-sm font-bold tracking-widest text-red-400">AUTO_HEALER</div>
                  <div className="text-[10px] text-red-500/60 font-mono text-center tracking-widest mt-1">SYNTHESIS</div>
                </div>
              </motion.div>
           </div>
           
        </div>
      </div>
    </section>
  );
}
