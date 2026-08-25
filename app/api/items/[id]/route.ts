import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { processKnowledgeItemPipeline } from "@/lib/ai/pipeline";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const item = await db.knowledgeItem.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        project: true,
        tags: { include: { tag: true } },
        versions: { orderBy: { createdAt: "desc" } },
        sourceItemRel: { include: { targetItem: true } },
        targetItemRel: { include: { sourceItem: true } },
      },
    });

    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    return NextResponse.json({ item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { title, rawContent, summary, contentType, status, categoryName } = body;

    const existing = await db.knowledgeItem.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    // Handle Category update if specified
    let categoryId = existing.categoryId;
    if (categoryName) {
      const cat = await db.category.findFirst({
        where: { userId: existing.userId, name: categoryName },
      });
      if (cat) categoryId = cat.id;
      else {
        const newCat = await db.category.create({
          data: { userId: existing.userId, name: categoryName },
        });
        categoryId = newCat.id;
      }
    }

    // Save Version history if rawContent changed
    if (rawContent && rawContent !== existing.rawContent) {
      await db.version.create({
        data: {
          itemId: params.id,
          content: rawContent,
          changeSummary: "User edit",
        },
      });
    }

    const updated = await db.knowledgeItem.update({
      where: { id: params.id },
      data: {
        ...(title ? { title } : {}),
        ...(rawContent ? { rawContent } : {}),
        ...(summary !== undefined ? { summary } : {}),
        ...(contentType ? { contentType } : {}),
        ...(status ? { status } : {}),
        ...(categoryId !== undefined ? { categoryId } : {}),
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    // Re-run AI pipeline if content was modified
    if (rawContent && rawContent !== existing.rawContent) {
      processKnowledgeItemPipeline(params.id).catch(console.error);
    }

    return NextResponse.json({ item: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await db.knowledgeItem.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
