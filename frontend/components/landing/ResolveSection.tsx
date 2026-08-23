"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { GitMerge, FileCode2, CheckCircle2, ArrowRight } from "lucide-react";

export default function ResolveSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // --- Immersion Physics ---

  // 1. Diff Viewer Entrance
  const diffOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);
  const diffY = useTransform(scrollYProgress, [0.1, 0.3], [100, 0]);
  const graphOpacity = useTransform(scrollYProgress, [0.3, 0.4], [0, 1]);
  const graphY = useTransform(scrollYProgress, [0.3, 0.4], [20, 0]);

  // 2. The Auto-Healer Fix (Reveals the green synthesized code)
  const fixHeight = useTransform(scrollYProgress, [0.35, 0.65], ["0px", "190px"]);
  const fixOpacity = useTransform(scrollYProgress, [0.35, 0.4], [0, 1]);

  // 3. The Deletion Strike-through (Strikes out the red code once fixed)
  const strikeOpacity = useTransform(scrollYProgress, [0.55, 0.65], [0, 1]);
  const strikeWidth = useTransform(scrollYProgress, [0.55, 0.65], ["0%", "100%"]);
  const redBlockOpacity = useTransform(scrollYProgress, [0.55, 0.65], [1, 0.8]);

  // 4. The Mechanical Stamp (Locks into place)
  const stampScale = useTransform(scrollYProgress, [0.7, 0.8], [3, 1]);
  const stampOpacity = useTransform(scrollYProgress, [0.7, 0.8], [0, 1]);
  const stampShadow = useTransform(scrollYProgress, [0.7, 0.85], 
    ["0px 0px 0px rgba(16,185,129,0)", "0px 20px 40px rgba(16,185,129,0.2)"]
  );

  // 5. LLM Typing Effect (Staggered green lines)
  const gLine1 = useTransform(scrollYProgress, [0.35, 0.40], [0, 1]);
  const gLine2 = useTransform(scrollYProgress, [0.40, 0.45], [0, 1]);
  const gLine3 = useTransform(scrollYProgress, [0.45, 0.50], [0, 1]);
  const gLine4 = useTransform(scrollYProgress, [0.50, 0.55], [0, 1]);
  const gLine5 = useTransform(scrollYProgress, [0.55, 0.60], [0, 1]);
  const gLine6 = useTransform(scrollYProgress, [0.60, 0.65], [0, 1]);

  // Magnetic 3D Tilt Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { damping: 30, stiffness: 200 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { damping: 30, stiffness: 200 });

  // 6. Graph Path and Stroke hooks
  const graphPath = useTransform(scrollYProgress, [0, 0.39, 0.6, 1], [
    "M 0 100 C 20 100, 30 -50, 50 -50 C 70 -50, 80 100, 100 100", // Hold Spike
    "M 0 100 C 20 100, 30 -50, 50 -50 C 70 -50, 80 100, 100 100", // Start Morph
    "M 0 100 C 20 100, 30 85, 50 85 C 70 85, 80 100, 100 100",    // Flat O(1) Stable
    "M 0 100 C 20 100, 30 85, 50 85 C 70 85, 80 100, 100 100"     // Hold Flat
  ]);
  const graphStroke = useTransform(scrollYProgress, [0, 0.39, 0.6, 1], ["#ef4444", "#ef4444", "#10b981", "#10b981"]);

  // 7. Pipeline Steps Opacity and Scale hooks
  const step1Opacity = useTransform(scrollYProgress, [0.1, 0.2], [0.2, 1]);
  const step1Scale = useTransform(scrollYProgress, [0.1, 0.2], [0, 1]);
  const step2Opacity = useTransform(scrollYProgress, [0.2, 0.3], [0.2, 1]);
  const step2Scale = useTransform(scrollYProgress, [0.2, 0.3], [0, 1]);
  const step3Opacity = useTransform(scrollYProgress, [0.3, 0.5], [0.2, 1]);
  const step3Scale = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);
  const step4Opacity = useTransform(scrollYProgress, [0.5, 0.6], [0.2, 1]);
  const step4Scale = useTransform(scrollYProgress, [0.5, 0.6], [0, 1]);
  const step5Opacity = useTransform(scrollYProgress, [0.6, 0.7], [0.2, 1]);
  const step5Scale = useTransform(scrollYProgress, [0.6, 0.7], [0, 1]);

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-white text-black border-t border-zinc-200">
      
      {/* The Sticky Canvas */}
      <div 
        className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden px-4 md:px-8 perspective-1000"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
          mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
        }}
        onMouseLeave={() => {
          mouseX.set(0);
          mouseY.set(0);
        }}
      >
        
        {/* Subtle Light Grid Background */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-40"
          style={{ 
            backgroundImage: 'radial-gradient(circle at center, #d4d4d8 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center z-10 relative">
          
          {/* Left Column: Typography & Narrative */}
          <div className="flex flex-col gap-6 relative z-20">
            <div className="inline-flex items-center gap-3">
              <div className="w-8 h-[1px] bg-zinc-900" />
              <span className="text-zinc-500 font-mono text-sm tracking-[0.2em] uppercase font-semibold">Phase 03</span>
            </div>
            <h2 className="text-5xl lg:text-8xl font-extrabold tracking-tighter text-zinc-900 leading-[0.9]">
              Resolve.
            </h2>
            <p className="text-2xl md:text-3xl text-zinc-800 font-light max-w-md tracking-tight leading-snug mt-4">
              We don't just alert you.<br />
              <span className="font-semibold text-emerald-600">We synthesize the patch.</span>
            </p>
            <p className="text-base text-zinc-500 max-w-md leading-relaxed mt-2 font-medium">
              Once an architectural vulnerability is flagged, the Auto-Healer agent rewrites 
              the algorithmic flow, resolves dependencies, and pre-compiles the optimal O(1) patch for a 1-click merge.
            </p>

            {/* The Agentic CI/CD Pipeline (Moved to Left Column for layout stability) */}
            <div className="relative flex flex-col gap-6 mt-4 lg:mt-8">
              {/* Step 1 */}
              <motion.div style={{ opacity: step1Opacity }} className="flex items-center gap-5">
                <div className="relative flex items-center justify-center">
                  <motion.div style={{ scale: step1Scale }} className="absolute w-8 h-8 rounded-full bg-emerald-500/20" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500 z-10 shadow-[0_0_10px_#10b981]" />
                </div>
                <span className="font-mono text-xs tracking-widest font-bold text-zinc-600">AST PARSED</span>
              </motion.div>

              {/* Step 2 */}
              <motion.div style={{ opacity: step2Opacity }} className="flex items-center gap-5">
                <div className="relative flex items-center justify-center">
                  <motion.div style={{ scale: step2Scale }} className="absolute w-8 h-8 rounded-full bg-emerald-500/20" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500 z-10 shadow-[0_0_10px_#10b981]" />
                </div>
                <span className="font-mono text-xs tracking-widest font-bold text-zinc-600">FLAW ISOLATED</span>
              </motion.div>

              {/* Step 3 */}
              <motion.div style={{ opacity: step3Opacity }} className="flex items-center gap-5">
                <div className="relative flex items-center justify-center">
                  <motion.div style={{ scale: step3Scale }} className="absolute w-8 h-8 rounded-full bg-emerald-500/20" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500 z-10 shadow-[0_0_10px_#10b981]" />
                </div>
                <span className="font-mono text-xs tracking-widest font-bold text-zinc-600">O(1) PATCH SYNTHESIZED</span>
              </motion.div>

              {/* Step 4 */}
              <motion.div style={{ opacity: step4Opacity }} className="flex items-center gap-5">
                <div className="relative flex items-center justify-center">
                  <motion.div style={{ scale: step4Scale }} className="absolute w-8 h-8 rounded-full bg-emerald-500/20" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500 z-10 shadow-[0_0_10px_#10b981]" />
                </div>
                <span className="font-mono text-xs tracking-widest font-bold text-zinc-600">VIRTUAL TESTS</span>
              </motion.div>

              {/* Step 5 */}
              <motion.div style={{ opacity: step5Opacity }} className="flex items-center gap-5">
                <div className="relative flex items-center justify-center">
                  <motion.div style={{ scale: step5Scale }} className="absolute w-8 h-8 rounded-full bg-emerald-500/20" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500 z-10 shadow-[0_0_10px_#10b981]" />
                </div>
                <span className="font-mono text-xs tracking-widest font-bold text-zinc-600">PATCH READY</span>
              </motion.div>
              {/* Connecting Line */}
              <div className="absolute left-[5px] top-4 bottom-4 w-[2px] bg-emerald-200 -z-10" />
            </div>
          </div>

          {/* Right Column: The Scroll-Jacked 3D Animation */}
          <div className="relative w-[90vw] md:w-full h-[350px] lg:h-[600px] flex items-center justify-center -ml-4 md:ml-0 overflow-x-hidden md:overflow-visible">
            
            <div className="relative w-full h-full flex items-center justify-center scale-[0.6] sm:scale-75 lg:scale-100 origin-center">
              {/* The Fix Application (Diff Viewer) */}
              <motion.div 
                style={{ 
                  opacity: diffOpacity,
                  y: diffY,
                  rotateX: rotateX,
                  rotateY: rotateY,
                }}
                className="relative z-10 w-full max-w-lg bg-white border border-zinc-200 shadow-2xl rounded-xl overflow-hidden flex flex-col"
              >
                
                {/* Embedded Live Graph (Absolute positioned overlapping the corner) */}
                <motion.div 
                  style={{ opacity: graphOpacity, y: graphY }}
                  className="absolute -right-8 -top-8 z-30 pointer-events-none hidden md:block"
                >
                  <div className="text-[10px] font-bold text-zinc-500 mb-2 font-mono uppercase tracking-widest bg-white/80 px-2 py-1 rounded backdrop-blur inline-block shadow-sm">Latency (ms)</div>
                  <svg width="140" height="80" viewBox="0 0 140 80" className="overflow-visible drop-shadow-xl bg-white/50 backdrop-blur-sm rounded-xl p-2 border border-zinc-100">
                    {/* Grid */}
                    <path d="M 0 20 L 140 20 M 0 40 L 140 40 M 0 60 L 140 60" fill="none" stroke="#f4f4f5" strokeWidth="1" />
                    
                    {/* Dynamic Performance Path */}
                    <motion.path 
                      d={graphPath}
                      fill="none" 
                      stroke={graphStroke}
                      strokeWidth="5" 
                      strokeLinecap="round"
                      style={{ filter: 'drop-shadow(0px 6px 8px rgba(0,0,0,0.15))' }}
                    />
                  </svg>
                </motion.div>

                {/* Diff Header */}
                <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-zinc-400" />
                    <span className="font-mono text-xs font-semibold text-zinc-700">api/webhook.ts</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">- 4 deletions</span>
                    <span className="font-mono text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">+ 5 additions</span>
                  </div>
                </div>

                {/* The Code Body */}
                <div className="flex flex-col bg-white font-mono text-[9px] md:text-[11px] leading-relaxed select-none overflow-x-auto">
                  
                  {/* Context Lines */}
                  <div className="flex px-4 py-1 text-zinc-400">
                    <span className="w-6 text-right mr-4 select-none opacity-50">140</span>
                    <span className="text-zinc-600">export async function handle(req) {"{"}</span>
                  </div>

                  {/* The Red Block (Vulnerability) */}
                  <motion.div style={{ opacity: redBlockOpacity }} className="relative bg-red-50/50 flex flex-col group">
                    {/* Strike-through line */}
                    <motion.div 
                      style={{ opacity: strikeOpacity, width: strikeWidth }}
                      className="absolute left-10 top-1/2 h-[1.5px] bg-red-500 z-20 pointer-events-none"
                    />
                    
                    <div className="flex px-4 py-1 text-red-700">
                      <span className="w-6 text-right mr-4 select-none opacity-50">-</span>
                      <span>const users = await getUsers();</span>
                    </div>
                    <div className="flex px-4 py-1 text-red-700">
                      <span className="w-6 text-right mr-4 select-none opacity-50">-</span>
                      <span>users.forEach(async (user) =&gt; {"{"}</span>
                    </div>
                    <div className="flex px-4 py-1 text-red-800 bg-red-100/50">
                      <span className="w-6 text-right mr-4 select-none opacity-50">-</span>
                      <span className="font-semibold">// [CRITICAL] Database Query inside loop</span>
                    </div>
                    <div className="flex px-4 py-1 text-red-700 bg-red-100/50">
                      <span className="w-6 text-right mr-4 select-none opacity-50">-</span>
                      <span className="font-semibold pl-4">const logs = await getLogs(user.id);</span>
                    </div>
                    <div className="flex px-4 py-1 text-red-700">
                      <span className="w-6 text-right mr-4 select-none opacity-50">-</span>
                      <span>{"});"}</span>
                    </div>
                  </motion.div>

                  {/* The Green Block (LLM Typing Effect via Scroll) */}
                  <motion.div 
                    style={{ height: fixHeight, opacity: fixOpacity }}
                    className="bg-emerald-50/50 flex flex-col overflow-hidden border-l-[3px] border-emerald-500 relative"
                  >
                    <motion.div style={{ opacity: gLine1 }} className="flex px-4 py-1 text-emerald-700">
                      <span className="w-6 text-right mr-4 select-none opacity-50">+</span>
                      <span>const users = await getUsers();</span>
                    </motion.div>
                    <motion.div style={{ opacity: gLine2 }} className="flex px-4 py-1 text-emerald-700">
                      <span className="w-6 text-right mr-4 select-none opacity-50">+</span>
                      <span>const userIds = users.map(u =&gt; u.id);</span>
                    </motion.div>
                    <motion.div style={{ opacity: gLine3 }} className="flex px-4 py-1 text-emerald-800 bg-emerald-100/50">
                      <span className="w-6 text-right mr-4 select-none opacity-50">+</span>
                      <span className="font-semibold">// [SYNTHESIZED] O(1) Batch Lookup</span>
                    </motion.div>
                    <motion.div style={{ opacity: gLine4 }} className="flex px-4 py-1 text-emerald-700 bg-emerald-100/50">
                      <span className="w-6 text-right mr-4 select-none opacity-50">+</span>
                      <span className="font-semibold text-emerald-800">const logsMap = await getLogsBatch(userIds);</span>
                    </motion.div>
                    <motion.div style={{ opacity: gLine5 }} className="flex px-4 py-1 text-emerald-700">
                      <span className="w-6 text-right mr-4 select-none opacity-50">+</span>
                      <span>users.forEach(user =&gt; {"{"}</span>
                    </motion.div>
                    <motion.div style={{ opacity: gLine6 }} className="flex px-4 py-1 text-emerald-700">
                      <span className="w-6 text-right mr-4 select-none opacity-50">+</span>
                      <span className="pl-4 flex items-center">
                        const logs = logsMap.get(user.id);
                        <motion.span 
                          animate={{ opacity: [1, 0] }} 
                          transition={{ repeat: Infinity, duration: 0.8 }}
                          className="inline-block w-1.5 h-3.5 bg-emerald-500 ml-1"
                        />
                      </span>
                    </motion.div>
                  </motion.div>

                  {/* Context Lines */}
                  <div className="flex px-4 py-2 text-zinc-400">
                    <span className="w-6 text-right mr-4 select-none opacity-50">147</span>
                    <span className="text-zinc-600">{"}"}</span>
                  </div>

                </div>
              </motion.div>

              {/* The Mechanical Merge Stamp */}
              <motion.div 
                style={{ scale: stampScale, opacity: stampOpacity, boxShadow: stampShadow, rotateX, rotateY }}
                className="absolute z-20 left-1/2 md:-right-8 top-3/4 md:top-[70%] -translate-x-1/2 md:translate-x-0 bg-white border-2 border-emerald-500 rounded-xl px-5 py-3 flex items-center gap-3 backdrop-blur-md"
              >
                <div className="bg-emerald-100 p-1.5 rounded-full">
                  <GitMerge className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-extrabold text-emerald-600 tracking-wider">PATCH SYNTHESIZED</span>
                  <span className="font-mono text-[9px] text-zinc-500">READY TO MERGE</span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-2" />
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
