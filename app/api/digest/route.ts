import { NextResponse } from "next/server";
import { generateWeeklyDigest } from "@/lib/ai/digest";

export async function GET() {
  try {
    const report = await generateWeeklyDigest();
    return NextResponse.json(report);
  } catch (error: any) {
    console.error("GET /api/digest error:", error);
    return NextResponse.json({ error: error?.message || "Failed to generate digest" }, { status: 500 });
  }
}
