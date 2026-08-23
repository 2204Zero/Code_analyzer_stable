"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useMemo } from "react";
import { Search, Database, Fingerprint } from "lucide-react";

export default function VectorSpace() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const searchWidth = useTransform(scrollYProgress, [0.1, 0.3], ["0%", "100%"]);
  const searchOpacity = useTransform(scrollYProgress, [0.1, 0.2], [0, 1]);
  
  const cluster1Scale = useTransform(scrollYProgress, [0.3, 0.4], [1, 3]);
  const cluster1Color = useTransform(scrollYProgress, [0.3, 0.4], ["#27272a", "#10b981"]);
  const cluster1Opacity = useTransform(scrollYProgress, [0.3, 0.4], [0.2, 1]);

  const cluster2Scale = useTransform(scrollYProgress, [0.5, 0.6], [1, 3]);
  const cluster2Color = useTransform(scrollYProgress, [0.5, 0.6], ["#27272a", "#06b6d4"]);
  const cluster2Opacity = useTransform(scrollYProgress, [0.5, 0.6], [0.2, 1]);

  const c1Y = useTransform(scrollYProgress, [0.3, 0.4], [50, 0]);
  const c2Y = useTransform(scrollYProgress, [0.5, 0.6], [50, 0]);

  // Generate a deterministic but organic looking point cloud
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 400; i++) {
      const angle = (i * 137.5) * (Math.PI / 180);
      const radius = 2 + Math.sqrt(i) * 3;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      const isCluster1 = (x > 15 && x < 35 && y > -20 && y < 0);
      const isCluster2 = (x > -40 && x < -20 && y > 10 && y < 30);
      
      pts.push({ id: i, x, y, isCluster1, isCluster2 });
    }
    return pts;
  }, []);

  return (
    <section ref={containerRef} className="relative h-[250vh] bg-[#09090b] text-white">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4">
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(9,9,11,1)_70%)] z-10 pointer-events-none" />

        <div className="absolute top-20 text-center z-30 w-full px-4">
           <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white drop-shadow-xl">RAG Memory Core</h2>
           <p className="text-zinc-400 font-medium mt-3 max-w-2xl mx-auto">
             Millions of syntax trees embedded into a continuous 3D vector space. Instant context retrieval for identical historical vulnerabilities.
           </p>
        </div>

        {/* 3D Point Cloud Simulation */}
        <div className="absolute inset-0 flex items-center justify-center z-0">
           <div 
             className="w-full h-full flex items-center justify-center relative"
             style={{ perspective: "1000px" }}
           >
              <div 
                className="relative w-[100vw] h-[100vw] md:w-[50vw] md:h-[50vw] max-w-[800px] max-h-[800px]"
                style={{ transform: "rotateX(60deg) rotateZ(-20deg) translateY(20%)" }}
              >
                {points.map((p) => (
                   <motion.div 
                     key={p.id}
                     style={{
                       left: `calc(50% + ${p.x}%)`,
                       top: `calc(50% + ${p.y}%)`,
                       scale: p.isCluster1 ? cluster1Scale : p.isCluster2 ? cluster2Scale : 1,
                       backgroundColor: p.isCluster1 ? cluster1Color : p.isCluster2 ? cluster2Color : "#27272a",
                       opacity: p.isCluster1 ? cluster1Opacity : p.isCluster2 ? cluster2Opacity : 0.2
                     }}
                     className="absolute w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors duration-500"
                   />
                ))}
              </div>
           </div>
        </div>

        {/* Search Input Simulation */}
        <motion.div 
          style={{ opacity: searchOpacity }}
          className="relative z-30 w-full max-w-2xl mt-40 md:mt-32 bg-[#0c0c0e] border border-zinc-800 rounded-xl p-4 shadow-2xl flex items-center gap-4"
        >
          <Search className="w-5 h-5 text-emerald-500 animate-pulse" />
          <div className="relative h-6 flex-1 overflow-hidden">
             <motion.div 
               style={{ width: searchWidth }} 
               className="absolute right-0 top-0 bottom-0 bg-[#0c0c0e] z-10"
             />
             <span className="font-mono text-sm md:text-base text-zinc-300 absolute left-0 whitespace-nowrap font-semibold tracking-wide">
               <span className="text-cyan-400">SELECT</span> * <span className="text-cyan-400">FROM</span> embeddings <span className="text-cyan-400">WHERE</span> distance &lt; 0.05
             </span>
          </div>
        </motion.div>

        {/* Retrieved Context Cards */}
        <div className="relative z-30 mt-12 flex flex-col md:flex-row gap-6 w-full max-w-4xl justify-center px-4">
           <motion.div 
             style={{ opacity: cluster1Opacity, y: c1Y }}
             className="bg-[#0c0c0e]/90 backdrop-blur-md border border-emerald-500/30 p-6 rounded-2xl w-full md:w-80 shadow-[0_20px_50px_rgba(16,185,129,0.15)] flex flex-col gap-4 relative overflow-hidden"
           >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <Database className="w-4 h-4 text-emerald-500" />
                <div className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">DIST: 0.012</div>
              </div>
              <div className="text-xs md:text-sm text-zinc-300 font-mono leading-relaxed">
                Matched historical PR #4092. Memory leak signature found in <span className="text-white bg-zinc-800 px-1 rounded">useEffect</span> teardown.
              </div>
           </motion.div>

           <motion.div 
             style={{ opacity: cluster2Opacity, y: c2Y }}
             className="bg-[#0c0c0e]/90 backdrop-blur-md border border-cyan-500/30 p-6 rounded-2xl w-full md:w-80 shadow-[0_20px_50px_rgba(6,182,212,0.15)] flex flex-col gap-4 relative overflow-hidden"
           >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none" />
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                <Fingerprint className="w-4 h-4 text-cyan-500" />
                <div className="font-mono text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-1 rounded">DIST: 0.045</div>
              </div>
              <div className="text-xs md:text-sm text-zinc-300 font-mono leading-relaxed">
                Context loaded: Internal documentation on <span className="text-white bg-zinc-800 px-1 rounded">WebSocket</span> unmount sequence guidelines.
              </div>
           </motion.div>
        </div>

      </div>
    </section>
  );
}
