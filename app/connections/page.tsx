"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GitFork, Sparkles, ArrowRight, Layers, ExternalLink } from "lucide-react";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<any[]>([]);

  useEffect(() => {
    // Construct rich visual relationship list
    setConnections([
      {
        id: "rel-1",
        type: "EvolvesFrom",
        confidence: 0.88,
        reason: "Item evolves from handwritten notebook scan from Feb 2026.",
        sourceTitle: "AI Tool for Converting Websites into Editable Figma Designs",
        sourceId: "item-1",
        targetTitle: "Physical Notebook Scan: Reverse Engineering Web Layouts",
        targetId: "item-4",
      },
      {
        id: "rel-2",
        type: "Similar",
        confidence: 0.65,
        reason: "Both ideas focus on AI automation within Figma and design system workflows.",
        sourceTitle: "AI Tool for Converting Websites into Editable Figma Designs",
        sourceId: "item-1",
        targetTitle: "Automated UX Audit Assistant for Design Systems",
        targetId: "item-2",
      },
    ]);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <GitFork className="w-6 h-6 text-indigo-400" /> Discovered Connections
        </h1>
        <p className="text-sm text-slate-400">
          AI automatically detects semantic similarity, idea evolutions, and relationships over time.
        </p>
      </div>

      {/* Visual Connection Graph / Card View */}
      <div className="space-y-4">
        {connections.map((rel) => (
          <div
            key={rel.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-indigo-500/40 transition-all"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20">
                {rel.type} ({Math.round(rel.confidence * 100)}% Match)
              </span>
              <span className="text-slate-400">AI Auto-Detected Connection</span>
            </div>

            {/* Connected Nodes */}
            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Source Thought</span>
                <h3 className="font-semibold text-slate-100 text-sm">{rel.sourceTitle}</h3>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Connected Thought</span>
                <h3 className="font-semibold text-slate-100 text-sm">{rel.targetTitle}</h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{rel.reason}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
