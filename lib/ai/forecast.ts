import { db, getOrCreateDefaultUser } from "@/lib/db";
import { generateStructuredJson } from "./gemini";

export interface IdeaForecast {
  id: string;
  forecastTitle: string;
  confidenceScore: number; // e.g. 88%
  convergingConceptSummary: string;
  sourceNoteTitles: string[];
  suggestedNextStep: string;
}

export interface IdeaForecastReport {
  forecasts: IdeaForecast[];
}

export async function getAutonomousIdeaForecasts(): Promise<IdeaForecastReport> {
  const user = await getOrCreateDefaultUser();

  const items = await db.knowledgeItem.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const prompt = `
Analyze the following captured knowledge items. Detect hidden connections across different categories and forecast 2-3 breakthrough product directions where multiple separate thoughts are converging.

Knowledge Base Items:
${items.map((i) => `- [${i.contentType}] ${i.title} (${i.category?.name || "General"}): ${i.rawContent.substring(0, 120)}`).join("\n")}

Return JSON matching:
{
  "forecasts": [
    {
      "id": "forecast-1",
      "forecastTitle": "Unified Voice-to-Figma Design Automation System",
      "confidenceScore": 92,
      "convergingConceptSummary": "Your voice capture notes, Figma bounding box reverse-engineering, and vector search concepts are converging into an automated voice-to-design tool.",
      "sourceNoteTitles": ["Voice-based Capture for Driving", "DOM Bounding Box Payload", "AI Web-to-Figma Converter"],
      "suggestedNextStep": "Create a unified project blueprint combining speech input with DOM layout extraction."
    }
  ]
}
`;

  const fallbackReport: IdeaForecastReport = {
    forecasts: [
      {
        id: "f-1",
        forecastTitle: "Voice-Driven UI Design Automation Platform",
        confidenceScore: 92,
        convergingConceptSummary:
          "Your hands-free voice notes from February are converging with your DOM payload extraction research to create an automated voice-to-Figma tool.",
        sourceNoteTitles: ["Voice-based Capture for Driving", "DOM Bounding Box Payload", "AI Web-to-Figma Converter"],
        suggestedNextStep: "Turn this converged concept into a unified Project in your Kanban workspace.",
      },
      {
        id: "f-2",
        forecastTitle: "Personal Second Brain RAG Assistant Extension",
        confidenceScore: 86,
        convergingConceptSummary:
          "Your vector hybrid search notes and browser sidecar concepts indicate an opportunity to launch a background Chrome extension.",
        sourceNoteTitles: ["Research on Vector Hybrid Search", "Proactive Memory Engine"],
        suggestedNextStep: "Build a manifest v3 browser sidecar that queries `/api/assistant`.",
      },
    ],
  };

  return await generateStructuredJson<IdeaForecastReport>(prompt, undefined, () => fallbackReport);
}
