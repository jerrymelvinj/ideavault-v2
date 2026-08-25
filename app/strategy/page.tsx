"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Sparkles,
  Target,
  AlertTriangle,
  CheckCircle2,
  Send,
  ArrowRight,
  Brain,
  Layers,
} from "lucide-react";
import { StrategyAdviceResult } from "@/lib/ai/strategy";

export default function StrategyPage() {
  const [question, setQuestion] = useState("");
  const [strategyResult, setStrategyResult] = useState<StrategyAdviceResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial strategic assessment
    handleConsultAdvisor("Based on everything I have created and captured, what project should I focus on building next?");
  }, []);

  const handleConsultAdvisor = async (queryText?: string) => {
    const activeQuery = queryText || question;
    if (!activeQuery.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: activeQuery }),
      });
      const data = await res.json();
      setStrategyResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "What project should I focus on building next?",
    "What are my biggest creative blind spots?",
    "Which captured ideas are closest to an MVP release?",
    "How can I better connect my research notes to active projects?",
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
          <Compass className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Personal Strategy Advisor <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">Phase 3</span>
          </h1>
          <p className="text-xs text-slate-400">Long-term strategic guidance grounded in multi-month creative memory.</p>
        </div>
      </div>

      {/* Query Bar + Quick Prompts */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <label className="block text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Consult Your Personal Strategy Assistant
        </label>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleConsultAdvisor();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a strategic question (e.g. 'What project should I focus on next?')..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all shrink-0"
          >
            <Send className="w-3.5 h-3.5" /> Analyze Strategy
          </button>
        </form>

        {/* Quick Sample Prompts */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-[11px] text-slate-500 self-center">Try asking:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuestion(p);
                handleConsultAdvisor(p);
              }}
              className="text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1 rounded-lg transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Synthesizing multi-month knowledge trajectory & strategy...</span>
        </div>
      ) : !strategyResult ? (
        <div className="text-center py-12 text-slate-500 text-sm">Ask a question above to generate your strategy report.</div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Main Strategic Overview */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-4 shadow-xl">
            <span className="text-xs font-semibold text-indigo-300 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              Strategic Answer
            </span>
            <h2 className="text-base font-bold text-white leading-snug">{strategyResult.strategicAnswer}</h2>
          </div>

          {/* Recommended Focus Project */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Target className="w-5 h-5" /> Top Recommended Focus Project
            </div>
            <h3 className="text-lg font-extrabold text-white">{strategyResult.recommendedFocusProject?.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Rationale:</strong> {strategyResult.recommendedFocusProject?.rationale}
            </p>
            <div className="pt-2">
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md"
              >
                <span>Open Project Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Blind Spots & Immediate Action Plan */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Identified Blind Spots */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-4">
              <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Identified Creative Blind Spots
              </h3>
              <div className="space-y-3">
                {strategyResult.identifiedBlindSpots?.map((spot, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/20 text-xs text-slate-300 leading-relaxed">
                    • {spot}
                  </div>
                ))}
              </div>
            </div>

            {/* Immediate Action Items */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Immediate Action Roadmap
              </h3>
              <div className="space-y-3">
                {strategyResult.actionItems?.map((action, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-start gap-2">
                    <span className="font-bold text-indigo-400">{idx + 1}.</span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
