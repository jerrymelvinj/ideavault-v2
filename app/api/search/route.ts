import { NextResponse } from "next/server";
import { performHybridSearch } from "@/lib/ai/search";
import { getOrCreateDefaultUser } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { query, category, contentType, status } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ results: [] });
    }

    const user = await getOrCreateDefaultUser();

    const results = await performHybridSearch(query, {
      userId: user.id,
      category,
      contentType,
      status,
    });

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
