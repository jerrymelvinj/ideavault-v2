import { NextResponse } from "next/server";
import { getAutonomousIdeaForecasts } from "@/lib/ai/forecast";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const report = await getAutonomousIdeaForecasts();
    return NextResponse.json(report, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (error: any) {
    console.error("GET /api/forecast error:", error);
    return NextResponse.json({ error: error?.message || "Failed to generate forecasts" }, { status: 500 });
  }
}
