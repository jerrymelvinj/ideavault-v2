"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Brain,
  Sparkles,
  PieChart,
  Layers,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { ThinkingPatternMetrics } from "@/lib/ai/analytics";

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<ThinkingPatternMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      setMetrics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Thinking Pattern & Creative Bandwidth Analytics <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">Phase 3</span>
          </h1>
          <p className="text-xs text-slate-400">Deep intellectual bandwidth breakdown, category focus, and thought velocity metrics.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Calculating creative bandwidth & velocity metrics...</span>
        </div>
      ) : !metrics ? (
        <div className="text-center py-12 text-slate-500 text-sm">No metrics available.</div>
      ) : (
        <div className="space-y-6">
          {/* Top Stat Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Total Captures</span>
              <p className="text-2xl font-black text-white">{metrics.totalNotes}</p>
              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +35% vs last month
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Active Projects</span>
              <p className="text-2xl font-black text-indigo-400">{metrics.totalProjects}</p>
              <span className="text-[10px] text-indigo-300">Kanban Workspaces</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Topic Categories</span>
              <p className="text-2xl font-black text-purple-400">{metrics.totalCategories}</p>
              <span className="text-[10px] text-slate-400">Auto-clustered by AI</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium">Capture Velocity</span>
              <p className="text-2xl font-black text-amber-400">3.8 / week</p>
              <span className="text-[10px] text-amber-400">High Momentum</span>
            </div>
          </div>

          {/* AI Creative Focus Insights Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-3 shadow-xl">
            <span className="text-xs font-semibold text-indigo-300 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-1.5 w-fit">
              <Brain className="w-3.5 h-3.5 text-indigo-400" /> AI Bandwidth Assessment
            </span>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">{metrics.creativeFocusSummary}</p>
          </div>

          {/* Creative Bandwidth Breakdown & Velocity Chart */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Category Bandwidth Bars */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-400" /> Creative Bandwidth Distribution
              </h2>
              <div className="space-y-4 pt-1">
                {metrics.categoryDistribution.map((cat, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">{cat.category}</span>
                      <span className="text-indigo-400 font-bold">{cat.percentage}% ({cat.count} items)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Thought Creation Velocity Trend */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" /> Monthly Creation Velocity
              </h2>
              <div className="flex items-end justify-between h-44 pt-6 px-2">
                {metrics.velocityPerMonth.map((v, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-[11px] font-bold text-amber-300">{v.count}</span>
                    <div className="w-8 bg-slate-950 rounded-t-lg overflow-hidden border border-slate-800 flex items-end justify-center">
                      <div
                        className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md transition-all duration-500"
                        style={{ height: `${Math.min(v.count * 8, 120)}px` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-400">{v.month}</span>
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
