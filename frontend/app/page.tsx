"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import HeatmapBackground from "@/components/landing/HeatmapBackground";
import InteractiveTiles from "@/components/landing/InteractiveTiles";
import MapSection from "@/components/landing/MapSection";
import ProfileSection from "@/components/landing/ProfileSection";
import ResolveSection from "@/components/landing/ResolveSection";
import GatewaySection from "@/components/landing/GatewaySection";
import Footer from "@/components/landing/Footer";
import { Hexagon } from "lucide-react";

export default function LandingPage() {
  const { scrollYProgress } = useScroll(); // Global Scroll Tracker

  // Continuous Context Line (The Data Stream)
  // Reverted to pure percentage to fix Framer Motion string interpolation bugs with calc()
  const indicatorTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  
  // The line physically changes color as it travels through different environments
  const indicatorColor = useTransform(scrollYProgress, 
    [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9], 
    ["#ffffff", "#39d353", "#39d353", "#ef4444", "#ef4444", "#10b981", "#10b981"]
  );

  return (
    <main className="relative w-screen bg-white">
      {/* Premium Branding Header */}
      <header className="fixed top-0 left-0 w-full px-4 md:px-8 py-4 flex items-center justify-between z-[100] bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Hexagon className="w-7 h-7 text-white" />
          <span className="font-extrabold text-2xl tracking-tighter text-white">Vertex.AI</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex gap-6 text-sm font-medium text-zinc-400">
            <a href="/" className="hover:text-white transition-colors">Platform</a>
            <a href="/engine" className="hover:text-white transition-colors">Engine</a>
            <span className="hover:text-white transition-colors cursor-default">Enterprise</span>
          </nav>
          <div className="h-4 w-[1px] bg-zinc-800" />
          <button className="text-sm font-bold bg-white text-black px-5 py-2 rounded-full hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Start Building
          </button>
        </div>
      </header>

      {/* --- THE BRUTALIST SCROLL HUD --- */}
      <div className="fixed top-32 bottom-32 left-0 w-16 md:w-24 z-[100] pointer-events-none flex flex-col items-center hidden lg:flex mix-blend-difference">
        
        {/* Track Line */}
        <div className="absolute inset-y-0 w-[1px] bg-zinc-800/50" />
        
        {/* The Traveling Data Stream Wrapper (pb-24 reserves space for the h-24 indicator so 100% top fits perfectly) */}
        <div className="absolute inset-y-0 w-[3px] pb-24">
          <motion.div 
            className="relative w-full h-24 -ml-[1px] rounded-full shadow-[0_0_12px_currentColor]"
            style={{ 
              top: indicatorTop, 
              backgroundColor: indicatorColor,
              color: indicatorColor 
            }}
          />
        </div>

        {/* Phase Text Markers */}
        <div className="absolute top-[25%] flex flex-col items-center gap-2 text-zinc-600 font-mono text-[9px] tracking-widest font-bold">
          <span className="w-2 h-[1px] bg-zinc-600"></span>
          <span>MAP</span>
        </div>
        
        <div className="absolute top-[50%] flex flex-col items-center gap-2 text-zinc-600 font-mono text-[9px] tracking-widest font-bold">
          <span className="w-2 h-[1px] bg-zinc-600"></span>
          <span>PROF</span>
        </div>
        
        <div className="absolute top-[75%] flex flex-col items-center gap-2 text-zinc-600 font-mono text-[9px] tracking-widest font-bold">
          <span className="w-2 h-[1px] bg-zinc-600"></span>
          <span>RES</span>
        </div>

      </div>

      {/* 
        The Hero Content (100vh) - DARK MODE
        Contains the Earth heatmap on the left, interactive tiles on the right.
      */}
      <div className="relative z-10 flex flex-col items-center justify-center h-screen px-4 overflow-hidden bg-[#09090B] text-white">
        
        

        {/* Left Side: Earth Curvature */}
        <HeatmapBackground />

        {/* Right Side: Proximity Hover Grid */}
        <InteractiveTiles />
        
        {/* Right-Shifted Content (Clears the Heatmap Head on the left) */}
        <div className="relative z-20 flex flex-col items-start pointer-events-none mt-16 w-full max-w-7xl mx-auto px-8 md:pl-[45%] lg:pl-[50%]">
          
          {/* Stacked Title with Trailing Effect */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-left text-white flex flex-col gap-2 md:gap-4">
            <motion.span
              initial={{ opacity: 0, filter: "blur(20px)", x: -40 }}
              animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              Map.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, filter: "blur(20px)", x: -40 }}
              animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            >
              Profile.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, filter: "blur(20px)", x: -40 }}
              animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            >
              Resolve.
            </motion.span>
          </h1>

          {/* The Subtitle Fade-in (Aligned to the new title) */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            className="mt-8 text-base sm:text-lg md:text-xl text-zinc-400 max-w-xl text-left font-light leading-relaxed"
          >
            Enterprise-grade architectural synthesis. Extract codebases into 3D WebGL, 
            isolate algorithmic bottlenecks, and let the Multi-Agent engine resolve vulnerabilities.
          </motion.p>
        </div>

        {/* Premium Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 flex flex-col items-center gap-4 z-20 pointer-events-none"
        >
          <div className="w-[1px] h-16 bg-zinc-800 relative overflow-hidden">
             <motion.div 
               animate={{ top: ['-100%', '100%'] }} 
               transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
               className="absolute left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-white to-transparent" 
             />
          </div>
          <span className="text-[10px] font-mono text-zinc-500 tracking-[0.3em] uppercase">Scroll</span>
        </motion.div>

      </div>

      {/* SECTION 1: MAP */}
      <MapSection />

      {/* SECTION 2: PROFILE */}
      <ProfileSection />

      {/* SECTION 3: RESOLVE */}
      <ResolveSection />

      {/* SECTION 4: GATEWAY & CTA */}
      <GatewaySection />

      {/* FOOTER */}
      <Footer />

    </main>
  );
}
