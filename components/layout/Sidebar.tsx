"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  PenTool,
  BookOpen,
  Search,
  Bot,
  Sparkles,
  GitFork,
  Upload,
  Settings,
  Lightbulb,
  Kanban,
  TrendingUp,
  Compass,
  GitMerge,
  BarChart3,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Capture", href: "/capture", icon: PenTool, highlight: true },
    { name: "Library", href: "/library", icon: BookOpen },
    { name: "Knowledge Graph", href: "/graph", icon: GitFork },
    { name: "Projects & Kanban", href: "/projects", icon: Kanban },
    { name: "Strategy Advisor", href: "/strategy", icon: Compass },
    { name: "Idea Forecasts", href: "/forecast", icon: GitMerge },
    { name: "Thought Analytics", href: "/analytics", icon: BarChart3 },
    { name: "AI Co-Founder", href: "/agent", icon: Bot },
    { name: "Weekly Digest", href: "/digest", icon: TrendingUp },
    { name: "Search", href: "/search", icon: Search },
    { name: "AI Assistant", href: "/assistant", icon: Bot },
    { name: "Rediscover", href: "/rediscover", icon: Sparkles },
    { name: "Import Center", href: "/import", icon: Upload },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/80 backdrop-blur-md flex flex-col justify-between h-screen sticky top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-950 p-1 border border-slate-800 flex items-center justify-center shrink-0 shadow-md">
            <img src="/logo.png" alt="IdeaVault Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide flex items-center gap-1.5">
              IdeaVault <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">Phase 3</span>
            </h1>
            <p className="text-xs text-slate-400">Personal Cognitive Assistant</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 mt-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm font-semibold"
                    : item.highlight
                    ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : item.highlight ? "text-emerald-400" : ""}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Proactive Tip Banner */}
      <div className="p-3 m-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px]">
        <div className="flex items-center gap-1.5 text-purple-400 font-semibold mb-0.5">
          <Lightbulb className="w-3.5 h-3.5" /> Phase 3 Cognitive Active
        </div>
        <p className="text-slate-400 leading-snug">
          Strategy advisor, convergence forecasting & AI co-founder agent live.
        </p>
      </div>
    </aside>
  );
}
