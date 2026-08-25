import { NextResponse } from "next/server";
import { getKnowledgeGraphData } from "@/lib/ai/graph";

export async function GET() {
  try {
    const graphData = await getKnowledgeGraphData();
    return NextResponse.json(graphData);
  } catch (error: any) {
    console.error("Error building graph data:", error);
    return NextResponse.json({ error: error?.message || "Failed to load graph" }, { status: 500 });
  }
}
