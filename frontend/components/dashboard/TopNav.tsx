import { GlassPanel } from "@/components/ui/GlassPanel";

export function TopNav() {
  return (
    <GlassPanel className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-2xl h-14 flex items-center justify-between px-6 z-50">
      <span className="font-sans font-bold text-lg tracking-tight text-white">Vertex.AI</span>
      <div className="bg-black/50 px-3 py-1 text-xs rounded-full text-zinc-400 font-mono border border-white/5 shadow-inner">
        Repository: pallets/flask
      </div>
    </GlassPanel>
  );
}
