"use client";
import { motion } from "framer-motion";

export default function EngineHero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-[#09090b]">
      
      {/* High-Fidelity Backgrounds */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent_70%)] blur-[100px]" />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        {/* Animated Scanline */}
        <motion.div 
          animate={{ top: ["-10%", "110%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 w-full h-32 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent pointer-events-none"
        />
      </div>
      
      <div className="relative z-10 flex flex-col items-center gap-8 mt-16 px-4 w-full max-w-7xl">
        
        {/* Top Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px] sm:text-xs tracking-[0.25em] text-zinc-300 font-bold uppercase">
            Vertex.AI Core Engine
          </span>
        </motion.div>
        
        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-center relative"
        >
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-600 leading-[0.9]">
            THE SWARM
          </h1>
          {/* Subtle reflection/shadow for brutalist depth */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-white/5 leading-[0.9] absolute top-4 left-0 w-full blur-xl -z-10">
            THE SWARM
          </h1>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-zinc-400 font-medium text-lg md:text-2xl max-w-3xl text-center leading-relaxed tracking-tight"
        >
          A highly deterministic, multi-agent architecture built to ingest, map, and autonomously heal complex codebases at infinite scale.
        </motion.p>

      </div>
      
      {/* Brutalist Telemetry HUD */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-8 w-[95%] max-w-6xl mx-auto border border-zinc-800/50 bg-[#09090b]/80 backdrop-blur-xl rounded-2xl flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-800/50 z-20 shadow-2xl overflow-hidden"
      >
         <div className="flex-1 p-8 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="text-4xl lg:text-5xl font-black text-white font-mono tracking-tighter">1.2<span className="text-zinc-600">M</span></div>
            <div className="text-[10px] md:text-xs text-zinc-500 font-mono mt-3 tracking-[0.2em] uppercase font-semibold">Token Context Window</div>
         </div>
         <div className="flex-1 p-8 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="text-4xl lg:text-5xl font-black text-emerald-400 font-mono tracking-tighter">&lt;400<span className="text-emerald-900">ms</span></div>
            <div className="text-[10px] md:text-xs text-zinc-500 font-mono mt-3 tracking-[0.2em] uppercase font-semibold">Inference Latency</div>
         </div>
         <div className="flex-1 p-8 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="text-4xl lg:text-5xl font-black text-white font-mono tracking-tighter">128<span className="text-zinc-600">x</span></div>
            <div className="text-[10px] md:text-xs text-zinc-500 font-mono mt-3 tracking-[0.2em] uppercase font-semibold">Concurrent Sandboxes</div>
         </div>
      </motion.div>
    </section>
  );
}
