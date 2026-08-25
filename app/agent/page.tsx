"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  Cpu,
  Layers,
  CheckCircle2,
  Rocket,
  Code2,
  RefreshCw,
  FolderPlus,
} from "lucide-react";
import { CoFounderSpec } from "@/lib/ai/agent";

export default function AgentPage() {
  const [spec, setSpec] = useState<CoFounderSpec | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpec();
  }, []);

  const fetchSpec = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agent", { method: "POST" });
      const data = await res.json();
      setSpec(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Proactive AI Co-Founder Agent <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">Phase 3</span>
            </h1>
            <p className="text-xs text-slate-400">Autonomous co-founder agent that synthesizes technical architecture specs, market positioning, and execution blueprints.</p>
          </div>
        </div>

        <button
          onClick={fetchSpec}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Regenerate Technical Spec
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>AI Co-Founder Agent analyzing project memory & synthesizing architecture spec...</span>
        </div>
      ) : !spec ? (
        <div className="text-center py-12 text-slate-500 text-sm">No specification generated yet.</div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Active Project Title Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-3 shadow-xl">
            <span className="text-xs font-semibold text-indigo-300 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-1.5 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Co-Founder Spec: {spec.projectTitle}
            </span>
            <h2 className="text-lg font-bold text-white leading-snug">{spec.executivePitch}</h2>
          </div>

          {/* Technical Architecture Matrix */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" /> System Architecture Matrix
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {spec.technicalArchitecture?.map((arch, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-semibold tracking-wider text-indigo-400 uppercase">{arch.component}</span>
                  <p className="text-xs font-medium text-slate-200 leading-relaxed">{arch.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Market Positioning & Build Roadmap */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Market Positioning */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Rocket className="w-4 h-4 text-emerald-400" /> Target Market & Positioning
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                {spec.marketPositioning}
              </p>
            </div>

            {/* MVP Build Roadmap */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-400" /> Sprint Roadmap Checklist
              </h2>
              <div className="space-y-2">
                {spec.mvpBuildRoadmap?.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{item}</span>
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
