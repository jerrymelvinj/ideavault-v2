"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Send,
  GitFork,
  Clock,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  Brain,
  Search,
  Bot,
  Zap,
  Lock,
  Layers,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

export default function HomePage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [captureInput, setCaptureInput] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedFeedback, setCapturedFeedback] = useState<any>(null);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      setRecentItems((data.items || []).slice(0, 6));

      setInsights([
        {
          id: "1",
          type: "Connection Insight",
          content: "Possible connection: 3 recent notes appear related to your 'AI Web-to-Figma Converter' concept.",
          date: "Just now",
        },
        {
          id: "2",
          type: "Unfinished Insight",
          content: "You have 1 unfinished idea about voice-based capture that hasn't been revisited in 90 days.",
          date: "Yesterday",
        },
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captureInput.trim() || isCapturing) return;

    setIsCapturing(true);
    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: captureInput }),
      });
      const data = await res.json();
      if (data.success) {
        setCapturedFeedback(data.item);
        setCaptureInput("");
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCapturing(false);
    }
  };

  // 1. AUTH LOADING SPINNER
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400 text-xs">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying authentication...</span>
        </div>
      </div>
    );
  }

  // 2. UNAUTHENTICATED LANDING & LOGIN PAGE GATE
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center space-y-8 py-12">
        {/* Brand Logo & Tagline */}
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-700 p-2.5 flex items-center justify-center mx-auto shadow-2xl shadow-indigo-600/30">
            <img src="/logo.png" alt="IdeaVault Logo" className="w-full h-full object-contain" />
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI-Powered Personal Second Brain
          </span>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-2xl">
            Remember what you create. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              Develop what you think.
            </span>
          </h1>

          <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            IdeaVault automatically organizes, connects, retrieves, and helps you develop thoughts into meaningful projects. Sign in to access your personal brain.
          </p>
        </div>

        {/* Primary Google Sign-In Action Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" /> Sign in to your Vault
            </h2>
            <p className="text-xs text-slate-400">Authentication required to access personal notes & AI tools.</p>
          </div>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1">✓ End-to-End Encryption</span>
            <span className="flex items-center gap-1">✓ Cloud Firestore Sync</span>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-4 max-w-3xl text-left pt-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm">Universal Capture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Capture thoughts frictionlessly. AI auto-generates titles, categories, tags & summaries.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit">
              <Search className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm">Semantic Retrieval</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Search by natural language meaning and query your library using conversational AI.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit">
              <GitFork className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm">Idea Evolution</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Discover connected thoughts, track revisions, and develop early ideas into project blueprints.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. AUTHENTICATED DASHBOARD VIEW
  const displayName = user?.displayName ? user.displayName.split(" ")[0] : "Creator";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Good morning, <span className="text-indigo-400">{displayName}</span> 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Your personal second brain remembers what you create and connects your thoughts automatically.
        </p>
      </div>

      {/* Main Capture Hero Box */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-indigo-400" />
        </div>

        <form onSubmit={handleQuickCapture} className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> What are you thinking about?
            </label>
            <span className="text-xs text-slate-400">No category needed — AI organizes automatically</span>
          </div>

          <textarea
            value={captureInput}
            onChange={(e) => setCaptureInput(e.target.value)}
            placeholder="Type any raw thought, project concept, research note, or observation..."
            rows={3}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-none shadow-inner"
          />

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => router.push("/capture")}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Open Full Distraction-Free Editor →
            </button>

            <button
              type="submit"
              disabled={isCapturing || !captureInput.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/30"
            >
              {isCapturing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AI Organizing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Capture Thought</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* AI Organized Feedback Toast */}
        {capturedFeedback && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-semibold text-emerald-200">Captured & Organized by AI!</p>
              <p className="text-emerald-300/80">
                <strong>Title:</strong> {capturedFeedback.title} | <strong>Category:</strong>{" "}
                {capturedFeedback.category?.name || "General"} | <strong>Type:</strong> {capturedFeedback.contentType}
              </p>
            </div>
            <Link
              href={`/items/${capturedFeedback.id}`}
              className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 rounded-lg font-medium transition-colors"
            >
              View Note →
            </Link>
          </div>
        )}
      </div>

      {/* AI Proactive Intelligence Banner */}
      <div className="grid md:grid-cols-2 gap-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 hover:border-indigo-500/40 transition-all"
          >
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-300">{insight.type}</span>
                <span className="text-slate-500">{insight.date}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{insight.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rediscover Carousel Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> Rediscover Forgotten Value
          </h2>
          <Link href="/rediscover" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
            Explore All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-2">
            <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              Unfinished Idea (90d ago)
            </span>
            <h3 className="font-medium text-sm text-slate-200">Voice-based Capture for Driving</h3>
            <p className="text-xs text-slate-400 line-clamp-2">
              Hands-free voice memo &rarr; Whisper &rarr; AI formatting into structured notes.
            </p>
            <Link href="/rediscover" className="text-xs text-indigo-400 block pt-1 hover:underline">
              Revisit Idea →
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-2">
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded border border-indigo-400/20">
              High Momentum
            </span>
            <h3 className="font-medium text-sm text-slate-200">AI Web-to-Figma Converter</h3>
            <p className="text-xs text-slate-400 line-clamp-2">
              3 related notes connected in the last 14 days. Evolving toward MVP.
            </p>
            <Link href="/rediscover" className="text-xs text-indigo-400 block pt-1 hover:underline">
              View Growth →
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-2">
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
              Notebook Scan
            </span>
            <h3 className="font-medium text-sm text-slate-200">DOM Bounding Box Payload</h3>
            <p className="text-xs text-slate-400 line-clamp-2">
              Handwritten note scanned from physical journal on Feb 2026.
            </p>
            <Link href="/rediscover" className="text-xs text-indigo-400 block pt-1 hover:underline">
              Inspect Source →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Captures List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" /> Recent Captures
          </h2>
          <Link href="/library" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
            View Library <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500 text-sm">Loading library items...</div>
        ) : recentItems.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm border border-slate-800/80 rounded-xl bg-slate-900/40">
            No captures yet. Write your first thought above!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentItems.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="group p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                      {item.contentType}
                    </span>
                    <span className="text-slate-500">{item.category?.name || "General"}</span>
                  </div>

                  <h3 className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{item.summary || item.rawContent}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span>Source: {item.source}</span>
                  <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Inspect →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
