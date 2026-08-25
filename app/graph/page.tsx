"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  GitFork,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Filter,
  ArrowRight,
  ExternalLink,
  Layers,
  Brain,
} from "lucide-react";
import { GraphNode, GraphEdge } from "@/lib/ai/graph";

export default function KnowledgeGraphPage() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 400, y: 300 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("All");

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    try {
      const res = await fetch("/api/graph");
      const data = await res.json();
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
    } catch (e) {
      console.error("Failed to load graph:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.4));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 400, y: 300 });
  };

  const filteredNodes = filterType === "All" ? nodes : nodes.filter((n) => n.type === filterType);

  const getNodeColor = (type: string) => {
    switch (type) {
      case "Category":
        return "#818cf8"; // Indigo
      case "Idea":
        return "#f59e0b"; // Amber
      case "Research":
        return "#3b82f6"; // Blue
      case "Project":
        return "#10b981"; // Emerald
      default:
        return "#a855f7"; // Purple
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <GitFork className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Interactive Idea Knowledge Graph <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">Phase 2</span>
            </h1>
            <p className="text-xs text-slate-400">Visual 2D canvas of connected thoughts, categories, and concept evolutions.</p>
          </div>
        </div>

        {/* Zoom & Filter Toolbar */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs">
          <div className="flex items-center gap-1.5 px-2 border-r border-slate-800 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Nodes</option>
              <option value="Category" className="bg-slate-900">Categories</option>
              <option value="Idea" className="bg-slate-900">Ideas</option>
              <option value="Research" className="bg-slate-900">Research</option>
              <option value="Project" className="bg-slate-900">Projects</option>
            </select>
          </div>

          <button onClick={handleZoomIn} title="Zoom In" className="p-1.5 hover:bg-slate-800 rounded text-slate-300">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleZoomOut} title="Zoom Out" className="p-1.5 hover:bg-slate-800 rounded text-slate-300">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={handleResetZoom} title="Reset View" className="p-1.5 hover:bg-slate-800 rounded text-slate-300">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas + Node Inspector Sidebar */}
      <div className="flex-1 flex gap-4 overflow-hidden relative">
        {/* 2D Visual Canvas Area */}
        <div
          ref={canvasRef}
          className="flex-1 bg-slate-950 border border-slate-800/80 rounded-2xl relative overflow-hidden cursor-grab active:cursor-grabbing shadow-inner flex items-center justify-center"
        >
          {/* Subtle Grid Pattern Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

          {loading ? (
            <div className="flex flex-col items-center gap-3 text-slate-400 text-xs">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span>Building Knowledge Graph...</span>
            </div>
          ) : (
            <svg
              className="w-full h-full"
              viewBox="-400 -300 800 600"
              style={{ transform: `scale(${zoom})`, transition: "transform 0.2s ease-out" }}
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="20"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                </marker>
              </defs>

              {/* Render Connection Edges */}
              {edges.map((edge) => {
                const sourceNode = filteredNodes.find((n) => n.id === edge.source);
                const targetNode = filteredNodes.find((n) => n.id === edge.target);

                if (!sourceNode || !targetNode) return null;

                const x1 = sourceNode.x || 0;
                const y1 = sourceNode.y || 0;
                const x2 = targetNode.x || 0;
                const y2 = targetNode.y || 0;

                return (
                  <g key={edge.id}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#475569"
                      strokeWidth={1.5}
                      strokeDasharray={edge.label === "BelongsTo" ? "4 4" : undefined}
                      markerEnd="url(#arrow)"
                      className="opacity-60"
                    />
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 4}
                      fill="#94a3b8"
                      fontSize="9"
                      textAnchor="middle"
                      className="select-none font-sans opacity-80 pointer-events-none"
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}

              {/* Render Graph Nodes */}
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const color = getNodeColor(node.type);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x || 0}, ${node.y || 0})`}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer transition-transform hover:scale-125"
                  >
                    <circle
                      r={node.val}
                      fill={color}
                      fillOpacity={0.25}
                      stroke={color}
                      strokeWidth={isSelected ? 3 : 1.5}
                      className="transition-all"
                    />
                    <circle r={node.val / 2} fill={color} />
                    <text
                      y={node.val + 14}
                      fill={isSelected ? "#ffffff" : "#cbd5e1"}
                      fontSize="11"
                      fontWeight={isSelected ? "bold" : "normal"}
                      textAnchor="middle"
                      className="select-none pointer-events-none shadow-sm"
                    >
                      {node.label.length > 20 ? node.label.substring(0, 18) + "..." : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Legend Overlay */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 p-3 rounded-xl backdrop-blur-md text-[11px] space-y-1.5">
            <span className="font-semibold text-slate-300 block mb-1">Graph Legend</span>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Ideas
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Categories
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Research
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Projects
            </div>
          </div>
        </div>

        {/* Node Inspector Panel */}
        {selectedNode && (
          <div className="w-80 bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between overflow-y-auto animate-fade-in shrink-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                  style={{
                    color: getNodeColor(selectedNode.type),
                    borderColor: `${getNodeColor(selectedNode.type)}40`,
                    backgroundColor: `${getNodeColor(selectedNode.type)}15`,
                  }}
                >
                  {selectedNode.type}
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <div>
                <h3 className="font-bold text-white text-base leading-snug">{selectedNode.label}</h3>
                <p className="text-xs text-slate-400 mt-1">Category: {selectedNode.category}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 space-y-2">
                <span className="font-semibold text-indigo-300 flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5 text-indigo-400" /> AI Graph Insights:
                </span>
                <p className="text-slate-400 leading-relaxed">
                  This concept forms an active cluster node connected to {selectedNode.category}.
                </p>
              </div>
            </div>

            {selectedNode.type !== "Category" && (
              <Link
                href={`/items/${selectedNode.id}`}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-md"
              >
                <span>Inspect Workspace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
