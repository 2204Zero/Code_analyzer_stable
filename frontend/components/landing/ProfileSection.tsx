"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ShieldAlert, Activity, FileCode, Box } from "lucide-react";

export default function ProfileSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // --- 1. The Sonar/Radar Ping ---
  const radarScale = useTransform(scrollYProgress, [0.1, 0.4], [0, 4]);
  const radarOpacity = useTransform(scrollYProgress, [0.1, 0.25], [0, 0.8]);

  // --- 2. Z-Axis Parallax (Depth of Field for Safe Nodes) ---
  const safeNodesOpacity = useTransform(scrollYProgress, [0.4, 0.6], [1, 0.2]);
  const safeNodesScale = useTransform(scrollYProgress, [0.4, 0.6], [1, 0.4]);
  const safeNodesY = useTransform(scrollYProgress, [0.4, 0.6], [0, -200]);

  // --- 3. The Target Node (Isolation & Glitch Physics) ---
  const targetScale = useTransform(scrollYProgress, [0.4, 0.6], [1, 1.4]);
  const targetY = useTransform(scrollYProgress, [0.4, 0.6], [100, 0]);
  
  // The Glitch triggers precisely between 0.58 and 0.62 as the node gets flagged
  const targetX = useTransform(scrollYProgress, 
    [0.4, 0.58, 0.59, 0.60, 0.61, 0.62], 
    [140, 0, -15, 15, -8, 0]
  );
  
  // 4. The Threat Detection (Turns stark red)
  // Explicitly clamping arrays with [0, 0.59, 0.62, 1] to prevent Framer Motion from extrapolating past 1.0
  const hudOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);
  const targetBorder = useTransform(scrollYProgress, [0, 0.59, 0.62, 1], ["#27272a", "#27272a", "#ef4444", "#ef4444"]);
  const targetText = useTransform(scrollYProgress, [0, 0.59, 0.62, 1], ["#a1a1aa", "#a1a1aa", "#f87171", "#f87171"]);
  
  // Left Column Alarm Sync (Turns typography red when threat is found)
  const phaseColor = useTransform(scrollYProgress, [0, 0.59, 0.62, 1], ["#10b981", "#10b981", "#ef4444", "#ef4444"]);
  const highlightColor = useTransform(scrollYProgress, [0, 0.59, 0.62, 1], ["#34d399", "#34d399", "#f87171", "#f87171"]);
  const hudBorder = useTransform(scrollYProgress, [0, 0.59, 0.62, 1], ["rgba(39,39,42,1)", "rgba(39,39,42,1)", "rgba(239,68,68,0.4)", "rgba(239,68,68,0.4)"]);
  
  // Telemetry HUD Opacity Locks
  const huntingOpacity = useTransform(scrollYProgress, [0, 0.59, 0.6, 1], [1, 1, 0, 0]);
  const threatOpacity = useTransform(scrollYProgress, [0, 0.59, 0.6, 1], [0, 0, 1, 1]);

  // Chromatic Aberration Shadow during glitch, settling into Stark Red
  const targetShadow = useTransform(scrollYProgress, 
    [0.4, 0.58, 0.59, 0.60, 0.61, 0.62, 0.7], 
    [
      "0px 0px 0px rgba(0,0,0,0)", 
      "0px 0px 0px rgba(0,0,0,0)",
      "-8px 0px 0px rgba(6,182,212,0.8), 8px 0px 0px rgba(239,68,68,0.8)", // Cyan/Red split
      "8px 0px 0px rgba(6,182,212,0.8), -8px 0px 0px rgba(239,68,68,0.8)",
      "-4px 0px 0px rgba(6,182,212,0.8), 4px 0px 0px rgba(239,68,68,0.8)",
      "0px 0px 50px rgba(239,68,68,0.3)", // Lock to red
      "0px 0px 50px rgba(239,68,68,0.4)"
    ]
  );

  // Volumetric Room Lighting (Shifts on detection)
  const ambientLight = useTransform(scrollYProgress, 
    [0.5, 0.62], 
    ["rgba(16,185,129,0.02)", "rgba(239,68,68,0.15)"]
  );

  // --- 5. The X-Ray Code Reveal ---
  const codeOpacity = useTransform(scrollYProgress, [0.62, 0.68], [0, 1]);
  const codeHeight = useTransform(scrollYProgress, [0.62, 0.68], ["0px", "90px"]);

  // --- 6. Data Hemorrhage (Particles) ---
  const particleOpacity = useTransform(scrollYProgress, [0.65, 0.7], [0, 1]);

  // --- 7. Live Terminal Typing Sync ---
  const terminalOpacity = useTransform(scrollYProgress, [0.68, 0.7], [0, 1]);
  const terminalY = useTransform(scrollYProgress, [0.68, 0.7], [20, 0]);
  
  // Staggered lines for the typing effect
  const termLine1 = useTransform(scrollYProgress, [0.7, 0.73], [0, 1]);
  const termLine2 = useTransform(scrollYProgress, [0.73, 0.76], [0, 1]);
  const termLine3 = useTransform(scrollYProgress, [0.76, 0.8], [0, 1]);

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-[#09090B] text-white">
      
      {/* The Sticky Canvas */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden px-4 md:px-8">
        
        {/* Volumetric Ambient Glow */}
        <motion.div 
          style={{ backgroundColor: ambientLight }}
          className="absolute inset-0 z-0 pointer-events-none blur-[120px]"
        />

        {/* Subtle Dark Grid Background */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-20"
          style={{ 
            backgroundImage: 'radial-gradient(circle at center, #3f3f46 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 z-10 relative">
          
          {/* Left Column: Typography & Narrative */}
          <div className="flex flex-col gap-6 relative z-20">
            <div className="inline-flex items-center gap-3">
              <motion.div style={{ backgroundColor: phaseColor }} className="w-8 h-[1px]" />
              <motion.span style={{ color: phaseColor }} className="font-mono text-sm tracking-[0.2em] uppercase font-semibold">Phase 02</motion.span>
            </div>
            <h2 className="text-5xl lg:text-8xl font-extrabold tracking-tighter text-white leading-[0.9]">
              Profile.
            </h2>
            <p className="text-2xl md:text-3xl text-zinc-300 font-light max-w-md tracking-tight leading-snug mt-4">
              Millisecond telemetry.<br />
              <motion.span style={{ color: highlightColor }} className="font-semibold">Zero overhead.</motion.span>
            </p>
            <p className="text-base text-zinc-500 max-w-md leading-relaxed mt-2 font-medium">
              We trace the runtime execution path of your graph, overlaying live performance 
              metrics directly onto the architecture to pinpoint exact O(N²) bottlenecks.
            </p>

            {/* Swarm Telemetry HUD (Moved to Left Column to prevent layout chaos) */}
            <motion.div 
              style={{ 
                opacity: hudOpacity,
                borderColor: hudBorder
              }}
              className="mt-4 lg:mt-8 flex flex-col gap-4 font-mono text-xs tracking-widest bg-[#18181b]/80 p-6 w-full max-w-md border-2 rounded-xl shadow-2xl backdrop-blur-md"
            >
              <div className="flex justify-between gap-8 text-zinc-500">
                <span>AGENTS_DISPATCHED</span>
                <span className="text-zinc-300 font-bold">4,092</span>
              </div>
              <div className="flex justify-between gap-8 text-zinc-500">
                <span>NODES_TRAVERSED</span>
                <span className="text-zinc-300 font-bold">142K/SEC</span>
              </div>
              <div className="flex justify-between gap-8 text-zinc-500">
                <span>HEURISTICS</span>
                <span className="text-zinc-300 font-bold">DEEPSEEK-V3</span>
              </div>
              <div className="w-full h-[1px] bg-zinc-800 my-2" />
              
              <div className="flex justify-between gap-8 items-center relative h-5">
                <span className="text-zinc-500">STATUS</span>
                {/* HUNTING STATE */}
                <motion.span 
                  style={{ opacity: huntingOpacity }}
                  className="absolute right-0 text-emerald-500 font-bold flex items-center gap-2 text-[10px] lg:text-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  HUNTING_
                </motion.span>
                {/* THREAT LOCK STATE */}
                <motion.span 
                  style={{ opacity: threatOpacity }}
                  className="absolute right-0 text-red-500 font-bold flex items-center gap-2 text-[10px] lg:text-sm drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  THREAT_LOCK
                </motion.span>
              </div>
            </motion.div>
          </div>
          {/* Right Column: The Scroll-Jacked 3D Animation */}
          <div className="relative w-full h-[350px] lg:h-[600px] flex items-center justify-center">
            
            <div className="relative w-full h-full flex items-center justify-center scale-[0.55] sm:scale-75 lg:scale-100 origin-center">
              {/* The Sonar/Radar Sweep */}
              <motion.div 
                style={{ scale: radarScale, opacity: radarOpacity }}
                className="absolute w-[200px] h-[200px] rounded-full border border-emerald-500/50 bg-emerald-500/5 z-0"
              />
              <motion.div 
                style={{ scale: radarScale, opacity: radarOpacity }}
                className="absolute w-[100px] h-[100px] rounded-full border border-emerald-500/30 z-0"
              />

              {/* The Safe Nodes Cluster (Parallax Z-Axis) */}
              <motion.div 
                style={{ opacity: safeNodesOpacity, scale: safeNodesScale, y: safeNodesY }}
                className="absolute z-10 w-full h-full flex items-center justify-center pointer-events-none"
              >
                <div className="absolute top-[20%] left-[20%] bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center gap-3 w-44 shadow-lg">
                  <Box className="w-4 h-4 text-zinc-500" />
                  <span className="font-mono text-xs text-zinc-400">utils/parser.ts</span>
                </div>
                <div className="absolute top-[70%] left-[30%] bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center gap-3 w-44 shadow-lg">
                  <Activity className="w-4 h-4 text-zinc-500" />
                  <span className="font-mono text-xs text-zinc-400">lib/logger.ts</span>
                </div>
                <div className="absolute top-[30%] right-[20%] bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center gap-3 w-44 shadow-lg">
                  <FileCode className="w-4 h-4 text-zinc-500" />
                  <span className="font-mono text-xs text-zinc-400">types/index.d.ts</span>
                </div>
              </motion.div>

              {/* The Target Node (The Vulnerability) */}
              <motion.div 
                style={{ 
                  x: targetX, 
                  y: targetY, 
                  scale: targetScale, 
                  borderColor: targetBorder,
                  boxShadow: targetShadow
                }}
                className="absolute z-30 bg-[#09090b] border-2 rounded-xl p-4 flex flex-col w-64 shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div style={{ color: targetText }}>
                      <ShieldAlert className="w-5 h-5" />
                    </motion.div>
                    <motion.span style={{ color: targetText }} className="font-mono text-sm font-bold tracking-tight">
                      api/webhook.ts
                    </motion.span>
                  </div>
                  <motion.span style={{ color: targetText }} className="text-[10px] font-mono font-bold border border-current px-1.5 py-0.5 rounded">
                    O(N²)
                  </motion.span>
                </div>
                
                {/* The X-Ray Code Reveal */}
                <motion.div 
                  style={{ height: codeHeight, opacity: codeOpacity }} 
                  className="mt-3 pt-3 border-t border-zinc-800/50 font-mono text-[9px] leading-[1.6] w-[85vw] lg:w-96"
                >
                  <div className="text-zinc-500">export async function handle(req) {"{"}</div>
                  <div className="text-zinc-500 pl-2">const users = await getUsers();</div>
                  <div className="text-zinc-500 pl-2">users.forEach(user =&gt; {"{"}</div>
                  
                  {/* The highlighted bottleneck */}
                  <div className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded mt-0.5 mb-0.5 font-bold border-l-2 border-red-500 -ml-1 pl-3">
                    // Bottleneck: DB query inside loop
                    const logs = await getLogs(user.id);
                  </div>
                  
                  <div className="text-zinc-500 pl-2">{"}"});</div>
                  <div className="text-zinc-500">{"}"}</div>
                </motion.div>

                {/* Data Hemorrhage Particles */}
                <motion.div style={{ opacity: particleOpacity }} className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-2 right-2 w-1 h-1 bg-red-500 rounded-full animate-ping" />
                  <div className="absolute bottom-4 -left-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce delay-75" />
                  <div className="absolute top-1/2 -right-1 w-1 h-1 bg-red-400 rounded-full animate-pulse delay-150" />
                </motion.div>

              </motion.div>

              {/* The Diagnosis Terminal (Live Typing Sync) */}
              <motion.div 
                style={{ opacity: terminalOpacity, y: terminalY }} 
                className="absolute left-[55%] md:left-[60%] top-[45%] bg-black border border-red-500/30 p-5 rounded-lg w-72 md:w-80 shadow-2xl z-40 backdrop-blur-xl"
              >
                <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-500 text-xs font-mono font-bold tracking-widest">THREAT DETECTED</span>
                </div>
                
                <div className="text-zinc-400 font-mono text-[11px] leading-relaxed flex flex-col gap-2">
                  <motion.div style={{ opacity: termLine1 }}>
                    <span className="text-emerald-500">&gt;</span> Profiling AST paths...
                  </motion.div>
                  
                  <motion.div style={{ opacity: termLine2 }}>
                    <span className="text-emerald-500">&gt;</span> Analyzing runtime complexity...
                  </motion.div>
                  
                  <motion.div style={{ opacity: termLine3 }} className="text-red-400 font-semibold bg-red-500/5 p-2 rounded border border-red-500/10">
                    [CRITICAL] SQL query embedded in array iteration (Line 142). Execution time scales exponentially (O(N²)) with user payload.
                  </motion.div>
                </div>
              </motion.div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
