"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Cpu, MessageSquare } from "lucide-react";
import { useVertexStore } from "@/store/useVertexStore";

interface Message {
  role: "user" | "assistant";
  content: string;
  chunks_used?: number;
}

export function ChatDrawer() {
  const { isChatOpen, toggleChat } = useVertexStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/ask-repo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        body: JSON.stringify({
          repo_id: "1",
          question: userMessage.content,
          mode: "chat",
        }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim();
              if (dataStr === "[DONE]") {
                break;
              }
              try {
                const data = JSON.parse(dataStr);
                if (data.type === "text" && data.delta) {
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastIndex = newMessages.length - 1;
                    newMessages[lastIndex].content += data.delta;
                    return newMessages;
                  });
                } else if (data.type === "metadata" && data.chunks_used) {
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastIndex = newMessages.length - 1;
                    newMessages[lastIndex].chunks_used = data.chunks_used;
                    return newMessages;
                  });
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        newMessages[lastIndex].content += "\n\nError: Could not connect to backend.";
        return newMessages;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <AnimatePresence>
      {isChatOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleChat}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 w-[440px] h-screen bg-[#09090b]/80 backdrop-blur-3xl border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#18181b]/80 border border-white/5 shadow-inner flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-tight">Vertex Oracle</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                    <p className="text-[10px] text-emerald-500 font-mono tracking-widest uppercase font-bold">SSE Active</p>
                  </div>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="p-2.5 rounded-full hover:bg-white/10 text-zinc-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-none">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-6">
                  <MessageSquare className="w-10 h-10 opacity-30" />
                  <p className="text-sm font-mono text-center text-zinc-500">
                    Query the synthesized architecture.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx}
                    className={`flex flex-col w-full ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[90%] p-4 ${
                        msg.role === "user"
                          ? "bg-[#18181b] border border-white/5 rounded-2xl rounded-br-sm text-zinc-200 shadow-lg"
                          : "bg-transparent border-l-2 border-emerald-500 pl-5 text-zinc-300"
                      }`}
                    >
                      <p className="text-[14px] leading-relaxed font-sans whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.chunks_used !== undefined && (
                      <span className="text-[10px] text-zinc-500 font-mono mt-3 opacity-80 flex items-center gap-2 pl-5">
                        <span className="text-emerald-500">▹</span> Synthesized from {msg.chunks_used} codebase chunks
                      </span>
                    )}
                  </motion.div>
                ))
              )}
              {isStreaming && messages[messages.length - 1]?.role === "user" && (
                <div className="pl-5 pt-2">
                   <div className="flex items-center gap-1.5 opacity-50">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/5 bg-[#09090b]">
              <form onSubmit={handleSubmit} className="relative group">
                <div className="relative flex items-center bg-[#18181b]/80 border border-white/10 rounded-xl overflow-hidden shadow-inner focus-within:border-emerald-500/50 focus-within:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Oracle..."
                    disabled={isStreaming}
                    className="w-full bg-transparent py-4 pl-5 pr-14 text-sm text-white placeholder:text-zinc-600 focus:outline-none disabled:opacity-50 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isStreaming}
                    className="absolute right-2 p-2.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-50 disabled:bg-transparent"
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
}
