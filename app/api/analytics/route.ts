import { NextResponse } from "next/server";
import { getThinkingPatternMetrics } from "@/lib/ai/analytics";

export async function GET() {
  try {
    const metrics = await getThinkingPatternMetrics();
    return NextResponse.json(metrics);
  } catch (error: any) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch analytics" }, { status: 500 });
  }
}
