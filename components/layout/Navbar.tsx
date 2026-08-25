"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, User, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

export function Navbar() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { user, signInWithGoogle, signOut } = useAuth();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Quick Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative w-96">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything or search thoughts (e.g. Figma AI)..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </form>

      {/* Header Actions & Auth */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/capture")}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> Quick Capture
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-800 text-slate-400 text-xs">
          {user ? (
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold">
                  {(user.displayName || user.email || "U")[0].toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="font-semibold text-slate-200 leading-tight">{user.displayName || "Firebase User"}</p>
                <p className="text-[10px] text-slate-400">{user.email}</p>
              </div>
              <button
                onClick={signOut}
                title="Sign Out"
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 transition-all"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-400" />
              <span>Google Sign-In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
