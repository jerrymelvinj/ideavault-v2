import { NextResponse } from "next/server";
import { answerQuestionWithKnowledgeBase } from "@/lib/ai/search";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const defaultUser = await db.user.findFirst();
    const userId = defaultUser ? defaultUser.id : "default-user-id";

    const response = await answerQuestionWithKnowledgeBase(question, userId);

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
