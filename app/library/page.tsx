"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  List,
  Table as TableIcon,
  Filter,
  Search,
  Plus,
  Trash2,
  Sparkles,
  ArrowUpDown,
  Tag,
} from "lucide-react";

export default function LibraryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "list" | "table">("card");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, [selectedType, selectedCategory]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType) params.append("contentType", selectedType);
      if (selectedCategory) params.append("category", selectedCategory);

      const res = await fetch(`/api/items?${params.toString()}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this knowledge item?")) return;

    try {
      await fetch(`/api/items/${id}`, { method: "DELETE" });
      setItems(items.filter((i) => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rawContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Personal Knowledge Library</h1>
          <p className="text-sm text-slate-400">All captured thoughts, projects, research notes, and references.</p>
        </div>

        <Link
          href="/capture"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-md shadow-indigo-600/20 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Capture New Item
        </Link>
      </div>

      {/* Filter & View Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search inside library */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter library..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Content Types</option>
            <option value="Idea">Idea</option>
            <option value="Note">Note</option>
            <option value="Project">Project</option>
            <option value="Research">Research</option>
            <option value="Draft">Draft</option>
            <option value="Reference">Reference</option>
          </select>

          {/* View Switcher */}
          <div className="flex items-center bg-slate-950 p-1 border border-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded ${viewMode === "card" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded ${viewMode === "list" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded ${viewMode === "table" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Library View Content */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Loading knowledge items...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 border border-slate-800/80 rounded-2xl bg-slate-900/40 text-slate-400 text-sm">
          No knowledge items match your filter criteria.
        </div>
      ) : viewMode === "card" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className="group p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                    {item.contentType}
                  </span>
                  <span className="text-slate-400">{item.category?.name || "General"}</span>
                </div>

                <h3 className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {item.summary || item.rawContent}
                </p>
              </div>

              {/* Tags & Footer */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {item.tags?.slice(0, 3).map((t: any) => (
                    <span
                      key={t.tag.id}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400"
                    >
                      #{t.tag.name}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="hover:text-rose-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 flex items-center justify-between transition-all"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-indigo-400">{item.contentType}</span>
                  <span className="text-xs text-slate-500">•</span>
                  <h3 className="font-medium text-sm text-slate-200 hover:text-indigo-300">{item.title}</h3>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">{item.summary || item.rawContent}</p>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>{item.category?.name || "General"}</span>
                <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                <button onClick={(e) => handleDelete(item.id, e)} className="hover:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="p-3.5">Title</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Updated</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40">
                  <td className="p-3.5 font-medium text-slate-200">
                    <Link href={`/items/${item.id}`} className="hover:text-indigo-400">
                      {item.title}
                    </Link>
                  </td>
                  <td className="p-3.5">{item.contentType}</td>
                  <td className="p-3.5">{item.category?.name || "General"}</td>
                  <td className="p-3.5">{item.status}</td>
                  <td className="p-3.5 text-slate-500">{new Date(item.updatedAt).toLocaleDateString()}</td>
                  <td className="p-3.5 text-right space-x-2">
                    <Link href={`/items/${item.id}`} className="text-indigo-400 hover:underline">
                      Inspect
                    </Link>
                    <button onClick={(e) => handleDelete(item.id, e)} className="text-rose-400 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
