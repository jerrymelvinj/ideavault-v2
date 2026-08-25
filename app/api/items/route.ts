import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const contentType = searchParams.get("contentType");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    const defaultUser = await db.user.findFirst();
    const userId = defaultUser ? defaultUser.id : "default-user-id";

    const items = await db.knowledgeItem.findMany({
      where: {
        userId,
        ...(contentType ? { contentType } : {}),
        ...(status ? { status } : {}),
        ...(category ? { category: { name: category } } : {}),
      },
      include: {
        category: true,
        project: true,
        tags: { include: { tag: true } },
        sourceItemRel: { include: { targetItem: true } },
        targetItemRel: { include: { sourceItem: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
