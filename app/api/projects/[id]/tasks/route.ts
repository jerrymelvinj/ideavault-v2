import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { title, description, priority } = body;

    const task = await db.projectTask.create({
      data: {
        projectId: params.id,
        title,
        description: description || "",
        priority: priority || "Medium",
        status: "ToDo",
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error("POST /api/projects/[id]/tasks error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create task" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { taskId, status, title, priority } = body;

    const task = await db.projectTask.update({
      where: { id: taskId },
      data: {
        ...(status && { status }),
        ...(title && { title }),
        ...(priority && { priority }),
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error("PUT /api/projects/[id]/tasks error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update task" }, { status: 500 });
  }
}
