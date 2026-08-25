import { NextResponse } from "next/server";
import { answerQuestionWithKnowledgeBase } from "@/lib/ai/search";
import { getOrCreateDefaultUser } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const user = await getOrCreateDefaultUser();

    const response = await answerQuestionWithKnowledgeBase(question, user.id);

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
