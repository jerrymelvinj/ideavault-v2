"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bot, Send, User, Sparkles, BookOpen, ExternalLink } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  citations?: { id: string; title: string; contentType: string }[];
}

export default function AssistantPage() {
  const { user } = useAuth();
  const userName = user?.displayName ? user.displayName.split(" ")[0] : "there";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    setMessages([
      {
        id: "1",
        sender: "assistant",
        text: `Hello ${userName}! I am your IdeaVault AI Assistant. Ask me anything about your captured thoughts, research notes, projects, or concepts. I will ground my answers in your personal knowledge base with citations.`,
      },
    ]);
  }, [userName]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg.text }),
      });
      const data = await res.json();

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: data.answer || "I checked your knowledge base.",
        citations: data.citations || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col justify-between space-y-4">
      {/* Assistant Header */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            AI Knowledge Assistant <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">RAG Engine</span>
          </h1>
          <p className="text-xs text-slate-400">Ask questions grounded strictly in your personal library with citations.</p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 text-sm ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl p-4 rounded-2xl space-y-3 ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none"
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

              {/* Citations list */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Cited Knowledge Sources:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {msg.citations.map((cite) => (
                      <Link
                        key={cite.id}
                        href={`/items/${cite.id}`}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-indigo-300 transition-colors"
                      >
                        <span className="font-semibold text-indigo-400">[{cite.contentType}]</span>
                        <span className="truncate max-w-[180px]">{cite.title}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.sender === "user" && (
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="flex gap-3 justify-start text-sm">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 italic text-xs">
              Analyzing knowledge base & synthesizing answer...
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your notes (e.g. 'What ideas have I had around AI tools for designers?')..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-4 pr-24 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-xl"
        />
        <button
          type="submit"
          disabled={isThinking || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" /> Send
        </button>
      </form>
    </div>
  );
}
