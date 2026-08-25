import { NextResponse } from "next/server";
import { db, getOrCreateDefaultUser } from "@/lib/db";
import { processKnowledgeItemPipeline } from "@/lib/ai/pipeline";

/**
 * Telegram Bot Webhook endpoint for remote message/voice capture
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message;

    if (!message || (!message.text && !message.caption)) {
      return NextResponse.json({ ok: true });
    }

    const textContent = message.text || message.caption || "Telegram Capture";
    const user = await getOrCreateDefaultUser();

    // Create KnowledgeItem from Telegram Webhook
    const item = await db.knowledgeItem.create({
      data: {
        userId: user.id,
        title: textContent.substring(0, 50) || "Telegram Capture",
        rawContent: textContent,
        source: "Telegram",
        contentType: "Idea",
      },
    });

    // Run AI Organization Pipeline
    processKnowledgeItemPipeline(item.id).catch((err) => {
      console.error("Telegram AI pipeline error:", err);
    });

    return NextResponse.json({ ok: true, itemId: item.id });
  } catch (error: any) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ error: error?.message || "Webhook error" }, { status: 500 });
  }
}
