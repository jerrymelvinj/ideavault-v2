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
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Capture", href: "/capture", icon: PenTool, highlight: true },
    { name: "Library", href: "/library", icon: BookOpen },
    { name: "Search", href: "/search", icon: Search },
    { name: "AI Assistant", href: "/assistant", icon: Bot },
    { name: "Rediscover", href: "/rediscover", icon: Sparkles },
    { name: "Connections", href: "/connections", icon: GitFork },
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
              IdeaVault <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">MVP</span>
            </h1>
            <p className="text-xs text-slate-400">Personal Second Brain</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                    : item.highlight
                    ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : item.highlight ? "text-emerald-400" : ""}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Proactive Tip Banner */}
      <div className="p-4 m-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
          <Lightbulb className="w-4 h-4" /> Proactive Memory
        </div>
        <p className="text-slate-400 leading-relaxed">
          AI continuously categorizes, connects thoughts & surfacing forgotten ideas.
        </p>
      </div>
    </aside>
  );
}
