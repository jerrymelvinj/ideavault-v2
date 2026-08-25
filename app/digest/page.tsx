"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  GitMerge,
  Clock,
  Compass,
  ArrowRight,
  Brain,
  CheckCircle2,
} from "lucide-react";
import { WeeklyDigestReport } from "@/lib/ai/digest";

export default function DigestPage() {
  const [digest, setDigest] = useState<WeeklyDigestReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDigest();
  }, []);

  const fetchDigest = async () => {
    try {
      const res = await fetch("/api/digest");
      const data = await res.json();
      setDigest(data);
    } catch (e) {
      console.error("Failed to load digest:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Weekly AI Executive Digest <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">Phase 2</span>
          </h1>
          <p className="text-xs text-slate-400">Synthesized intelligence summarizing your emerging themes, converging thoughts, and recommended actions.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">Synthesizing weekly intelligence report...</div>
      ) : !digest ? (
        <div className="text-center py-12 text-slate-500 text-sm">No report available yet.</div>
      ) : (
        <div className="space-y-6">
          {/* Executive Overview Hero Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-300 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> {digest.weekTitle}
              </span>
              <span className="text-xs text-slate-400">Total Velocity: <strong>{digest.totalCapturesThisWeek} Captures</strong></span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h3 className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-400" /> AI Strategic Recommendation
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">{digest.strategicRecommendation}</p>
            </div>
          </div>

          {/* Top Emerging Intellectual Themes */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" /> Top Emerging Themes This Week
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {digest.topThemes.map((theme, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 font-semibold text-xs flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-400" /> {theme}
                </span>
              ))}
            </div>
          </div>

          {/* Converging Ideas & Stale Revisit Recommendations */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Converging Ideas */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-indigo-400" /> Converging Thoughts
              </h2>
              <div className="space-y-3">
                {digest.convergingIdeas.map((idea, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <h3 className="font-semibold text-indigo-300 text-xs">{idea.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{idea.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stale Notes Revisit */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> High-Value Revisit Opportunities
              </h2>
              <div className="space-y-3">
                {digest.staleNotesToRevisit.map((note, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-200 text-xs">{note.title}</h3>
                      <span className="text-[11px] text-amber-400/80">Unvisited for {note.daysAgo} days</span>
                    </div>
                    <Link
                      href="/rediscover"
                      className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      Revisit &rarr;
                    </Link>
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
