"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Hexagon, Plus, GitBranch, Terminal, ArrowRight, Activity, Clock, 
  Cpu, ShieldAlert, Code2, Bell, Search, Settings, User, CreditCard, 
  LogOut, CheckCircle2, AlertCircle, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Atmosphere } from "@/components/ui/Atmosphere";

const mockProjects = [
  { id: "1", name: "pallets/flask", lastAnalyzed: "2h ago", health: 98, status: "stable", size: "34.2K LOC" },
  { id: "2", name: "facebook/react", lastAnalyzed: "5h ago", health: 84, status: "warning", size: "142.8K LOC" },
  { id: "3", name: "vercel/next.js", lastAnalyzed: "1d ago", health: 92, status: "stable", size: "88.4K LOC" },
  { id: "4", name: "torvalds/linux", lastAnalyzed: "3d ago", health: 76, status: "warning", size: "32.1M LOC" }
];

const mockActivity = [
  { time: "10m ago", agent: "Agent-04", action: "Patched O(N²) loop in pallets/flask" },
  { time: "2h ago", agent: "Alex (You)", action: "Triggered synthesis of facebook/react" },
  { time: "5h ago", agent: "Agent-12", action: "Flagged recursive dependency in next.js routing" },
  { time: "1d ago", agent: "Oracle", action: "Answered 14 queries regarding Linux kernel scheduling" }
];

