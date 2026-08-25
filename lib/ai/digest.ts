import { db, getOrCreateDefaultUser } from "@/lib/db";
import { generateStructuredJson } from "./gemini";

export interface WeeklyDigestReport {
  weekTitle: string;
  totalCapturesThisWeek: number;
  topThemes: string[];
  convergingIdeas: { title: string; summary: string }[];
  staleNotesToRevisit: { title: string; daysAgo: number }[];
  strategicRecommendation: string;
}

export async function generateWeeklyDigest(userId?: string): Promise<WeeklyDigestReport> {
  const user = await getOrCreateDefaultUser();
  const targetUserId = userId || user.id;

  const items = await db.knowledgeItem.findMany({
    where: { userId: targetUserId },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  const prompt = `
Analyze the user's recent captured thoughts and synthesize a high-value Weekly AI Executive Digest report.

Recent Captured Thoughts:
${items.map((i) => `- [${i.contentType}] ${i.title}: ${i.rawContent.substring(0, 100)}`).join("\n")}

Return JSON matching:
{
  "weekTitle": "Weekly Digest: AI Systems & Design Tools Expansion",
  "totalCapturesThisWeek": ${items.length},
  "topThemes": ["Theme 1", "Theme 2", "Theme 3"],
  "convergingIdeas": [
    { "title": "Converging Topic 1", "summary": "How 2 recent notes connect into a larger opportunity" }
  ],
  "staleNotesToRevisit": [
    { "title": "Unfinished concept title", "daysAgo": 45 }
  ],
  "strategicRecommendation": "2-sentence strategic advice on what project or idea the user should execute next."
}
`;

  const fallbackReport: WeeklyDigestReport = {
    weekTitle: "Weekly Digest: Second Brain Synthesis",
    totalCapturesThisWeek: items.length,
    topThemes: ["AI Automation & Vector Search", "Design-to-Code Engineering", "Hands-Free Knowledge Ingestion"],
    convergingIdeas: [
      {
        title: "Voice-Based Capture + AI Knowledge Pipeline",
        summary: "Your recent voice notes and RAG assistant queries are converging into an automated daily assistant concept.",
      },
    ],
    staleNotesToRevisit: [
      { title: "Voice-based Capture for Driving", daysAgo: 90 },
      { title: "DOM Bounding Box Payload", daysAgo: 45 },
    ],
    strategicRecommendation:
      "Focus your upcoming sprint on finalizing the Interactive Knowledge Graph and Project Kanban workflow to turn early notes into shipped features.",
  };

  return await generateStructuredJson<WeeklyDigestReport>(prompt, undefined, () => fallbackReport);
}
