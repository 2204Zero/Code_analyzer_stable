import EngineHero from "@/components/engine/EngineHero";
import SwarmTopology from "@/components/engine/SwarmTopology";
import VectorSpace from "@/components/engine/VectorSpace";
import SandboxTerminal from "@/components/engine/SandboxTerminal";

export const metadata = {
  title: "Engine Architecture | Vertex.AI",
  description: "Inside the core engine of Vertex.AI.",
};

import { Hexagon } from "lucide-react";

export default function EnginePage() {
  return (
    <main className="bg-[#09090b] min-h-screen text-white font-sans selection:bg-emerald-500/30">
      
      {/* Global Navbar */}
      <header className="fixed top-0 left-0 w-full px-4 md:px-8 py-4 flex items-center justify-between z-[100] bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Hexagon className="w-7 h-7 text-white" />
          <span className="font-extrabold text-2xl tracking-tighter text-white">Vertex.AI</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex gap-6 text-sm font-medium text-zinc-400">
            <a href="/" className="hover:text-white transition-colors">Platform</a>
            <a href="/engine" className="text-white transition-colors">Engine</a>
            <span className="hover:text-white transition-colors cursor-default">Enterprise</span>
          </nav>
          <div className="h-4 w-[1px] bg-zinc-800" />
          <button className="text-sm font-bold bg-white text-black px-5 py-2 rounded-full hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Start Building
          </button>
        </div>
      </header>

      <EngineHero />
      <SwarmTopology />
      <VectorSpace />
      <SandboxTerminal />
    </main>
  );
}
