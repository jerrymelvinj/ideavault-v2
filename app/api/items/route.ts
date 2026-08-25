import { NextResponse } from "next/server";
import { db, getOrCreateDefaultUser } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const contentType = searchParams.get("contentType");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    const user = await getOrCreateDefaultUser();

    const items = await db.knowledgeItem.findMany({
      where: {
        userId: user.id,
        ...(contentType ? { contentType } : {}),
        ...(status ? { status } : {}),
        ...(category ? { category: { name: category } } : {}),
      },
      include: {
        category: true,
        project: true,
        tags: { include: { tag: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ items }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error: any) {
    console.error("GET /api/items error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
