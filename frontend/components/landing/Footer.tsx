"use client";

import { Hexagon } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-[#09090B] text-zinc-400 pt-24 pb-8 px-4 md:px-8 border-t border-zinc-900 relative z-10 overflow-hidden">
      <div className="max-w-[90rem] mx-auto">
        
        {/* Top Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-8 mb-24 font-mono text-sm">
          <div className="flex flex-col gap-4">
            <span className="text-white font-sans text-base font-semibold mb-2">Engine</span>
            <a href="#" className="hover:text-emerald-400 transition-colors">Phase 01: Map</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Phase 02: Profile</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Phase 03: Resolve</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Auto-Healer</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Telemetry Board</a>
          </div>
          
          <div className="flex flex-col gap-4">
            <span className="text-white font-sans text-base font-semibold mb-2">Resources</span>
            <a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Architecture</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Changelog</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Community</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">GitHub</a>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-white font-sans text-base font-semibold mb-2">Company</span>
            <a href="#" className="hover:text-emerald-400 transition-colors">About</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Blog</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Careers</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Enterprise</a>
          </div>

          <div className="flex flex-col gap-4 col-span-2 md:col-span-1">
            <span className="text-white font-sans text-base font-semibold mb-2">Sign up for our newsletter</span>
            <p className="text-zinc-500 mb-2">Stay updated on the latest algorithmic patches and heuristics.</p>
            <div className="flex flex-col xl:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-[#18181b] border border-zinc-800 rounded px-4 py-2 text-white outline-none focus:border-emerald-500 transition-colors w-full"
              />
              <button className="bg-white text-black px-6 py-2 rounded font-sans font-bold hover:bg-emerald-400 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Massive Interactive Branding */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full border-t border-zinc-900 pt-12 pb-4 relative group cursor-crosshair flex flex-col items-center justify-center"
        >
          {/* Hover Glow Background */}
          <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors duration-700 blur-3xl rounded-full" />
          
          {/* Base Layer (Dark Outline) */}
          <div className="flex items-center justify-center w-full gap-4 md:gap-8 relative z-10">
            <Hexagon 
              className="w-[12vw] h-[12vw] text-transparent stroke-zinc-800 group-hover:stroke-emerald-500 transition-all duration-700" 
              strokeWidth={1} 
            />
            <h1 
              className="text-[12vw] font-black uppercase tracking-tighter text-transparent select-none transition-all duration-700"
              style={{ WebkitTextStroke: '1px #27272a' }}
            >
              VERTEX.AI
            </h1>
          </div>

          {/* Hover Layer (Glowing Green Outline) - Absolute to overlap perfectly */}
          <div className="absolute inset-0 pt-12 pb-4 flex items-center justify-center w-full gap-4 md:gap-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 z-20">
            <Hexagon 
              className="w-[12vw] h-[12vw] text-transparent stroke-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" 
              strokeWidth={1.5} 
            />
            <h1 
              className="text-[12vw] font-black uppercase tracking-tighter text-transparent select-none drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]"
              style={{ WebkitTextStroke: '2px #10b981', color: 'rgba(16, 185, 129, 0.03)' }}
            >
              VERTEX.AI
            </h1>
          </div>
        </motion.div>
        
        {/* Bottom Legal Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-zinc-600 mt-8 pt-8 border-t border-zinc-900 font-mono">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All systems operational</span>
          </div>
          <div className="flex gap-6">
            <span className="hover:text-zinc-300 cursor-pointer transition-colors">Privacy policy</span>
            <span className="hover:text-zinc-300 cursor-pointer transition-colors">Terms of service</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
