"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Save, ArrowLeft, CheckCircle2, Tag, Folder, Layers, Lightbulb } from "lucide-react";

export default function CapturePage() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [organizedResult, setOrganizedResult] = useState<any>(null);
  const router = useRouter();

  const handleSave = async () => {
    if (!content.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, title: title.trim() || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setOrganizedResult(data.item);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">Autosave ready</span>
          <button
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/30"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>AI Organizing...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Capture & Organize</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4 shadow-xl">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (Optional — AI will generate one if empty)"
          className="w-full bg-transparent border-b border-slate-800 pb-3 text-xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing your raw thought, research note, observation, or product concept freely..."
          rows={12}
          autoFocus
          className="w-full bg-transparent border-none text-slate-100 placeholder-slate-600 focus:outline-none resize-none leading-relaxed text-base"
        />
      </div>

      {/* Post-Capture AI Feedback Panel */}
      {organizedResult && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 space-y-4 animate-fade-in shadow-2xl">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>I've organized this for you!</span>
          </div>

          <div className="grid md:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Content Type
              </span>
              <p className="text-sm font-semibold text-slate-200">{organizedResult.contentType}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Folder className="w-3.5 h-3.5 text-amber-400" /> Category
              </span>
              <p className="text-sm font-semibold text-slate-200">
                {organizedResult.category?.name || "General"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-emerald-400" /> Auto-Generated Tags
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {organizedResult.tags?.map((t: any) => (
                  <span
                    key={t.tag.id}
                    className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    #{t.tag.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-indigo-400" /> AI Summary
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">{organizedResult.summary}</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setOrganizedResult(null);
                setContent("");
                setTitle("");
              }}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Capture Another Thought
            </button>
            <button
              onClick={() => router.push(`/items/${organizedResult.id}`)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              View Full Note Workspace →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