export default function DashboardGlobalPage() {
  const router = useRouter();
  const [newRepoUrl, setNewRepoUrl] = useState("");
  
  // Interactive States
  const [activeTab, setActiveTab] = useState("Overview");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [hasNewNotifs, setHasNewNotifs] = useState(true);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [cmdSearch, setCmdSearch] = useState("");

  // CMD+K Keyboard listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCmdKOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsCmdKOpen(false);
        setIsProfileOpen(false);
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoUrl) return;
    const encoded = encodeURIComponent(newRepoUrl);
    router.push(`/engine?repo=${encoded}`);
  };

  const filteredProjects = mockProjects.filter(p => p.name.toLowerCase().includes(cmdSearch.toLowerCase()));

  return (
    <main className="relative min-h-screen bg-[#09090B] text-white selection:bg-emerald-500/30 overflow-x-hidden">
      <Atmosphere />

      {/* -------------------- COMMAND PALETTE MODAL -------------------- */}
      <AnimatePresence>
        {isCmdKOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCmdKOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20, x: "-50%" }}
              animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, scale: 0.95, y: -20, x: "-50%" }}
              className="fixed top-[15%] left-1/2 w-full max-w-xl bg-[#18181b]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-[101] overflow-hidden"
            >
              <div className="flex items-center px-4 py-4 border-b border-white/10 bg-[#09090b]/50">
                <Search className="w-5 h-5 text-zinc-500 mr-3" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Search workspaces, deployments..."
                  value={cmdSearch}
                  onChange={(e) => setCmdSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-white w-full text-lg placeholder:text-zinc-600"
                />
                <button onClick={() => setIsCmdKOpen(false)} className="text-zinc-500 hover:text-white px-2 py-1 rounded-md text-xs border border-white/10">ESC</button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {filteredProjects.length > 0 ? (
                  <div className="py-2">
                    <p className="px-3 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Workspaces</p>
                    {filteredProjects.map((proj) => (
                      <div 
                        key={proj.id} 
                        onClick={() => router.push(`/repo/${proj.id}`)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:border-emerald-500/50">
                          <GitBranch className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400" />
                        </div>
                        <span className="text-sm font-medium text-zinc-300 group-hover:text-white">{proj.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-zinc-500 text-sm">No results found for "{cmdSearch}"</div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* -------------------- GLOBAL HEADER -------------------- */}
      <header className="sticky top-0 w-full px-8 py-4 flex items-center justify-between z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <Hexagon className="w-6 h-6 text-emerald-500" fill="currentColor" fillOpacity={0.2} />
            <span className="font-extrabold text-xl tracking-tighter text-white">Vertex.AI</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            {["Overview", "Deployments", "Settings"].map((tab) => (
              <span 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative cursor-pointer transition-colors ${activeTab === tab ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.span layoutId="activeTab" className="absolute -bottom-[21px] left-0 w-full h-[2px] bg-emerald-500 rounded-t-full shadow-[0_0_10px_#10b981]" />
                )}
              </span>
            ))}
          </nav>
        </div>
        
        {/* Right Nav / Controls */}
        <div className="flex items-center gap-4">
          
          {/* Search Trigger */}
          <div 
            onClick={() => setIsCmdKOpen(true)}
            className="hidden md:flex items-center gap-2 bg-[#18181b]/80 hover:bg-white/10 border border-white/5 px-3 py-1.5 rounded-full mr-2 cursor-pointer transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-xs text-zinc-500 font-mono">CMD + K</span>
          </div>
          
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); setHasNewNotifs(false); }}
              className={`relative p-2 rounded-full transition-colors ${isNotifOpen ? "bg-white/10 text-white" : "hover:bg-white/5 text-zinc-400 hover:text-white"}`}
            >
              <Bell className="w-4 h-4" />
              {hasNewNotifs && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
              )}
            </button>
            
            {/* Notification Dropdown */}
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-12 right-0 w-80 bg-[#18181b]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center">
                    <span className="text-sm font-bold">Notifications</span>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 cursor-pointer hover:text-white">Mark all read</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    <div className="flex gap-3 px-4 py-3 hover:bg-white/5 border-b border-white/5 cursor-pointer">
                      <div className="mt-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
                      <div>
                        <p className="text-sm text-zinc-300"><span className="text-white font-bold">Synthesis Complete</span> for pallets/flask</p>
                        <p className="text-xs text-zinc-500 mt-1">2h ago</p>
                      </div>
                    </div>
                    <div className="flex gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer">
                      <div className="mt-1"><AlertCircle className="w-4 h-4 text-amber-500" /></div>
                      <div>
                        <p className="text-sm text-zinc-300"><span className="text-white font-bold">Warning</span>: 12 pending issues in facebook/react</p>
                        <p className="text-xs text-zinc-500 mt-1">5h ago</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="w-[1px] h-4 bg-white/10 mx-1" />
          
          {/* Profile Menu */}
          <div className="relative">
            <div 
              onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
              className={`flex items-center gap-3 cursor-pointer p-1.5 rounded-full pr-4 transition-colors ${isProfileOpen ? "bg-white/10" : "hover:bg-white/5"}`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-black border border-emerald-500/30 flex items-center justify-center overflow-hidden">
                 <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=transparent" alt="User Profile" className="w-6 h-6 opacity-90" />
              </div>
              <span className="text-sm font-bold text-zinc-300">Alex M.</span>
            </div>
            
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-14 right-0 w-56 bg-[#18181b]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2"
                >
                  <div className="px-3 py-3 mb-2 border-b border-white/5">
                    <p className="text-sm font-bold text-white">Alex Mercer</p>
                    <p className="text-xs text-zinc-500">alex@company.com</p>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-zinc-300 cursor-pointer transition-colors">
                      <User className="w-4 h-4 text-zinc-500" /> Profile Settings
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-zinc-300 cursor-pointer transition-colors">
                      <CreditCard className="w-4 h-4 text-zinc-500" /> Billing
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-zinc-300 cursor-pointer transition-colors">
                      <Settings className="w-4 h-4 text-zinc-500" /> Preferences
                    </div>
                  </div>
                  
                  <div className="border-t border-white/5 mt-2 pt-2">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-sm text-red-400 cursor-pointer transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* -------------------- MAIN CONTENT (DYNAMIC BASED ON TAB) -------------------- */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10">
        
        {activeTab === "Overview" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-10">
            {/* Personalized Welcome & Global Metrics */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">Alex</span>.
                </h1>
                <p className="text-zinc-400 font-light text-base md:text-lg">Your swarm has patched <span className="text-emerald-400 font-bold">12 issues</span> since your last login.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="bg-[#18181b]/60 border border-white/5 p-5 rounded-xl backdrop-blur-md">
                   <div className="flex items-center gap-2 text-zinc-400 mb-2">
                     <GitBranch className="w-4 h-4" />
                     <span className="text-xs font-mono font-bold tracking-widest uppercase">Workspaces</span>
                   </div>
                   <span className="text-3xl font-extrabold tracking-tighter">14</span>
                 </div>
                 <div className="bg-[#18181b]/60 border border-white/5 p-5 rounded-xl backdrop-blur-md">
                   <div className="flex items-center gap-2 text-zinc-400 mb-2">
                     <Code2 className="w-4 h-4" />
                     <span className="text-xs font-mono font-bold tracking-widest uppercase">LOC Analyzed</span>
                   </div>
                   <span className="text-3xl font-extrabold tracking-tighter">32.4<span className="text-lg text-emerald-500 font-bold ml-1">M</span></span>
                 </div>
                 <div className="bg-[#18181b]/60 border border-white/5 p-5 rounded-xl backdrop-blur-md">
                   <div className="flex items-center gap-2 text-zinc-400 mb-2">
                     <Cpu className="w-4 h-4" />
                     <span className="text-xs font-mono font-bold tracking-widest uppercase">Active Agents</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="text-3xl font-extrabold tracking-tighter">42</span>
                     <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                     </span>
                   </div>
                 </div>
                 <div className="bg-[#18181b]/60 border border-white/5 p-5 rounded-xl backdrop-blur-md hover:border-emerald-500/30 transition-colors cursor-pointer group">
                   <div className="flex items-center gap-2 text-zinc-400 mb-2 group-hover:text-emerald-400 transition-colors">
                     <ShieldAlert className="w-4 h-4" />
                     <span className="text-xs font-mono font-bold tracking-widest uppercase">Issues Patched</span>
                   </div>
                   <span className="text-3xl font-extrabold tracking-tighter text-emerald-400">892</span>
                 </div>
              </div>
            </div>

            {/* Analyze New Repo Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-[#18181b]/60 border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md"
            >
              <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 flex flex-col gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-500" />
                    Analyze New Repository
                  </h2>
                  <p className="text-sm text-zinc-400">Deploy the swarm to map a new codebase.</p>
                </div>
                
                <form onSubmit={handleAnalyze} className="w-full md:w-[500px] relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur" />
                  <div className="relative flex items-center bg-[#09090b] border border-white/10 rounded-xl overflow-hidden shadow-inner focus-within:border-emerald-500/50 transition-all">
                    <input
                      type="text"
                      value={newRepoUrl}
                      onChange={(e) => setNewRepoUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full bg-transparent py-4 pl-5 pr-14 text-sm text-white placeholder:text-zinc-600 focus:outline-none font-mono"
                    />
                    <button
                      type="submit"
                      disabled={!newRepoUrl.trim()}
                      className="absolute right-2 p-2.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50 disabled:bg-transparent flex items-center gap-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>

            {/* Layout Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Column: Projects Grid */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-emerald-500" /> Your Workspaces
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockProjects.map((project, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={project.id}
                      onClick={() => router.push(`/repo/${project.id}`)}
                      className="group bg-[#18181b]/60 border border-white/5 hover:border-emerald-500/30 rounded-xl p-5 cursor-pointer transition-all hover:bg-[#18181b]/80 shadow-lg backdrop-blur-sm"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:border-emerald-500/30 transition-colors">
                            <GitBranch className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                          </div>
                          <div>
                            <h4 className="font-mono text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{project.name}</h4>
                            <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {project.lastAnalyzed}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Activity className={`w-3.5 h-3.5 ${project.status === 'stable' ? 'text-emerald-500' : 'text-amber-500'}`} />
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Health</span>
                          </div>
                          <span className="text-[11px] font-bold text-zinc-500 font-mono">{project.size}</span>
                        </div>
                        <span className={`text-base font-extrabold ${project.status === 'stable' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {project.health}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right Column: Activity Feed */}
              <div className="flex flex-col gap-6">
                <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" /> Swarm Activity
                </h3>
                
                <div className="bg-[#18181b]/60 border border-white/5 rounded-xl p-5 backdrop-blur-md flex flex-col gap-6">
                  {mockActivity.map((act, idx) => (
                    <div key={idx} className="flex gap-4 relative">
                      {idx !== mockActivity.length - 1 && (
                        <div className="absolute top-6 left-2 bottom-[-24px] w-[1px] bg-white/5" />
                      )}
                      <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex-shrink-0 mt-0.5 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-zinc-300 leading-snug">{act.action}</p>
                        <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase">
                          <span className={act.agent.includes("You") ? "text-cyan-400 font-bold" : "text-emerald-500 font-bold"}>{act.agent}</span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-zinc-500">{act.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => setActiveTab("Deployments")}
                    className="w-full py-2 mt-2 rounded-lg border border-white/5 text-xs font-mono tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    VIEW ALL LOGS
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ---------------- DEPLOYMENTS TAB VIEW ---------------- */}
        {activeTab === "Deployments" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
            <h1 className="text-3xl font-extrabold tracking-tighter text-white">Full Swarm Logs</h1>
            <div className="bg-[#18181b]/60 border border-white/5 rounded-xl p-6 backdrop-blur-md flex flex-col gap-8 max-w-4xl">
              {[...mockActivity, ...mockActivity, ...mockActivity].map((act, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  {idx !== 11 && (
                    <div className="absolute top-6 left-2 bottom-[-32px] w-[1px] bg-white/5" />
                  )}
                  <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex-shrink-0 mt-1 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                  </div>
                  <div className="flex flex-col gap-1.5 w-full bg-[#09090b]/50 p-4 rounded-lg border border-white/5">
                    <p className="text-sm text-zinc-200">{act.action}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase">
                        <span className={act.agent.includes("You") ? "text-cyan-400 font-bold" : "text-emerald-500 font-bold"}>{act.agent}</span>
                      </div>
                      <span className="text-xs text-zinc-500 font-mono">{act.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ---------------- SETTINGS TAB VIEW ---------------- */}
        {activeTab === "Settings" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8 max-w-2xl">
            <h1 className="text-3xl font-extrabold tracking-tighter text-white">Preferences</h1>
            <div className="flex flex-col gap-6">
              <div className="bg-[#18181b]/60 border border-white/5 rounded-xl p-6 backdrop-blur-md">
                <h3 className="text-lg font-bold text-white mb-4">Account Details</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Name</label>
                    <input type="text" defaultValue="Alex Mercer" className="bg-[#09090b] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Email</label>
                    <input type="email" defaultValue="alex@company.com" className="bg-[#09090b] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <button className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm w-fit mt-2 hover:bg-zinc-200 transition-colors">Save Changes</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </main>
  );
}
