import { NextResponse } from "next/server";
import { generateCoFounderSpec } from "@/lib/ai/agent";

export async function POST() {
  try {
    const spec = await generateCoFounderSpec();
    return NextResponse.json(spec);
  } catch (error: any) {
    console.error("POST /api/agent error:", error);
    return NextResponse.json({ error: error?.message || "Failed to generate co-founder spec" }, { status: 500 });
  }
}
