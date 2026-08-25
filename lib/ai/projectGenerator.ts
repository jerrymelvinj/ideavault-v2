import { db, getOrCreateDefaultUser } from "@/lib/db";
import { generateStructuredJson } from "./gemini";

export interface GeneratedTask {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  status: "ToDo" | "InProgress" | "Done";
}

export interface GeneratedProjectBlueprint {
  projectName: string;
  description: string;
  milestones: string[];
  tasks: GeneratedTask[];
}

/**
 * AI Service that turns any raw Idea / Knowledge Item into a Project Blueprint with Kanban tasks
 */
export async function convertIdeaToProject(itemId: string): Promise<any> {
  const item = await db.knowledgeItem.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw new Error("Knowledge item not found");
  }

  const prompt = `
Analyze the following idea and transform it into a structured, actionable Project Blueprint with a Kanban task list.

Idea Title: "${item.title}"
Raw Content: "${item.rawContent}"

Return JSON matching:
{
  "projectName": "Clean concise project title",
  "description": "2-sentence executive summary of the project goals",
  "milestones": ["Milestone 1: Proof of Concept", "Milestone 2: MVP Beta Release", "Milestone 3: Launch"],
  "tasks": [
    {
      "title": "Actionable task name",
      "description": "Specific implementation steps",
      "priority": "High" | "Medium" | "Low",
      "status": "ToDo"
    }
  ]
}
Generate 4 to 6 realistic, high-value tasks divided logically across priorities.
`;

  const fallbackBlueprint: GeneratedProjectBlueprint = {
    projectName: `Project: ${item.title}`,
    description: item.summary || item.rawContent.substring(0, 120),
    milestones: ["Milestone 1: Technical Spec", "Milestone 2: Prototype Development", "Milestone 3: User Testing"],
    tasks: [
      { title: "Draft technical requirements & architecture", description: "Define data models, APIs, and key interfaces.", priority: "High", status: "ToDo" },
      { title: "Build core feature prototype", description: "Implement initial working MVP code.", priority: "High", status: "ToDo" },
      { title: "Design user interface wireframes", description: "Create clean component layouts.", priority: "Medium", status: "ToDo" },
      { title: "Conduct initial user feedback testing", description: "Validate prototype with early users.", priority: "Medium", status: "ToDo" },
    ],
  };

  const blueprint = await generateStructuredJson<GeneratedProjectBlueprint>(prompt, undefined, () => fallbackBlueprint);

  const user = await getOrCreateDefaultUser();

  // Create Project in Database
  const project = await db.project.create({
    data: {
      userId: user.id,
      name: blueprint.projectName,
      description: blueprint.description,
      milestones: JSON.stringify(blueprint.milestones),
      tasks: {
        create: blueprint.tasks.map((t) => ({
          title: t.title,
          description: t.description,
          priority: t.priority,
          status: t.status,
        })),
      },
    },
    include: {
      tasks: true,
    },
  });

  // Associate item with project
  await db.knowledgeItem.update({
    where: { id: itemId },
    data: { projectId: project.id, contentType: "Project" },
  });

  return project;
}
