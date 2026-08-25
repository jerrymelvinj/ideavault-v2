"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Save, ArrowLeft, CheckCircle2, Mic } from "lucide-react";
import { VoiceRecorder } from "@/components/capture/VoiceRecorder";

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

  const handleVoiceTranscript = (voiceText: string) => {
    setContent((prev) => (prev ? `${prev}\n\n${voiceText}` : voiceText));
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
                <span>Save & AI Process</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Voice Recorder Component (Phase 2) */}
      <VoiceRecorder onTranscriptComplete={handleVoiceTranscript} />

      {/* Title & Editor Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Title (Optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Leave empty for AI to generate a smart title..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-indigo-300 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Thought Content (Raw Text, Notes, Audio Transcript)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
            }}
            placeholder="Type or record anything on your mind. AI will classify into categories... (Press ⌘ + Return / Ctrl + Enter to save & process)"
            rows={10}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-y leading-relaxed shadow-inner"
          />
        </div>
      </div>

      {/* AI Organized Result Box */}
      {organizedResult && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 space-y-4 animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Organized & Vector Indexed
            </h3>
            <button
              onClick={() => router.push(`/items/${organizedResult.id}`)}
              className="text-xs text-indigo-400 hover:underline font-semibold"
            >
              Open Note Workspace →
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Generated Title:</span>
              <p className="font-semibold text-slate-100 text-sm mt-0.5">{organizedResult.title}</p>
            </div>
            <div>
              <span className="text-slate-500 block">Assigned Category:</span>
              <p className="font-semibold text-indigo-300 text-sm mt-0.5">{organizedResult.category?.name || "General"}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-slate-500 block">Executive Summary:</span>
              <p className="text-slate-300 mt-0.5 leading-relaxed">{organizedResult.summary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
