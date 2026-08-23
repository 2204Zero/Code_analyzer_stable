"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FileJson, Database, Layout, ShieldCheck, Cpu, GitMerge } from "lucide-react";

export default function MapSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // --- Immersion Physics ---
  
  // 1. The Engineering Grid (Fades in to make it feel like a blueprint)
  const gridOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  // 2. The Scanner Line (Sweeps over the files to "parse" them)
  const scanlineY = useTransform(scrollYProgress, [0.1, 0.4], ["-20%", "120%"]);
  const scanlineOpacity = useTransform(scrollYProgress, [0.1, 0.2, 0.3, 0.4], [0, 1, 1, 0]);

  // 3. 3D Depth & Scattering
  const scatterScale = useTransform(scrollYProgress, [0.2, 0.5], [0.9, 1]);
  const stackShadow = useTransform(scrollYProgress, [0.2, 0.5], 
    ["0px 4px 20px rgba(0,0,0,0.05)", "0px 20px 50px rgba(0,0,0,0.15)"]
  );

  // 4. Node Coordinates
  const node0Y = useTransform(scrollYProgress, [0.2, 0.5], [0, 0]);
  const node0X = useTransform(scrollYProgress, [0.2, 0.5], [0, 0]);

  const node1Y = useTransform(scrollYProgress, [0.2, 0.5], [70, -140]);
  const node1X = useTransform(scrollYProgress, [0.2, 0.5], [0, -220]);

  const node2Y = useTransform(scrollYProgress, [0.2, 0.5], [140, -100]);
  const node2X = useTransform(scrollYProgress, [0.2, 0.5], [0, 220]);

  const node3Y = useTransform(scrollYProgress, [0.2, 0.5], [210, 160]);
  const node3X = useTransform(scrollYProgress, [0.2, 0.5], [0, -180]);

  const node4Y = useTransform(scrollYProgress, [0.2, 0.5], [280, 140]);
  const node4X = useTransform(scrollYProgress, [0.2, 0.5], [0, 180]);

  // 5. AST Metadata Reveal (The code digitizing)
  const metaOpacity = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);
  const metaHeight = useTransform(scrollYProgress, [0.4, 0.6], ["0px", "42px"]);

  // 6. Connecting the Graph
  const linePathLength = useTransform(scrollYProgress, [0.5, 0.7], [0, 1]);
  const lineOpacity = useTransform(scrollYProgress, [0.5, 0.6], [0, 1]);

  // 7. Ghost Architecture rotation and scale
  const ghostRotate = useTransform(scrollYProgress, [0, 1], [0, 10]);
  const ghostScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-zinc-50 text-black border-t border-zinc-200">
      
      {/* The Sticky Canvas */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden px-4 md:px-8">
        
        {/* The Engineering Blueprint Background */}
        <motion.div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ 
            opacity: gridOpacity,
            backgroundImage: 'radial-gradient(circle at center, #d4d4d8 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center z-10 relative">
          
          {/* Left Column: Typography & Narrative */}
          <div className="flex flex-col gap-6 relative z-20">
            <div className="inline-flex items-center gap-3">
              <div className="w-8 h-[1px] bg-zinc-900" />
              <span className="text-zinc-500 font-mono text-sm tracking-[0.2em] uppercase font-semibold">Phase 01</span>
            </div>
            <h2 className="text-5xl lg:text-8xl font-extrabold tracking-tighter text-zinc-900 leading-[0.9]">
              Map.
            </h2>
            <p className="text-2xl md:text-3xl text-zinc-800 font-light max-w-md tracking-tight leading-snug mt-4">
              We don't read text.<br />
              <span className="font-semibold text-emerald-600">We compile geometry.</span>
            </p>
            <p className="text-base text-zinc-500 max-w-md leading-relaxed mt-2 font-medium">
              Vertex.AI ingests raw repositories and shatters flat file trees into 
              multi-dimensional Abstract Syntax Trees (AST). See the true spatial footprint of your architecture.
            </p>
          </div>

          {/* Right Column: The Scroll-Jacked 3D Animation */}
          <div className="relative w-full h-[350px] lg:h-[600px] flex items-center justify-center">
            
            <div className="relative w-full h-full flex items-center justify-center scale-[0.55] sm:scale-[0.75] lg:scale-100 origin-center">
              {/* The Scanner Laser Bed */}
              <motion.div 
                style={{ top: scanlineY, opacity: scanlineOpacity }}
                className="absolute left-0 right-0 z-50 flex flex-col pointer-events-none"
              >
                {/* Scanner Trail / Bloom */}
                <div className="h-64 bg-gradient-to-t from-[#39d353]/20 via-[#39d353]/5 to-transparent w-full" />
                {/* The Laser Core */}
                <div className="h-[2px] bg-[#39d353] shadow-[0_0_20px_#39d353,0_0_40px_#39d353] w-full" />
              </motion.div>

              {/* The Massive "Ghost" Architecture (Scale context) */}
              <motion.svg 
                className="absolute inset-0 w-[150%] h-[150%] -left-[25%] -top-[25%] z-0 pointer-events-none opacity-[0.15]"
                style={{ rotate: ghostRotate, scale: ghostScale }}
              >
                {Array.from({ length: 50 }).map((_, i) => {
                  const cx1 = (Math.sin(i * 13) * 50 + 50).toFixed(2);
                  const cy1 = (Math.cos(i * 17) * 50 + 50).toFixed(2);
                  const cx2 = (Math.sin((i+1) * 13) * 50 + 50).toFixed(2);
                  const cy2 = (Math.cos((i+1) * 17) * 50 + 50).toFixed(2);
                  
                  return (
                    <g key={i}>
                      <circle cx={`${cx1}%`} cy={`${cy1}%`} r="4" fill="#000" />
                      <line x1={`${cx1}%`} y1={`${cy1}%`} x2={`${cx2}%`} y2={`${cy2}%`} stroke="#000" strokeWidth="1.5" />
                    </g>
                  );
                })}
              </motion.svg>

              {/* SVG AST Lines */}
              <motion.svg 
                className="absolute inset-0 w-full h-full z-10 pointer-events-none"
                style={{ opacity: lineOpacity }}
              >
                <g stroke="#10b981" strokeOpacity="0.6" strokeWidth="2" strokeDasharray="6 6" fill="none" strokeLinecap="round">
                  <motion.line x1="50%" y1="50%" x2="calc(50% - 220px)" y2="calc(50% - 140px)" style={{ pathLength: linePathLength }} />
                  <motion.line x1="50%" y1="50%" x2="calc(50% + 220px)" y2="calc(50% - 100px)" style={{ pathLength: linePathLength }} />
                  <motion.line x1="50%" y1="50%" x2="calc(50% - 180px)" y2="calc(50% + 160px)" style={{ pathLength: linePathLength }} />
                  <motion.line x1="50%" y1="50%" x2="calc(50% + 180px)" y2="calc(50% + 140px)" style={{ pathLength: linePathLength }} />
                </g>
              </motion.svg>

              {/* The Nodes (Data Cards) */}
              <div className="relative z-10 w-full h-full flex items-start justify-center mt-[-100px]">
                
                {/* Node Helper Component */}
                {[{
                  x: node0X, y: node0Y, icon: <Cpu className="w-5 h-5 text-zinc-900" />, title: "server.ts", type: "ROOT", edges: 24, glow: true
                }, {
                  x: node1X, y: node1Y, icon: <ShieldCheck className="w-5 h-5 text-zinc-500" />, title: "auth/guard.ts", type: "MIDDLEWARE", edges: 8
                }, {
                  x: node2X, y: node2Y, icon: <Database className="w-5 h-5 text-zinc-500" />, title: "db/schema.prisma", type: "MODEL", edges: 14
                }, {
                  x: node3X, y: node3Y, icon: <Layout className="w-5 h-5 text-zinc-500" />, title: "app/layout.tsx", type: "REACT", edges: 5
                }, {
                  x: node4X, y: node4Y, icon: <FileJson className="w-5 h-5 text-zinc-500" />, title: "api/webhook.ts", type: "ENDPOINT", edges: 3
                }].map((node, i) => (
                  <motion.div 
                    key={i}
                    style={{ x: node.x, y: node.y, scale: scatterScale, boxShadow: stackShadow }}
                    className={`absolute top-1/2 -mt-10 bg-white/90 backdrop-blur-md border border-zinc-200/80 rounded-xl flex flex-col w-56 overflow-hidden shadow-2xl ${node.glow ? 'ring-2 ring-emerald-500/20' : ''}`}
                  >
                    <div className="flex items-center gap-3 p-3.5 px-4 relative z-10 bg-white">
                      {node.icon}
                      <span className={`font-mono text-sm font-bold tracking-tight ${node.glow ? 'text-zinc-900' : 'text-zinc-700'}`}>
                        {node.title}
                      </span>
                    </div>
                    
                    {/* High-Contrast AST Metadata Reveal */}
                    <motion.div 
                      style={{ opacity: metaOpacity, height: metaHeight }} 
                      className="flex flex-col justify-center bg-zinc-900 border-t border-zinc-800 relative z-0"
                    >
                      <div className="flex items-center justify-between px-4">
                        <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider">AST: {node.type}</span>
                        <span className="text-[10px] font-mono text-zinc-400 font-medium">{node.edges} EDGES</span>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
