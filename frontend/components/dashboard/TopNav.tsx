import { MessageSquare, Hexagon, GitBranch, ArrowLeft } from "lucide-react";
import { useVertexStore } from "@/store/useVertexStore";
import Link from "next/link";

export function TopNav() {
  const { toggleChat, isChatOpen } = useVertexStore();

  return (
    <header className="fixed top-0 left-0 w-full px-4 md:px-8 py-4 flex items-center justify-between z-[100] bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 pointer-events-auto">
      
      {/* Brand & Back Navigation */}
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/5">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold font-sans">Dashboard</span>
        </Link>
        <div className="w-[1px] h-4 bg-white/10" />
        <Link href="/" className="flex items-center gap-3">
          <Hexagon className="w-6 h-6 text-emerald-500" fill="currentColor" fillOpacity={0.2} />
          <span className="font-extrabold text-xl tracking-tighter text-white">
            Vertex.AI
          </span>
        </Link>
      </div>
      
      {/* Center Nav / Branch */}
      <div className="hidden md:flex items-center gap-2 bg-[#18181b]/80 px-4 py-2 rounded-full border border-white/5 shadow-inner">
        <GitBranch className="w-4 h-4 text-zinc-500" />
        <span className="text-xs font-mono text-zinc-400 tracking-widest uppercase">pallets/flask</span>
      </div>

      {/* Actions */}
      <button
        onClick={toggleChat}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] ${
          isChatOpen 
            ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
            : "bg-white text-black hover:bg-zinc-200"
        }`}
      >
        <MessageSquare className="w-4 h-4" />
        Oracle
      </button>
      
    </header>
  );
}
