import { NextResponse } from "next/server";
import { evaluateIdea } from "@/lib/ai/developer";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const evaluation = await evaluateIdea(params.id);

    const item = await db.knowledgeItem.findUnique({ where: { id: params.id } });
    let existingData = {};
    if (item?.structuredData) {
      try {
        existingData = JSON.parse(item.structuredData);
      } catch (e) {}
    }

    await db.knowledgeItem.update({
      where: { id: params.id },
      data: {
        structuredData: JSON.stringify({
          ...existingData,
          evaluation,
          lastEvaluatedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({ success: true, evaluation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
