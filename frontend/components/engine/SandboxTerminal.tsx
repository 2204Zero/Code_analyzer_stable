"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Terminal, CheckCircle2, XCircle, RefreshCw, Cpu } from "lucide-react";

export default function SandboxTerminal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const term1Op = useTransform(scrollYProgress, [0.1, 0.2], [0, 1]);
  const term2Op = useTransform(scrollYProgress, [0.2, 0.3], [0, 1]);
  const term3Op = useTransform(scrollYProgress, [0.3, 0.4], [0, 1]);
  
  const failToFixOp = useTransform(scrollYProgress, [0.5, 0.6], [0, 1]);
  const fixedTermOp = useTransform(scrollYProgress, [0.7, 0.8], [0, 1]);

  return (
    <section ref={containerRef} className="relative h-[250vh] bg-[#09090b] border-t border-zinc-900/50 pb-32">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center px-4 md:px-12">
        
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02),transparent_70%)] pointer-events-none blur-3xl" />

        <div className="mb-16 text-center z-10 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900/50 border border-zinc-800 rounded-full mb-6 text-zinc-400">
            <Cpu className="w-4 h-4" />
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Execution Engine</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Deterministic Sandbox.</h2>
          <p className="text-zinc-400 font-light mt-6 max-w-2xl mx-auto text-lg leading-relaxed">
            Patches are deployed into hyper-threaded virtual execution environments. Massive test suites run in parallel. If a regression occurs, the Auto-Healer intercepts and rewrites the AST dynamically.
          </p>
        </div>

        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 z-10">
           
           {/* Sandbox Thread 1: PASS */}
           <motion.div style={{ opacity: term1Op }} className="bg-[#0c0c0e] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col relative">
             <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
             
             {/* Mac-like Header */}
             <div className="bg-[#18181b] px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
               <div className="flex gap-1.5 mr-4">
                 <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                 <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                 <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
               </div>
               <span className="text-[10px] font-mono text-zinc-500 font-semibold tracking-widest uppercase">Thread_01 // vitest</span>
               <span className="ml-auto text-emerald-500 text-[10px] font-mono flex items-center gap-1 font-bold">
                 <CheckCircle2 className="w-3 h-3" /> PASS
               </span>
             </div>
             
             <div className="p-6 font-mono text-xs text-zinc-400 leading-loose flex-1">
               <div className="text-zinc-600 mb-2">$ vitest run src/utils --parallel</div>
               <div className="text-emerald-500 flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> utils/parser.test.ts <span className="text-zinc-600 ml-auto">142ms</span></div>
               <div className="text-emerald-500 flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> utils/ast.test.ts <span className="text-zinc-600 ml-auto">84ms</span></div>
               <div className="text-emerald-500 flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> utils/memory.test.ts <span className="text-zinc-600 ml-auto">210ms</span></div>
               <div className="mt-4 text-zinc-500 border-t border-zinc-800 pt-2">Test Suites: 3 passed, 3 total</div>
             </div>
           </motion.div>

           {/* Sandbox Thread 2: PASS */}
           <motion.div style={{ opacity: term2Op }} className="bg-[#0c0c0e] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col relative">
             <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
             
             <div className="bg-[#18181b] px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
               <div className="flex gap-1.5 mr-4">
                 <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                 <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                 <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
               </div>
               <span className="text-[10px] font-mono text-zinc-500 font-semibold tracking-widest uppercase">Thread_02 // playwright</span>
               <span className="ml-auto text-emerald-500 text-[10px] font-mono flex items-center gap-1 font-bold">
                 <CheckCircle2 className="w-3 h-3" /> PASS
               </span>
             </div>
             
             <div className="p-6 font-mono text-xs text-zinc-400 leading-loose flex-1">
               <div className="text-zinc-600 mb-2">$ playwright test e2e/</div>
               <div className="text-emerald-500 flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> [chromium] › login.spec.ts <span className="text-zinc-600 ml-auto">1.2s</span></div>
               <div className="text-emerald-500 flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> [webkit] › checkout.spec.ts <span className="text-zinc-600 ml-auto">2.4s</span></div>
               <div className="mt-4 text-zinc-500 border-t border-zinc-800 pt-2">All tests passed.</div>
             </div>
           </motion.div>

           {/* Sandbox Thread 3: FAIL (The Bug) */}
           <div className="relative md:col-span-2 max-w-4xl w-full mx-auto">
             <motion.div style={{ opacity: term3Op }} className="bg-[#0c0c0e] border border-red-900/50 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.05)] h-full relative">
               <div className="absolute inset-0 bg-red-500/5 pointer-events-none animate-pulse" />
               
               <div className="bg-[#18181b] px-4 py-3 border-b border-red-900/50 flex items-center gap-2 relative z-10">
                 <div className="flex gap-1.5 mr-4">
                   <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                   <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                   <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                 </div>
                 <span className="text-[10px] font-mono text-red-500/80 font-semibold tracking-widest uppercase">Thread_03 // jest</span>
                 <span className="ml-auto text-red-500 text-[10px] font-mono flex items-center gap-1 font-bold">
                   <XCircle className="w-3 h-3" /> FAIL
                 </span>
               </div>
               
               <div className="p-6 font-mono text-xs text-zinc-400 leading-loose relative z-10">
                 <div className="text-zinc-600 mb-2">$ jest --runInBand src/api</div>
                 <div className="text-emerald-500 flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> api/users.test.ts</div>
                 <div className="text-red-500 font-bold flex items-center gap-2"><XCircle className="w-3 h-3" /> api/webhook.test.ts <span className="text-red-500/50 font-normal">(Memory Leak Detected)</span></div>
                 <div className="text-red-400 mt-4 bg-red-500/10 p-4 border border-red-500/20 rounded">
                   Fatal Error: Heap usage exceeded 1024MB during loop execution.<br/>
                   Regression caught: O(N²) iteration over database payloads.
                 </div>
               </div>
             </motion.div>

             {/* The Auto-Healer overlay */}
             <motion.div 
               style={{ opacity: failToFixOp }}
               className="absolute inset-0 bg-black/90 backdrop-blur-md border border-cyan-500/30 rounded-xl flex flex-col items-center justify-center z-20"
             >
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20" />
                  <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin mb-6 relative z-10" />
                </div>
                <div className="text-cyan-400 font-mono text-sm tracking-[0.2em] font-bold drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">AUTO_HEALER INTERCEPT</div>
                <div className="text-zinc-400 font-mono text-xs mt-3 bg-zinc-900/50 px-4 py-1.5 rounded-full border border-zinc-800">Re-synthesizing AST for O(1) complexity...</div>
             </motion.div>
             
             {/* The Fixed Terminal */}
             <motion.div 
               style={{ opacity: fixedTermOp }}
               className="absolute inset-0 bg-[#0c0c0e] border border-emerald-500/50 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)] z-30 flex flex-col"
             >
               <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
               <div className="bg-[#18181b] px-4 py-3 border-b border-emerald-500/30 flex items-center gap-2 relative z-10">
                 <div className="flex gap-1.5 mr-4">
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                   <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                   <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                 </div>
                 <span className="text-[10px] font-mono text-emerald-500 font-semibold tracking-widest uppercase drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">Thread_03 // healed</span>
                 <span className="ml-auto text-emerald-500 text-[10px] font-mono flex items-center gap-1 font-bold">
                   <CheckCircle2 className="w-3 h-3" /> PASS
                 </span>
               </div>
               
               <div className="p-6 font-mono text-xs text-zinc-400 leading-loose flex-1 relative z-10">
                 <div className="text-zinc-600 mb-2">$ jest --runInBand src/api</div>
                 <div className="text-emerald-500 flex items-center gap-2 opacity-50"><CheckCircle2 className="w-3 h-3" /> api/users.test.ts</div>
                 <div className="text-emerald-400 font-bold flex items-center gap-2 bg-emerald-500/10 -mx-4 px-4 py-2 border-l-2 border-emerald-500 my-2">
                    <CheckCircle2 className="w-3 h-3" /> api/webhook.test.ts <span className="text-emerald-500/60 font-normal ml-2">(Dynamically Healed)</span>
                 </div>
                 <div className="text-zinc-400 mt-4 border-t border-zinc-800 pt-4">
                   &gt; Heap usage stabilized (45MB).<br/>
                   &gt; Time complexity validated: O(1).
                 </div>
                 <div className="text-white font-bold tracking-widest mt-6 flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                   READY FOR MERGE
                 </div>
               </div>
             </motion.div>
           </div>

        </div>
      </div>
    </section>
  );
}
