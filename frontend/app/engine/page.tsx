"use client";

import { useState, useEffect, memo } from "react";
import { Hexagon, Sparkles, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Configuration for the CUDA Core Matrix
const COLS = 20;
const ROWS = 8;
const TOTAL_CELLS = COLS * ROWS;
const targetRepo = "https://github.com/agentic-ai/core-engine";
const hexChars = "0123456789ABCDEF!@#$%&*";
const TYPING_SPEED = 45; // ms per character

// ----------------------------------------------------------------------
// Custom Classic Cartoon Hand Cursor (Matches user's exact image)
// ----------------------------------------------------------------------
const CartoonHandCursor = () => (
  <svg width="48" height="48" viewBox="0 0 100 100" className="drop-shadow-2xl origin-top-left -rotate-12">
    <path 
      d="M35 55 V20 C35 12 47 12 47 20 V38 C47 32 59 32 59 38 C59 35 71 35 71 42 C71 38 83 38 83 48 V55 C83 75 70 85 55 85 H40 C30 85 22 75 18 65 L12 55 C8 45 20 38 28 48 L35 55 Z" 
      fill="white" 
      stroke="black" 
      strokeWidth="5" 
      strokeLinejoin="round"
    />
    <path 
      d="M47 60 V72 M57 60 V72 M67 60 V72" 
      stroke="black" 
      strokeWidth="4" 
      strokeLinecap="round"
    />
  </svg>
);

// ----------------------------------------------------------------------
// Memoized 3D Cell Component (Flat Grid, 3D Processing Pop)
// ----------------------------------------------------------------------
const CudaCell = memo(({ data }: { data?: { active: boolean; tokenChar?: string } }) => {
  const active = data?.active || false;
  const tokenChar = data?.tokenChar;

  const [displayChar, setDisplayChar] = useState<string | undefined>(undefined);
  const [isCrunching, setIsCrunching] = useState(false);

  useEffect(() => {
    if (active && tokenChar) {
      setIsCrunching(true);
      let ticks = 0;
      const crunchInterval = setInterval(() => {
        setDisplayChar(hexChars[Math.floor(Math.random() * hexChars.length)]);
        ticks++;
        if (ticks > 25) { 
          clearInterval(crunchInterval);
          setIsCrunching(false);
          setDisplayChar(tokenChar);
        }
      }, 50);

      const spikeInterval = setInterval(() => {
        if (Math.random() > 0.95) { 
          setIsCrunching(true);
          let spikeTicks = 0;
          const shortCrunch = setInterval(() => {
            setDisplayChar(hexChars[Math.floor(Math.random() * hexChars.length)]);
            spikeTicks++;
            if (spikeTicks > 10) {
              clearInterval(shortCrunch);
              setIsCrunching(false);
              setDisplayChar(tokenChar);
            }
          }, 50);
        }
      }, 2000);

      return () => {
        clearInterval(crunchInterval);
        clearInterval(spikeInterval);
      };
    } else {
      setDisplayChar(undefined);
    }
  }, [active, tokenChar]);

  return (
    <motion.div
      style={{ transformStyle: "preserve-3d" }}
      animate={{
        z: active ? (isCrunching ? 60 : 0) : 0,
        scale: active ? (isCrunching ? 1.15 : 1) : 1,
        backgroundColor: active 
          ? (isCrunching ? "rgba(16, 185, 129, 0.4)" : "rgba(16, 185, 129, 0.05)") 
          : "rgba(10, 10, 10, 0.8)",
        boxShadow: active 
          ? (isCrunching 
              ? "0 30px 60px rgba(16, 185, 129, 0.6), inset 0 0 20px rgba(16,185,129,0.8)" 
              : "0 0 15px rgba(16, 185, 129, 0.15), inset 0 0 5px rgba(16,185,129,0.2)") 
          : "0 0 0px rgba(0,0,0,0), inset 0 0 0px rgba(0,0,0,0)",
        borderColor: active 
          ? (isCrunching ? "rgba(16, 185, 129, 1)" : "rgba(16, 185, 129, 0.2)") 
          : "rgba(255, 255, 255, 0.05)",
      }}
      transition={{ duration: isCrunching ? 0.05 : 1.2, type: "spring", stiffness: 300, damping: 25 }}
      className="relative aspect-square w-full rounded-md border flex items-center justify-center backdrop-blur-md"
    >
      <AnimatePresence>
        {tokenChar && !active && (
          <motion.div
            initial={{ y: -800, opacity: 0, scale: 3 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.8, ease: "easeIn" }}
            className="absolute font-mono text-3xl font-bold text-white drop-shadow-[0_0_20px_rgba(16,185,129,1)]"
          >
            {tokenChar}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, z: 0 }}
            animate={{ opacity: 1, scale: 1, z: isCrunching ? 40 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`absolute font-mono text-lg md:text-2xl font-bold transition-colors duration-75 ${
              isCrunching 
                ? "text-emerald-300 drop-shadow-[0_0_15px_rgba(16,185,129,1)]" 
                : "text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]"
            }`}
          >
            {displayChar}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
CudaCell.displayName = "CudaCell";

// ----------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------
export default function EnginePage() {
  const [phase, setPhase] = useState<
    "INITIAL" | "TYPING" | "ZOOM_OUT" | "CURSOR_IN" | "PRESSING" | "DRAINING" | "CAMERA_PAN" | "FILLING_MATRIX"
  >("INITIAL");
  
  const [typedText, setTypedText] = useState("");
  const [screen1Tokens, setScreen1Tokens] = useState<{ id: number; char: string }[]>([]);
  const [cells, setCells] = useState<Record<number, { active: boolean; tokenChar?: string }>>({});

  // Calculate dynamic camera tracking (follows the token exactly)
  const START_X = 35; // Pushes the initial view further right so the bar isn't flush left
  const END_X = -25;
  const panOffset = START_X - (typedText.length * ((START_X - END_X) / Math.max(1, targetRepo.length)));
  const currentX = phase === "INITIAL" ? START_X : (phase === "TYPING" ? panOffset : 0);

  // 1. Start sequence
  useEffect(() => {
    const timer = setTimeout(() => setPhase("TYPING"), 800);
    return () => clearTimeout(timer);
  }, []);

  // 2. Type while massively zoomed in & panning the camera right
  useEffect(() => {
    if (phase !== "TYPING") return;
    let i = 0;
    const typingInterval = setInterval(() => {
      setTypedText(targetRepo.slice(0, i + 1));
      i++;
      if (i === targetRepo.length) {
        clearInterval(typingInterval);
        setTimeout(() => setPhase("ZOOM_OUT"), 500); 
      }
    }, TYPING_SPEED); 
    return () => clearInterval(typingInterval);
  }, [phase]);

  // 3. Zoom Out completely
  useEffect(() => {
    if (phase !== "ZOOM_OUT") return;
    const timer = setTimeout(() => setPhase("CURSOR_IN"), 1200); 
    return () => clearTimeout(timer);
  }, [phase]);

  // 4. Cursor flies in
  useEffect(() => {
    if (phase !== "CURSOR_IN") return;
    const timer = setTimeout(() => setPhase("PRESSING"), 700); 
    return () => clearTimeout(timer);
  }, [phase]);

  // 5. Cursor physically clicks the button
  useEffect(() => {
    if (phase !== "PRESSING") return;
    const timer = setTimeout(() => setPhase("DRAINING"), 250); 
    return () => clearTimeout(timer);
  }, [phase]);

  // 6. Text drains off cliff
  useEffect(() => {
    if (phase !== "DRAINING") return;

    let text = targetRepo;
    let i = 0;
    const drainInterval = setInterval(() => {
      if (text.length === 0) {
        clearInterval(drainInterval);
        setTimeout(() => setPhase("CAMERA_PAN"), 1200);
        return;
      }

      const char = text[text.length - 1];
      text = text.slice(0, -1);
      setTypedText(text);
      setScreen1Tokens((prev) => [...prev, { id: i, char }]);
      i++;
    }, 60); 

    return () => clearInterval(drainInterval);
  }, [phase]);

  // 7. Camera Pans down
  useEffect(() => {
    if (phase !== "CAMERA_PAN") return;
    const timer = setTimeout(() => setPhase("FILLING_MATRIX"), 1600);
    return () => clearTimeout(timer);
  }, [phase]);

  // 8. Matrix fills
  useEffect(() => {
    if (phase !== "FILLING_MATRIX") return;

    let i = 0;
    const usedCells = new Set<number>();
    const fillInterval = setInterval(() => {
      if (i >= targetRepo.length) {
        clearInterval(fillInterval);
        return;
      }

      const char = targetRepo[i];
      let targetCell: number;
      do {
        targetCell = Math.floor(Math.random() * TOTAL_CELLS);
      } while (usedCells.has(targetCell) && usedCells.size < TOTAL_CELLS);
      usedCells.add(targetCell);

      setCells((prev) => ({ ...prev, [targetCell]: { active: false, tokenChar: char } }));

      setTimeout(() => {
        setCells((prev) => ({ ...prev, [targetCell]: { active: true, tokenChar: char } }));
      }, 800);

      i++;
    }, 60);

    return () => clearInterval(fillInterval);
  }, [phase]);

  return (
    <main className="relative h-screen w-screen bg-[#000000] overflow-hidden font-sans">
      <motion.div 
        className="w-full flex flex-col items-center justify-start h-[200vh]"
        animate={{ y: phase === "CAMERA_PAN" || phase === "FILLING_MATRIX" ? "-100vh" : "0vh" }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} 
      >

        {/* SECTION 1: THE SEARCH CLIFF */}
        <section className="h-screen w-full flex items-center justify-center relative px-6 z-20">
          
          <motion.div
            initial={{ scale: 2.8, x: "35vw", y: "-18vh" }}
            animate={{ 
              scale: phase === "INITIAL" || phase === "TYPING" ? 2.8 : 1, 
              // Panning camera explicitly tracks the token position
              x: `${currentX}vw`,
              y: phase === "INITIAL" || phase === "TYPING" ? "-18vh" : "0vh"
            }}
            transition={{ 
              scale: { duration: phase === "ZOOM_OUT" ? 1.0 : 0, ease: "easeInOut" },
              x: phase === "TYPING" 
                  ? { type: "spring", stiffness: 400, damping: 40 } // Tight tracking on token
                  : { duration: phase === "ZOOM_OUT" ? 1.0 : 0, ease: "easeInOut" },
              y: { duration: phase === "ZOOM_OUT" ? 1.0 : 0, ease: "easeInOut" }
            }}
            className="flex flex-col items-center w-full max-w-[1100px]"
          >
            <div className="flex items-center gap-6 mb-12">
              <Hexagon className="w-16 h-16 md:w-24 md:h-24 text-white" strokeWidth={1.5} />
              <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-white">
                Vertex.AI
              </h1>
            </div>

            {/* Input Bar & Button Layout Container */}
            <div className="flex items-center w-full justify-center">

                {/* The Input Box */}
                <div className="relative w-full max-w-2xl shrink-0">
                  <div className="absolute -inset-6 bg-gradient-to-r from-emerald-500/30 via-cyan-500/20 to-emerald-600/30 blur-3xl rounded-full opacity-60" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-[#000000] to-emerald-700 blur-md rounded-full opacity-80" />

                  <div className="relative rounded-full p-[2px] bg-gradient-to-r from-zinc-700 via-zinc-900 to-zinc-700 shadow-[0_0_50px_rgba(16,185,129,0.15)]">
                    <div className="relative flex items-center bg-[#050505] rounded-full h-16 md:h-20 px-6 md:px-8 overflow-visible z-20">
                      
                      <Sparkles className="w-6 h-6 mr-4 shrink-0 text-emerald-500 relative z-10" />
                      
                      <div className="flex-1 flex items-center h-full border-none outline-none bg-transparent relative z-10 overflow-visible">
                        
                        {/* Internal Glow Portal exactly at the edge of the text bar */}
                        <motion.div 
                          animate={{ opacity: phase === "DRAINING" ? 1 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-emerald-500 via-emerald-500/50 to-transparent blur-xl z-0 pointer-events-none"
                        />

                        {/* Highly kinetic individual token rendering */}
                        <span className="text-lg md:text-2xl font-mono tracking-tight whitespace-nowrap z-10 relative flex">
                          <AnimatePresence>
                            {typedText.split("").map((char, index) => (
                              <motion.span
                                key={`${index}-${char}`}
                                initial={{ opacity: 0, scale: 2, color: "#10b981", filter: "blur(4px)", y: -10 }}
                                animate={{ opacity: 1, scale: 1, color: "#ffffff", filter: "blur(0px)", y: 0 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.2, type: "spring", stiffness: 400, damping: 20 }}
                                className="inline-block"
                              >
                                {char === " " ? "\u00A0" : char}
                              </motion.span>
                            ))}
                          </AnimatePresence>
                        </span>
                        
                        <motion.div 
                          animate={{ opacity: [1, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: "steps(2)" }}
                          className={`w-[2px] h-6 md:h-8 bg-emerald-500 ml-1 z-10 relative ${phase === "INITIAL" || phase === "TYPING" ? "block" : "hidden"}`}
                        />

                        {/* The Drop Zone (Aligned perfectly to the right edge of the text bar, completely separated from the button) */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 overflow-visible z-50">
                          {screen1Tokens.map(token => (
                            <motion.div
                              key={token.id}
                              initial={{ x: 0, y: 0, scale: 0.5, opacity: 0 }}
                              animate={{
                                x: [0, 0, 0, 0], // Drop straight down, no horizontal jumping towards the button!
                                y: [0, -60, 0, 1200], // Straight jump up and plunge down
                                scale: [0.5, 2, 2, 1], 
                                opacity: [0, 1, 1, 1],
                                rotate: [0, 90, 180, 270] 
                              }}
                              transition={{
                                duration: 1.5,
                                times: [0, 0.2, 0.4, 1.0], 
                                ease: "easeInOut"
                              }}
                              className="absolute flex items-center justify-center font-mono text-3xl font-bold text-white drop-shadow-[0_0_20px_rgba(16,185,129,1)]"
                            >
                              {token.char}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* The Synthesize Button (Separated completely from the Input Box) */}
                <div className="relative shrink-0 ml-6 w-[160px] h-12 flex items-center justify-center">
                  <AnimatePresence>
                    {(phase !== "INITIAL" && phase !== "TYPING") && (
                      <motion.button
                        initial={{ opacity: 0, filter: "blur(10px)", scale: 0.8 }}
                        animate={{ 
                          opacity: 1, 
                          scale: phase === "PRESSING" ? 0.9 : 1, 
                          filter: "blur(0px)",
                          backgroundColor: (phase === "PRESSING" || phase === "DRAINING" || phase === "CAMERA_PAN" || phase === "FILLING_MATRIX") ? "#10b981" : "#ffffff",
                          color: (phase === "PRESSING" || phase === "DRAINING" || phase === "CAMERA_PAN" || phase === "FILLING_MATRIX") ? "#ffffff" : "#000000",
                          boxShadow: phase === "PRESSING" ? "0 0 30px rgba(16,185,129,0.8)" : "0 0 20px rgba(255,255,255,0.2)"
                        }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 w-full h-full font-bold text-sm md:text-base rounded-full z-20 transition-colors"
                      >
                        Synthesize
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* Exact Classic Hand Cursor matched to user image */}
                  <AnimatePresence>
                    {(phase === "CURSOR_IN" || phase === "PRESSING" || phase === "DRAINING") && (
                      <motion.div
                        initial={{ x: 200, y: 200, opacity: 0 }}
                        animate={{ 
                          x: phase === "DRAINING" ? 200 : 30,  
                          y: phase === "DRAINING" ? 200 : 25, 
                          scale: phase === "PRESSING" ? 0.85 : 1, 
                          opacity: phase === "DRAINING" ? 0 : 1
                        }}
                        transition={{ 
                          duration: phase === "PRESSING" ? 0.1 : 0.6, 
                          ease: phase === "CURSOR_IN" ? "easeOut" : "easeInOut" 
                        }}
                        className="absolute top-0 left-0 z-50 pointer-events-none"
                      >
                        <CartoonHandCursor />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

            </div>
          </motion.div>
        </section>


        {/* ==========================================
            SECTION 2: THE EXPERIENCE (100vh) 
            ========================================== */}
        <section className="h-screen w-full flex flex-col items-center justify-center relative bg-[#020202]">
          
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          <div className="absolute left-1/4 top-1/4 w-[40vw] h-[40vh] bg-emerald-900/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
          <div className="absolute right-1/4 bottom-1/4 w-[30vw] h-[30vh] bg-cyan-900/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
          
          <div className="w-full max-w-[1400px] px-8 flex flex-col items-center relative z-10">
            
            <div className="relative w-full p-10 bg-[#050505]/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.8)]">
              
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-emerald-500/50 rounded-tl-[2rem]" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-emerald-500/50 rounded-br-[2rem]" />

              <div className="w-full flex items-center justify-between mb-8 px-2 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 animate-pulse rounded-full shadow-[0_0_10px_#10b981]" />
                  <span className="text-xs font-mono text-white tracking-[0.2em] font-bold">
                    NEURAL_PATHWAY_ACTIVE
                  </span>
                </div>
                <div className="flex gap-8">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] text-zinc-500 font-mono tracking-widest">THROUGHPUT</span>
                    <span className="text-xs text-emerald-400 font-mono">1.24 TFLOPS</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] text-zinc-500 font-mono tracking-widest">CORES</span>
                    <span className="text-xs text-emerald-400 font-mono">{TOTAL_CELLS} ACTIVE</span>
                  </div>
                </div>
              </div>
              
              <div className="w-full flex justify-center overflow-visible" style={{ perspective: "1500px" }}>
                <motion.div 
                  className="w-full max-w-6xl grid grid-cols-10 md:grid-cols-20 gap-3"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {Array.from({ length: TOTAL_CELLS }).map((_, i) => (
                    <CudaCell key={i} data={cells[i]} />
                  ))}
                </motion.div>
              </div>

            </div>
          </div>
        </section>

      </motion.div>
    </main>
  );
}
