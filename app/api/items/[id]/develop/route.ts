import { NextResponse } from "next/server";
import { developIdea } from "@/lib/ai/developer";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const development = await developIdea(params.id);

    // Save structured development output to KnowledgeItem structuredData
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
          development,
          lastDevelopedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({ success: true, development });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
