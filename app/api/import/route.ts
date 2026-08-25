import { NextResponse } from "next/server";
import { db, getOrCreateDefaultUser } from "@/lib/db";
import { processKnowledgeItemPipeline } from "@/lib/ai/pipeline";
import { generateTextResponse } from "@/lib/ai/gemini";

export async function POST(req: Request) {
  try {
    const { sourceType, content, title, fileName } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const user = await getOrCreateDefaultUser();

    let processedTitle = title || fileName || `Imported ${sourceType}`;
    let processedContent = content;

    // Special handling for Physical Notebook OCR Image interpretation
    if (sourceType === "OCR") {
      const ocrPrompt = `You are an OCR and handwriting analysis assistant. Interpret the following raw text or OCR scan from a handwritten physical notebook and reconstruct it into clear markdown notes.
      Raw OCR Text: "${content}"`;
      processedContent = await generateTextResponse(
        ocrPrompt,
        "Clean up OCR output while preserving exact handwritten intent.",
        content
      );
      processedTitle = `Notebook Scan: ${processedTitle}`;
    }

    const item = await db.knowledgeItem.create({
      data: {
        userId: user.id,
        title: processedTitle,
        rawContent: processedContent,
        summary: processedContent.substring(0, 150),
        contentType: sourceType === "OCR" ? "Note" : "Reference",
        status: "Active",
        source: sourceType || "Direct",
      },
    });

    await db.source.create({
      data: {
        itemId: item.id,
        sourceType: sourceType || "File",
        externalId: fileName || null,
        originalUrl: null,
      },
    });

    processKnowledgeItemPipeline(item.id).catch(console.error);

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
