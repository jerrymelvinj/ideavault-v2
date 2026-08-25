"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Clock, AlertCircle, ArrowRight, RotateCcw, Lightbulb } from "lucide-react";

export default function RediscoverPage() {
  const [unfinishedItems, setUnfinishedItems] = useState<any[]>([]);
  const [oldItems, setOldItems] = useState<any[]>([]);

  useEffect(() => {
    fetchRediscoverData();
  }, []);

  const fetchRediscoverData = async () => {
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      const all: any[] = data.items || [];

      setUnfinishedItems(all.filter((i) => i.status === "Unfinished" || i.contentType === "Draft"));
      setOldItems(all.slice(0, 4));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-400" /> Rediscover Hub
        </h1>
        <p className="text-sm text-slate-400">
          Proactively surfacing forgotten ideas, unfinished concepts, and notes worth revisiting.
        </p>
      </div>

      {/* Unfinished Ideas Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-400" /> Unfinished Ideas & Drafts
        </h2>

        {unfinishedItems.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 text-center">
            No unfinished concepts found. Great job developing your notes!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {unfinishedItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
                      Unfinished Concept
                    </span>
                    <span className="text-slate-500">{new Date(item.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-semibold text-slate-100">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {item.summary || item.rawContent}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Not updated in over 30 days</span>
                  <Link
                    href={`/items/${item.id}`}
                    className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    Develop Idea Now →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Forgotten Value & Ideas Showing Momentum */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" /> Worth Revisiting
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {oldItems.map((item) => (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 space-y-2 transition-all block"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300">
                  {item.category?.name || "General"}
                </span>
                <span className="text-slate-500">{item.contentType}</span>
              </div>
              <h3 className="font-semibold text-slate-100">{item.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{item.summary || item.rawContent}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
