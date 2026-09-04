"use client";

import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GatewaySection() {
  const [url, setUrl] = useState("https://github.com/pallets/flask");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDeploy = async () => {
    if (!url) return;
    setLoading(true);
    
    // Push directly to engine, we will pass the repo URL in the querystring 
    // so the engine can kick off the process visually.
    const encoded = encodeURIComponent(url);
    router.push(`/engine?repo=${encoded}`);
  };

  return (
    <section className="relative w-full py-40 bg-[#09090B] text-white flex flex-col items-center justify-center px-4 overflow-hidden border-t border-zinc-900">
      {/* Background Grid */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at center, #3f3f46 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }} 
      />
      
      <div className="flex flex-col items-center text-center gap-4 lg:gap-6 relative z-10 max-w-3xl mb-12 lg:mb-16">
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tighter text-white">
          Deploy the Swarm.
        </h2>
        <p className="text-lg lg:text-xl text-zinc-400 font-light px-4">
          Input your repository. Let the AI map the architecture, isolate the bottlenecks, and synthesize the optimal patches.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-[90vw] md:w-full max-w-2xl bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.05)] relative z-10"
      >
        {/* Terminal Header */}
        <div className="bg-[#18181b] px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-700" />
          <div className="w-3 h-3 rounded-full bg-zinc-700" />
          <div className="w-3 h-3 rounded-full bg-zinc-700" />
          <span className="ml-2 text-xs font-mono text-zinc-500 flex-1 text-center pr-10">vertex-cli — bash</span>
        </div>
        
        {/* Terminal Body */}
        <div className="p-6 md:p-8 font-mono text-sm md:text-base flex flex-col gap-4 text-left">
          <div className="text-zinc-500">
            $ Initializing Vertex.AI Engine v2.0...
          </div>
          <div className="text-zinc-500">
            $ Awaiting target repository...
          </div>
          <div className="flex items-center gap-3 mt-4 border-b border-white/5 pb-2">
            <span className="text-emerald-500 font-bold">➜</span>
            <span className="text-cyan-500 font-bold">~</span>
            <span className="text-zinc-300">vertex map</span>
            <input 
              type="text" 
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://github.com/..."
              disabled={loading}
              className="bg-transparent outline-none text-white flex-1 placeholder-zinc-700 caret-white disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleDeploy();
              }}
            />
          </div>
          <div className="flex justify-end mt-8">
            <button 
              onClick={handleDeploy}
              disabled={loading}
              className="bg-white text-black px-6 py-2.5 rounded-md font-sans font-bold text-sm hover:bg-emerald-400 hover:text-black transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:bg-white"
            >
              {loading ? (
                <>Deploying... <Loader2 className="w-4 h-4 animate-spin" /></>
              ) : (
                <>Execute <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
