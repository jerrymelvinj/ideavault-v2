"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Kanban,
  Flag,
  FolderPlus,
} from "lucide-react";

interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  status: "ToDo" | "InProgress" | "Done";
  priority: "High" | "Medium" | "Low";
}

interface Project {
  id: string;
  name: string;
  description?: string;
  milestones?: string;
  tasks: ProjectTask[];
  knowledgeItems?: any[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [isAddingTask, setIsAddingTask] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      const loadedProjects: Project[] = data.projects || [];
      setProjects(loadedProjects);
      if (loadedProjects.length > 0 && !activeProject) {
        setActiveProject(loadedProjects[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: "ToDo" | "InProgress" | "Done") => {
    if (!activeProject) return;

    // Optimistic UI update
    const updatedTasks = activeProject.tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    setActiveProject({ ...activeProject, tasks: updatedTasks });

    try {
      await fetch(`/api/projects/${activeProject.id}/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus }),
      });
    } catch (err) {
      console.error(err);
      fetchProjects();
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !activeProject) return;

    setIsAddingTask(true);
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskTitle, priority: newTaskPriority }),
      });
      const data = await res.json();
      if (data.success) {
        setNewTaskTitle("");
        setActiveProject({ ...activeProject, tasks: [...activeProject.tasks, data.task] });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingTask(false);
    }
  };

  const parseMilestones = (milestonesJson?: string): string[] => {
    if (!milestonesJson) return [];
    try {
      return JSON.parse(milestonesJson);
    } catch {
      return [];
    }
  };

  const getTasksByStatus = (status: "ToDo" | "InProgress" | "Done") => {
    return (activeProject?.tasks || []).filter((t) => t.status === status);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Kanban className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Projects & AI Kanban Workspace <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">Phase 2</span>
            </h1>
            <p className="text-xs text-slate-400">Turn raw captured thoughts into structured projects with AI-generated Kanban task boards.</p>
          </div>
        </div>

        {/* Project Selector Tabs */}
        {projects.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl overflow-x-auto">
            {projects.map((proj) => (
              <button
                key={proj.id}
                onClick={() => setActiveProject(proj)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeProject?.id === proj.id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                {proj.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Loading project boards...</div>
      ) : !activeProject ? (
        <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto">
            <FolderPlus className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">No Active Projects Yet</h3>
          <p className="text-xs text-slate-400">
            Go to any capture in your Library or Capture box and click "Turn into Project" to generate an AI Kanban board!
          </p>
          <Link
            href="/library"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition-colors"
          >
            Explore Library →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Project Blueprint Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active Blueprint
                </span>
                <h2 className="text-lg font-bold text-white mt-1">{activeProject.name}</h2>
              </div>

              {/* Quick Add Task Input */}
              <form onSubmit={handleCreateTask} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add custom Kanban task..."
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-56"
                />
                <select
                  value={newTaskPriority}
                  onChange={(e: any) => setNewTaskPriority(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <button
                  type="submit"
                  disabled={isAddingTask || !newTaskTitle.trim()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Task
                </button>
              </form>
            </div>

            {activeProject.description && (
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">{activeProject.description}</p>
            )}

            {/* AI Milestones Banner */}
            {parseMilestones(activeProject.milestones).length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5 text-indigo-400" /> Target Milestones:
                </span>
                {parseMilestones(activeProject.milestones).map((m, i) => (
                  <span
                    key={i}
                    className="text-xs bg-slate-950/80 border border-slate-800 text-slate-300 px-3 py-1 rounded-lg"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Interactive 3-Column Kanban Board */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Column 1: To Do */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <h3 className="font-bold text-slate-200 text-sm">To Do</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-semibold">
                  {getTasksByStatus("ToDo").length}
                </span>
              </div>

              <div className="space-y-3">
                {getTasksByStatus("ToDo").map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-2 group shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                          task.priority === "High"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : task.priority === "Medium"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-100 text-xs leading-snug">{task.title}</h4>
                    {task.description && <p className="text-[11px] text-slate-400">{task.description}</p>}

                    <div className="pt-2 border-t border-slate-900 flex justify-end">
                      <button
                        onClick={() => handleUpdateTaskStatus(task.id, "InProgress")}
                        className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        Start Task &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                  <h3 className="font-bold text-slate-200 text-sm">In Progress</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-semibold">
                  {getTasksByStatus("InProgress").length}
                </span>
              </div>

              <div className="space-y-3">
                {getTasksByStatus("InProgress").map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 hover:border-indigo-500 transition-all space-y-2 shadow-md"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                          task.priority === "High"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-100 text-xs leading-snug">{task.title}</h4>
                    {task.description && <p className="text-[11px] text-slate-400">{task.description}</p>}

                    <div className="pt-2 border-t border-slate-900 flex justify-between">
                      <button
                        onClick={() => handleUpdateTaskStatus(task.id, "ToDo")}
                        className="text-[11px] text-slate-500 hover:text-slate-300"
                      >
                        &larr; Move back
                      </button>
                      <button
                        onClick={() => handleUpdateTaskStatus(task.id, "Done")}
                        className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                      >
                        Complete Task ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Completed */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <h3 className="font-bold text-slate-200 text-sm">Completed</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-semibold">
                  {getTasksByStatus("Done").length}
                </span>
              </div>

              <div className="space-y-3">
                {getTasksByStatus("Done").map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-2 opacity-85"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-emerald-500/10 text-emerald-400">
                        Done ✓
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-300 text-xs line-through">{task.title}</h4>

                    <div className="pt-2 border-t border-slate-900 flex justify-start">
                      <button
                        onClick={() => handleUpdateTaskStatus(task.id, "InProgress")}
                        className="text-[11px] text-slate-500 hover:text-slate-300"
                      >
                        Reopen Task
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
