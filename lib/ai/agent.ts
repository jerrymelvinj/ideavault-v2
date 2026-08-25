import { db, getOrCreateDefaultUser } from "@/lib/db";
import { generateStructuredJson } from "./gemini";

export interface CoFounderSpec {
  projectTitle: string;
  executivePitch: string;
  technicalArchitecture: { component: string; detail: string }[];
  marketPositioning: string;
  mvpBuildRoadmap: string[];
}

export async function generateCoFounderSpec(projectId?: string): Promise<CoFounderSpec> {
  const user = await getOrCreateDefaultUser();

  const projects = await db.project.findMany({
    where: { userId: user.id },
    include: { tasks: true, knowledgeItems: true },
  });

  const selectedProject = projects[0];
  const projectName = selectedProject?.name || "AI Web-to-Figma Converter & Design System Engine";
  const projectDesc = selectedProject?.description || "Automated design extraction from web DOM into Figma API component payloads.";

  const prompt = `
Act as an elite Technical AI Co-Founder. Analyze the active project concept and auto-generate a comprehensive Technical Architecture Spec, Executive Pitch, and MVP Build Roadmap.

Project Title: "${projectName}"
Description: "${projectDesc}"

Return JSON matching:
{
  "projectTitle": "${projectName}",
  "executivePitch": "2-sentence high-impact startup elevator pitch",
  "technicalArchitecture": [
    { "component": "Frontend Ingestion Layer", "detail": "Next.js 14 App Router + Web Speech API + HTML5 File Parser" },
    { "component": "AI Processing Pipeline", "detail": "Google Gemini 2.5 Flash + Vector Embeddings Engine" },
    { "component": "Database Storage Layer", "detail": "Supabase Managed PostgreSQL + Prisma ORM + Firebase Auth" }
  ],
  "marketPositioning": "Targeting UI/UX engineers, product managers, and founders looking to compress design-to-code cycles from weeks to minutes.",
  "mvpBuildRoadmap": [
    "Sprint 1: Complete Web Speech & DOM Payload Extractor",
    "Sprint 2: Integrate Gemini Structured JSON Pipeline",
    "Sprint 3: Launch Interactive Kanban Board & Knowledge Graph"
  ]
}
`;

  const fallbackSpec: CoFounderSpec = {
    projectTitle: projectName,
    executivePitch:
      "IdeaVault is an intelligent personal second brain that captures raw thoughts, auto-connects them via AI vector embeddings, and transforms early concepts into executable project blueprints.",
    technicalArchitecture: [
      { component: "Ingestion Engine", detail: "Universal Capture + Web Speech API + Telegram Bot Webhook" },
      { component: "AI Pipeline Engine", detail: "Google Gemini 2.5 Flash for structuring, summarizing & vector similarity" },
      { component: "Database Infrastructure", detail: "Supabase Managed PostgreSQL + Firebase Auth + Prisma ORM" },
      { component: "Knowledge Network", detail: "Interactive 2D SVG Knowledge Graph + AI Kanban Board" },
    ],
    marketPositioning:
      "Targeting knowledge workers, founders, and engineers seeking a connected second brain that doesn't just store notes, but proactively helps build them.",
    mvpBuildRoadmap: [
      "Phase 1: Universal Capture & AI Organization Engine (Done ✓)",
      "Phase 2: Interactive Knowledge Graph & AI Kanban Boards (Done ✓)",
      "Phase 3: Personal Cognitive Assistant & AI Co-Founder Agent (Active 🚀)",
    ],
  };

  return await generateStructuredJson<CoFounderSpec>(prompt, undefined, () => fallbackSpec);
}
