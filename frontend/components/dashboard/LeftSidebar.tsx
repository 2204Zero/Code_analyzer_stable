import { GlassPanel } from "@/components/ui/GlassPanel";
import { useVertexStore } from "@/store/useVertexStore";

export function LeftSidebar() {
  const { issues, setSelectedPatch } = useVertexStore();

  return (
    <div className="fixed top-24 left-6 w-80 flex flex-col gap-6 z-50 font-sans">
      
      <GlassPanel className="p-6 flex flex-col gap-2">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Architecture Health</h2>
        <div className="text-5xl text-emerald-400 font-bold tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
          98%
        </div>
      </GlassPanel>

      <GlassPanel className="p-6 flex flex-col gap-2">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Big-O Profiler</h2>
        <div className="mt-2 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
          <p className="text-amber-400 font-mono text-xs leading-relaxed">
            [WARNING] O(N²) nested loop detected in auth.py. 
          </p>
        </div>
      </GlassPanel>

      <GlassPanel className="p-6 flex flex-col gap-4">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Pending AI Patches</h2>
        <div className="flex flex-col gap-2">
           {issues.map((issue, idx) => (
             <div 
               key={idx}
               onClick={() => setSelectedPatch(issue)}
               className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 hover:border-cyan-500/50 transition-colors cursor-pointer"
             >
               <span className="text-sm font-mono text-zinc-300">{issue.filepath}</span>
               <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.8)] animate-pulse"></span>
             </div>
           ))}
        </div>
      </GlassPanel>

    </div>
  );
}
