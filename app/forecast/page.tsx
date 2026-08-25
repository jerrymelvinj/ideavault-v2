"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GitMerge,
  Sparkles,
  ArrowRight,
  Zap,
  BookOpen,
  CheckCircle2,
  Brain,
  FolderPlus,
  Loader2,
} from "lucide-react";
import { IdeaForecastReport, IdeaForecast } from "@/lib/ai/forecast";

export default function ForecastPage() {
  const [report, setReport] = useState<IdeaForecastReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchForecasts();
  }, []);

  const fetchForecasts = async () => {
    try {
      const res = await fetch("/api/forecast");
      const data = await res.json();
      setReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToProject = async (fc: IdeaForecast) => {
    setConvertingId(fc.id);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fc.forecastTitle,
          description: fc.convergingConceptSummary,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/projects");
      }
    } catch (e) {
      console.error("Failed to convert forecast to project:", e);
    } finally {
      setConvertingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
          <GitMerge className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Autonomous Idea Convergence Forecasts <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">Phase 3</span>
          </h1>
          <p className="text-xs text-slate-400">Predictive intelligence detecting when multi-category thoughts converge into major product opportunities.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Analyzing multi-category note clusters & forecasting convergences...</span>
        </div>
      ) : !report || report.forecasts.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">No idea forecasts generated yet.</div>
      ) : (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {report.forecasts.map((fc) => (
              <div
                key={fc.id}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4 shadow-xl group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-400" /> {fc.confidenceScore}% Convergence Match
                    </span>
                    <span className="text-[11px] text-slate-500">Autonomous Forecast</span>
                  </div>

                  <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors leading-snug">
                    {fc.forecastTitle}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">{fc.convergingConceptSummary}</p>

                  {/* Converging Source Notes */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-indigo-400" /> Converging Source Notes:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {fc.sourceNoteTitles.map((title, i) => (
                        <span
                          key={i}
                          className="text-[11px] bg-slate-950 border border-slate-800 text-slate-400 px-2.5 py-0.5 rounded-md"
                        >
                          • {title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <span className="font-semibold text-emerald-300 block">Suggested Next Step:</span>
                    <p className="text-slate-400 text-[11px]">{fc.suggestedNextStep}</p>
                  </div>

                  <button
                    onClick={() => handleConvertToProject(fc)}
                    disabled={convertingId === fc.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
                  >
                    {convertingId === fc.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating AI Kanban Board...
                      </>
                    ) : (
                      <>
                        <FolderPlus className="w-3.5 h-3.5" /> Convert to Kanban Project Board &rarr;
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
