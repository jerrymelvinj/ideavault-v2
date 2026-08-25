"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Camera, CheckCircle2, ArrowRight } from "lucide-react";

export default function ImportPage() {
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [sourceType, setSourceType] = useState<"TXT" | "Markdown" | "GoogleDocs" | "Notion" | "OCR">("TXT");
  const [isImporting, setIsImporting] = useState(false);
  const [importedResult, setImportedResult] = useState<any>(null);
  const router = useRouter();

  const handleImport = async () => {
    if (!fileContent.trim() || isImporting) return;

    setIsImporting(true);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType,
          content: fileContent,
          fileName: fileName || `Imported ${sourceType}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setImportedResult(data.item);
        setFileContent("");
        setFileName("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Upload className="w-6 h-6 text-indigo-400" /> Knowledge Import Center
        </h1>
        <p className="text-sm text-slate-400">
          Import external files, Notion pages, Google Docs, or physical notebook OCR photos into your second brain.
        </p>
      </div>

      {/* Integration Selector Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { type: "TXT", label: "File Dropzone", desc: "Markdown, TXT, PDF" },
          { type: "GoogleDocs", label: "Google Docs", desc: "Sync documents" },
          { type: "Notion", label: "Notion Pages", desc: "Import database" },
          { type: "OCR", label: "Notebook OCR", desc: "Physical photos" },
        ].map((item) => (
          <button
            key={item.type}
            onClick={() => setSourceType(item.type as any)}
            className={`p-4 rounded-xl border text-left transition-all ${
              sourceType === item.type
                ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <h3 className="font-semibold text-sm text-slate-200">{item.label}</h3>
            <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
          </button>
        ))}
      </div>

      {/* Content Import Form */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            {sourceType === "OCR"
              ? "Handwritten Notebook OCR Text Input"
              : `${sourceType} Content / Document Payload`}
          </label>

          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Document Name / Title (e.g. Feb 2026 Notebook Entry)"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />

          <textarea
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
            placeholder={
              sourceType === "OCR"
                ? "Paste raw text transcribed from handwritten journal photo..."
                : "Paste document text content here..."
            }
            rows={8}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleImport}
            disabled={isImporting || !fileContent.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs shadow-md transition-all"
          >
            {isImporting ? "Processing & Organizing..." : "Import & Run AI Pipeline"}
          </button>
        </div>
      </div>

      {/* Import Success Feedback */}
      {importedResult && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="font-semibold text-emerald-200">Imported Successfully!</p>
              <p className="text-emerald-300/80">Title: {importedResult.title}</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/items/${importedResult.id}`)}
            className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 rounded-lg font-semibold transition-colors"
          >
            View Note →
          </button>
        </div>
      )}
    </div>
  );
}
