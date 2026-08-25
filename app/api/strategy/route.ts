import { NextResponse } from "next/server";
import { getPersonalStrategyAdvice } from "@/lib/ai/strategy";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question } = body;

    const query = question?.trim() || "Based on everything I have created and captured, what project should I focus on building next?";

    const advice = await getPersonalStrategyAdvice(query);
    return NextResponse.json(advice);
  } catch (error: any) {
    console.error("POST /api/strategy error:", error);
    return NextResponse.json({ error: error?.message || "Failed to generate strategy advice" }, { status: 500 });
  }
}
