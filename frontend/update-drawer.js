const fs = require('fs');
let code = fs.readFileSync('components/dashboard/ChatDrawer.tsx', 'utf8');

const newUI = `  return (
    <AnimatePresence>
      {isChatOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleChat}
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 w-full max-w-[440px] h-screen bg-[#050505]/80 backdrop-blur-3xl border-l border-white/10 z-[100] flex flex-col shadow-[-20px_0_100px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-cyan-900/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZUZpbHRlciI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgibm9pc2VGaWx0ZXIpIi8+PC9zdmc+')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center justify-between p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500 blur-md opacity-30 rounded-full" />
                  <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-black flex items-center justify-center border border-emerald-500/30 shadow-inner">
                    <Cpu className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 tracking-wide">Vertex Oracle</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                    <p className="text-[10px] text-emerald-400/80 font-mono tracking-widest uppercase">SSE Link Active</p>
                  </div>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-white/5 hover:border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="relative flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent z-10">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center border border-white/5 shadow-inner">
                    <MessageSquare className="w-8 h-8 opacity-40" />
                  </div>
                  <p className="text-sm font-mono text-center px-8 text-zinc-400 leading-relaxed">
                    Ask questions about the synthesized architecture and codebase.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={idx}
                    className={\`flex flex-col max-w-[92%] \${
                      msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                    }\`}
                  >
                    <div
                      className={\`p-4 rounded-2xl \${
                        msg.role === "user"
                          ? "bg-zinc-800/80 backdrop-blur-md text-white rounded-br-sm border border-white/10 shadow-lg"
                          : "bg-gradient-to-br from-emerald-950/40 to-black backdrop-blur-md text-emerald-50 border border-emerald-500/20 rounded-tl-sm shadow-[0_4px_20px_rgba(16,185,129,0.05)]"
                      }\`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed font-sans">{msg.content}</p>
                    </div>
                    {msg.chunks_used !== undefined && (
                      <span className="text-[10px] text-zinc-500 font-mono mt-2 flex items-center gap-1.5 opacity-80">
                        <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                        Synthesized from {msg.chunks_used} chunks
                      </span>
                    )}
                  </motion.div>
                ))
              )}
              {isStreaming && messages[messages.length - 1]?.role === "user" && (
                <div className="mr-auto items-start max-w-[90%]">
                   <div className="p-4 rounded-2xl rounded-tl-sm bg-emerald-950/20 border border-emerald-500/10 flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="relative p-6 bg-black/60 backdrop-blur-md border-t border-white/5 z-20">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
              <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur" />
                <div className="relative flex items-center bg-zinc-900/80 border border-white/10 rounded-xl overflow-hidden shadow-inner focus-within:border-emerald-500/50 transition-colors">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Oracle..."
                    disabled={isStreaming}
                    className="w-full bg-transparent py-4 pl-5 pr-12 text-sm text-white placeholder:text-zinc-600 focus:outline-none disabled:opacity-50 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isStreaming}
                    className="absolute right-2 p-2.5 rounded-lg text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all disabled:opacity-50 disabled:bg-transparent disabled:text-zinc-600"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}`;

const startIdx = code.indexOf('return (');
if (startIdx !== -1) {
  code = code.substring(0, startIdx) + newUI + '\n}\n';
  fs.writeFileSync('components/dashboard/ChatDrawer.tsx', code);
  console.log('Updated UI');
} else {
  console.log('Could not find return block');
}
