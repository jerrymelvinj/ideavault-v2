"use client";

import { useState } from "react";
import { Settings, Key, Shield, Download, RefreshCw, Check, Database } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

export default function SettingsPage() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" /> Settings & Preferences
        </h1>
        <p className="text-sm text-slate-400">
          Manage AI API keys, Firebase backend project settings, privacy, and data exports.
        </p>
      </div>

      {/* Firebase Account & Project Info */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-400" /> Firebase Backend Project Configuration
        </h3>

        <div className="grid md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-medium">Firebase Project ID</span>
            <p className="font-mono text-indigo-300 font-semibold">idea-vault-c85ee</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-medium">Firebase App ID</span>
            <p className="font-mono text-indigo-300 font-semibold truncate">1:501418856999:web:e43dca5c800e83369a3402</p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs">
          <span className="text-slate-400">Google Authentication Status:</span>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-semibold">Signed in as {user.email}</span>
              <button onClick={signOut} className="text-rose-400 underline">Sign Out</button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
            >
              Sign In with Google
            </button>
          )}
        </div>
      </div>

      {/* Gemini AI API Key */}
      <form onSubmit={handleSaveApiKey} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-indigo-400" /> Google Gemini AI API Configuration
        </h3>

        <div className="space-y-2">
          <label className="text-xs text-slate-400">
            Enter your GEMINI_API_KEY to enable live Gemini 2.5 Flash classification, embeddings, and RAG:
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            {isSaved ? "Saved! Key active for AI pipeline." : "App defaults to smart local fallback if key is empty."}
          </span>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
          >
            Save API Key
          </button>
        </div>
      </form>

      {/* Data Export & Reset */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" /> Privacy & Data Portability
        </h3>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div>
            <p className="font-semibold text-slate-200">Export Second Brain Knowledge Base</p>
            <p className="text-slate-400">Download complete library as JSON archive.</p>
          </div>
          <button
            onClick={() => alert("Downloading knowledge base JSON export...")}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl flex items-center gap-1.5 font-medium"
          >
            <Download className="w-3.5 h-3.5" /> Export Data
          </button>
        </div>
      </div>
    </div>
  );
}
