import { useVertexStore } from "@/store/useVertexStore";
import { Activity, ShieldAlert, Cpu } from "lucide-react";

export function LeftSidebar() {
  const { issues, setSelectedPatch } = useVertexStore();

  return (
    <div className="fixed top-24 left-6 w-[320px] flex flex-col gap-6 z-50 font-sans pointer-events-none">
      
      {/* System Health */}
      <div className="bg-[#18181b]/80 border-2 border-white/5 p-6 flex flex-col gap-4 pointer-events-auto rounded-xl shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 text-zinc-400 border-b border-white/5 pb-3">
          <Activity className="w-4 h-4 text-emerald-500" />
          <h2 className="text-xs font-mono tracking-widest uppercase font-bold">System Health</h2>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl text-white font-extrabold tracking-tighter">98</span>
          <span className="text-xl text-emerald-500 font-bold">%</span>
        </div>
      </div>

      {/* Profiler */}
      <div className="bg-[#18181b]/80 border-2 border-white/5 p-6 flex flex-col gap-4 pointer-events-auto rounded-xl shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 text-zinc-400 border-b border-white/5 pb-3">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <h2 className="text-xs font-mono tracking-widest uppercase font-bold">Profiler</h2>
        </div>
        <div className="bg-[#09090b] border border-amber-500/20 p-4 rounded-lg shadow-inner relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          <p className="text-amber-500/90 font-mono text-xs leading-relaxed">
            <span className="font-bold text-amber-400">[WARN]</span> O(N²) loop in <span className="text-white">auth.py</span>
          </p>
        </div>
      </div>

      {/* Patches List */}
      <div className="bg-[#18181b]/80 border-2 border-white/5 p-6 flex flex-col gap-4 pointer-events-auto rounded-xl shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between text-zinc-400 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-500" />
            <h2 className="text-xs font-mono tracking-widest uppercase font-bold">AI Patches</h2>
          </div>
          <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20">{issues.length} Pending</span>
        </div>
        
        <div className="flex flex-col gap-2 mt-2">
           {issues.map((issue, idx) => (
             <div 
               key={idx}
               onClick={() => setSelectedPatch(issue)}
               className="group flex items-center justify-between px-4 py-3 rounded-lg bg-[#09090b] hover:bg-cyan-950/30 border border-white/5 hover:border-cyan-500/30 cursor-pointer transition-all shadow-inner"
             >
               <span className="text-xs font-mono text-zinc-400 group-hover:text-white transition-colors">{issue.filepath}</span>
               <span className="w-2 h-2 rounded-full bg-zinc-700 group-hover:bg-cyan-400 group-hover:shadow-[0_0_8px_#22d3ee] transition-all"></span>
             </div>
           ))}
        </div>
      </div>

    </div>
  );
}
