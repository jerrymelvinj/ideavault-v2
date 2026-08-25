import { NextResponse } from "next/server";
import { db, getOrCreateDefaultUser } from "@/lib/db";
import { processKnowledgeItemPipeline } from "@/lib/ai/pipeline";

export async function POST(req: Request) {
  try {
    const { content, title, source = "Direct" } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Ensure User record exists in Postgres DB
    const user = await getOrCreateDefaultUser();

    // 1. Create KnowledgeItem in DB immediately
    const item = await db.knowledgeItem.create({
      data: {
        userId: user.id,
        title: title || "Untitled Idea",
        rawContent: content.trim(),
        summary: content.trim().substring(0, 120),
        contentType: "Idea",
        status: "Active",
        source,
      },
    });

    // Create Version entry
    await db.version.create({
      data: {
        itemId: item.id,
        content: content.trim(),
        changeSummary: "Initial capture",
      },
    });

    // 2. Trigger AI Organization Pipeline asynchronously
    processKnowledgeItemPipeline(item.id).catch((err) => {
      console.error("AI Ingestion Pipeline error:", err);
    });

    // Fetch updated item with category & tags
    const freshItem = await db.knowledgeItem.findUnique({
      where: { id: item.id },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json({
      success: true,
      item: freshItem || item,
      message: "Captured successfully! AI is analyzing your thought.",
    });
  } catch (error: any) {
    console.error("Capture API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to capture item" }, { status: 500 });
  }
}
