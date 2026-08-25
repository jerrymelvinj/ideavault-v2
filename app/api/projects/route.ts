import { NextResponse } from "next/server";
import { db, getOrCreateDefaultUser } from "@/lib/db";
import { convertIdeaToProject } from "@/lib/ai/projectGenerator";

export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();
    const projects = await db.project.findMany({
      where: { userId: user.id },
      include: {
        tasks: true,
        knowledgeItems: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId, name, description } = body;

    // Turn existing idea into project with AI task generation
    if (itemId) {
      const project = await convertIdeaToProject(itemId);
      return NextResponse.json({ success: true, project });
    }

    // Create custom blank project
    const user = await getOrCreateDefaultUser();
    const project = await db.project.create({
      data: {
        userId: user.id,
        name: name || "New Project",
        description: description || "",
      },
      include: { tasks: true },
    });

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create project" }, { status: 500 });
  }
}
