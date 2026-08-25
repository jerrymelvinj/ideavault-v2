"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Save,
  Rocket,
  CheckSquare,
  Clock,
  GitFork,
  FileText,
  Tag,
  Folder,
  Layers,
  HelpCircle,
  AlertTriangle,
  Zap,
} from "lucide-react";

export default function KnowledgeItemDetailPage() {
  const params = useParams();
  const itemId = params.id as string;
  const router = useRouter();

  const [item, setItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "develop" | "evaluate" | "history" | "relationships">("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isDeveloping, setIsDeveloping] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItem();
  }, [itemId]);

  const fetchItem = async () => {
    try {
      const res = await fetch(`/api/items/${itemId}`);
      const data = await res.json();
      if (data.item) {
        setItem(data.item);
        setEditTitle(data.item.title);
        setEditContent(data.item.rawContent);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, rawContent: editContent }),
      });
      const data = await res.json();
      if (data.item) {
        setItem(data.item);
        setIsEditing(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDevelopIdea = async () => {
    setIsDeveloping(true);
    try {
      const res = await fetch(`/api/items/${itemId}/develop`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        fetchItem();
        setActiveTab("develop");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeveloping(false);
    }
  };

  const handleEvaluateIdea = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch(`/api/items/${itemId}/evaluate`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        fetchItem();
        setActiveTab("evaluate");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-500">Loading note details...</div>;
  if (!item) return <div className="text-center py-12 text-slate-400">Knowledge Item not found.</div>;

  const structured = item.structuredData ? JSON.parse(item.structuredData) : {};
  const development = structured.development;
  const evaluation = structured.evaluation;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Library
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDevelopIdea}
            disabled={isDeveloping}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all"
          >
            <Rocket className="w-4 h-4 text-indigo-400" />
            {isDeveloping ? "Developing Idea..." : "Develop Idea"}
          </button>

          <button
            onClick={handleEvaluateIdea}
            disabled={isEvaluating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all"
          >
            <CheckSquare className="w-4 h-4 text-amber-400" />
            {isEvaluating ? "Evaluating..." : "Evaluate Idea"}
          </button>
        </div>
      </div>

      {/* Main Content Layout (Left Column: Content/Tabs, Right Column: Metadata Sidebar) */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Item Header */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-lg font-bold text-white focus:outline-none focus:border-indigo-500"
              />
            ) : (
              <h1 className="text-2xl font-bold text-white leading-tight">{item.title}</h1>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-medium overflow-x-auto">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === "overview"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Overview & Content
              </button>
              <button
                onClick={() => setActiveTab("develop")}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  activeTab === "develop"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Rocket className="w-3.5 h-3.5" /> Idea Development
              </button>
              <button
                onClick={() => setActiveTab("evaluate")}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  activeTab === "evaluate"
                    ? "bg-amber-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" /> Scorecard
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  activeTab === "history"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> History
              </button>
            </div>

            {/* Tab 1: Overview & Content */}
            {activeTab === "overview" && (
              <div className="space-y-4 pt-2">
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                          e.preventDefault();
                          handleSaveEdit();
                        }
                      }}
                      placeholder="Edit raw content... (Press ⌘ + Return / Ctrl + Enter to save)"
                      rows={10}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed text-sm whitespace-pre-wrap">
                      {item.rawContent}
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 flex justify-end">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        Edit Raw Content
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Idea Development Workspace */}
            {activeTab === "develop" && (
              <div className="space-y-6 pt-2">
                {!development ? (
                  <div className="text-center py-8 text-slate-400 text-sm space-y-3">
                    <p>Idea Development framework has not been generated for this note yet.</p>
                    <button
                      onClick={handleDevelopIdea}
                      disabled={isDeveloping}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                    >
                      Generate Development Workspace
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 text-xs text-slate-300">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <h4 className="font-semibold text-indigo-400 uppercase tracking-wider text-[10px]">
                        Core Problem Formulation
                      </h4>
                      <p className="text-slate-200 leading-relaxed">{development.problem}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <h4 className="font-semibold text-indigo-400 uppercase tracking-wider text-[10px]">
                          Target User Persona
                        </h4>
                        <p className="text-slate-200">{development.targetUser}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <h4 className="font-semibold text-indigo-400 uppercase tracking-wider text-[10px]">
                          Why This Matters
                        </h4>
                        <p className="text-slate-200">{development.whyThisMatters}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <h4 className="font-semibold text-indigo-400 uppercase tracking-wider text-[10px]">
                        Potential Solution Architecture
                      </h4>
                      <p className="text-slate-200 leading-relaxed">{development.potentialSolution}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <h4 className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px]">
                          Possible Features
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          {development.possibleFeatures?.map((f: string, idx: number) => (
                            <li key={idx}>{f}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <h4 className="font-semibold text-indigo-400 uppercase tracking-wider text-[10px]">
                          Key Use Cases
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          {development.useCases?.map((u: string, idx: number) => (
                            <li key={idx}>{u}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <h4 className="font-semibold text-amber-400 uppercase tracking-wider text-[10px]">
                        Immediate Recommended Next Steps
                      </h4>
                      <ul className="space-y-1">
                        {development.nextSteps?.map((ns: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 text-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>{ns}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Idea Evaluation Scorecard */}
            {activeTab === "evaluate" && (
              <div className="space-y-6 pt-2">
                {!evaluation ? (
                  <div className="text-center py-8 text-slate-400 text-sm space-y-3">
                    <p>AI Evaluation Scorecard has not been calculated for this note yet.</p>
                    <button
                      onClick={handleEvaluateIdea}
                      disabled={isEvaluating}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold"
                    >
                      Generate Scorecard Evaluation
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 text-xs text-slate-300">
                    {/* Scorecard Visual Bars */}
                    <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <h4 className="font-semibold text-slate-200 text-sm">Idea Evaluation Scorecard</h4>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        {Object.entries(evaluation.scorecard || {}).map(([key, val]) => (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-medium text-slate-400 capitalize">
                              <span>{key.replace(/([A-Z])/g, " $1")}</span>
                              <span className="text-indigo-400 font-bold">{val as number}/10</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-indigo-500 h-2 rounded-full"
                                style={{ width: `${((val as number) / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 space-y-2">
                        <h4 className="font-semibold text-emerald-400">Key Strengths</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {evaluation.strengths?.map((s: string, idx: number) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/20 space-y-2">
                        <h4 className="font-semibold text-rose-400">Potential Weaknesses</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {evaluation.weaknesses?.map((w: string, idx: number) => (
                            <li key={idx}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Assumptions vs Facts */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <h4 className="font-semibold text-indigo-400">Assumptions vs. Grounded Facts</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] text-amber-400 font-bold uppercase">Assumptions</span>
                          <ul className="list-disc list-inside space-y-1 mt-1">
                            {evaluation.assumptionsVsFacts?.assumptions?.map((a: string, idx: number) => (
                              <li key={idx}>{a}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-400 font-bold uppercase">Grounded Facts</span>
                          <ul className="list-disc list-inside space-y-1 mt-1">
                            {evaluation.assumptionsVsFacts?.verifiedFacts?.map((f: string, idx: number) => (
                              <li key={idx}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
                      <h4 className="font-semibold text-indigo-300">Overall Strategic Assessment</h4>
                      <p className="text-slate-300 leading-relaxed">{evaluation.overallAssessment}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: History & Evolution */}
            {activeTab === "history" && (
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-semibold text-slate-400">Idea Version History</h4>
                {item.versions?.length === 0 ? (
                  <p className="text-xs text-slate-500">No revisions recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {item.versions.map((ver: any, idx: number) => (
                      <div key={ver.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="font-semibold text-indigo-400">Version {item.versions.length - idx}</span>
                          <span>{new Date(ver.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-300 line-clamp-2">{ver.content}</p>
                        <span className="text-[10px] text-slate-500">{ver.changeSummary}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: AI Understanding Metadata */}
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 text-xs">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" /> AI Auto-Organization
            </h3>

            <div className="space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Content Type
              </span>
              <p className="font-semibold text-slate-200 px-2 py-1 bg-slate-950 rounded border border-slate-800">
                {item.contentType}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-amber-400" /> Category
              </span>
              <p className="font-semibold text-slate-200 px-2 py-1 bg-slate-950 rounded border border-slate-800">
                {item.category?.name || "General"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-400" /> Tags
              </span>
              <div className="flex flex-wrap gap-1 pt-1">
                {item.tags?.map((t: any) => (
                  <span
                    key={t.tag.id}
                    className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                  >
                    #{t.tag.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-800">
              <span className="text-slate-400">Source:</span>
              <p className="text-slate-300 font-medium">{item.source}</p>
            </div>
          </div>

          {/* Related Ideas Block */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <GitFork className="w-4 h-4 text-indigo-400" /> Related Ideas
            </h3>

            {item.sourceItemRel?.length === 0 && item.targetItemRel?.length === 0 ? (
              <p className="text-slate-500">No semantic connections detected yet.</p>
            ) : (
              <div className="space-y-2">
                {item.sourceItemRel?.map((rel: any) => (
                  <Link
                    key={rel.id}
                    href={`/items/${rel.targetItem.id}`}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 block space-y-1"
                  >
                    <div className="flex justify-between font-semibold text-indigo-300">
                      <span>{rel.relationshipType}</span>
                      <span>{Math.round((rel.confidence || 0.8) * 100)}% Match</span>
                    </div>
                    <p className="text-slate-200 font-medium line-clamp-1">{rel.targetItem.title}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
