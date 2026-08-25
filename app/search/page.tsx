"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Sparkles, Filter, ArrowRight, BookOpen, Layers } from "lucide-react";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          contentType: selectedType || undefined,
        }),
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Search className="w-6 h-6 text-indigo-400" /> Hybrid Semantic Search
        </h1>
        <p className="text-sm text-slate-400">
          Search using natural language meaning or exact keywords across your personal library.
        </p>
      </div>

      {/* Main Search Input Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything (e.g. 'Ideas I had about converting websites into designs')..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-28 py-4 text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-xl transition-colors"
          />
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
          >
            {isSearching ? "Searching..." : "Search Vault"}
          </button>
        </div>

        {/* Suggested Queries */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="text-slate-500">Try searching:</span>
          {[
            "Figma AI tools",
            "Show unfinished ideas",
            "Voice capture concepts",
            "Design automation",
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setQuery(prompt);
                handleSearch(prompt);
              }}
              className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg hover:border-indigo-500/40 hover:text-slate-200 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </form>

      {/* Search Results List */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{results.length} results found</span>
          {results.length > 0 && <span>Ranked by Hybrid Vector Similarity</span>}
        </div>

        {isSearching ? (
          <div className="text-center py-12 text-slate-500 text-sm">Searching your second brain...</div>
        ) : results.length === 0 ? (
          query && (
            <div className="text-center py-12 border border-slate-800/80 rounded-2xl bg-slate-900/40 text-slate-400 text-sm">
              No matching knowledge items found.
            </div>
          )
        ) : (
          <div className="space-y-4">
            {results.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="group p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all block space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                      {item.contentType}
                    </span>
                    <span className="text-slate-400 font-medium">{item.categoryName || "General"}</span>
                  </div>

                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {item.matchType} Match ({Math.round(item.score * 100)}%)
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-base text-slate-100 group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1 line-clamp-2">
                    {item.summary || item.rawContent}
                  </p>
                </div>

                {/* AI Relevance Justification */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-indigo-300/80 text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" /> {item.relevanceReason}
                  </span>
                  <span className="text-indigo-400 font-medium group-hover:translate-x-1 transition-transform">
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-500 text-sm">Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
