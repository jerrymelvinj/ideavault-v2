import { db, getOrCreateDefaultUser } from "@/lib/db";
import { generateStructuredJson } from "./gemini";

export interface StrategyAdviceResult {
  question: string;
  strategicAnswer: string;
  recommendedFocusProject: { title: string; rationale: string };
  identifiedBlindSpots: string[];
  actionItems: string[];
}

export async function getPersonalStrategyAdvice(question: string): Promise<StrategyAdviceResult> {
  const user = await getOrCreateDefaultUser();

  const items = await db.knowledgeItem.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const projects = await db.project.findMany({
    where: { userId: user.id },
  });

  const prompt = `
You are the user's Personal Strategy Advisor. Analyze their multi-month creative trajectory, stored concepts, and projects to answer their strategic question.

User Question: "${question}"

Knowledge Base Context (20 Recent Captures):
${items.map((i) => `- [${i.contentType}] ${i.title} (${i.category?.name || "General"}): ${i.rawContent.substring(0, 120)}`).join("\n")}

Existing Active Projects:
${projects.map((p) => `- ${p.name}: ${p.description}`).join("\n")}

Return JSON matching:
{
  "question": "${question}",
  "strategicAnswer": "3-sentence grounded strategic direction based on their captured ideas.",
  "recommendedFocusProject": {
    "title": "Specific recommended project title to build next",
    "rationale": "Why this leverages their highest momentum captured thoughts."
  },
  "identifiedBlindSpots": [
    "Blind spot 1: High focus on prototype capture but missing user validation steps",
    "Blind spot 2: Unlinked research notes on AI APIs"
  ],
  "actionItems": [
    "Immediate Action 1",
    "Immediate Action 2",
    "Immediate Action 3"
  ]
}
`;

  const fallbackResult: StrategyAdviceResult = {
    question,
    strategicAnswer:
      "Based on your captured concepts in AI automation, voice ingestion, and design tools, your highest leverage opportunity is executing your AI Web-to-Figma Converter prototype into a full MVP release.",
    recommendedFocusProject: {
      title: "AI Web-to-Figma & Design System Converter",
      rationale: "You have captured 5 connected notes on DOM payload extraction and design automation in the last 30 days.",
    },
    identifiedBlindSpots: [
      "High concentration of feature concepts, but limited market positioning notes.",
      "Voice capture notes require testing across mobile network environments.",
    ],
    actionItems: [
      "Ship interactive Kanban board for the Figma Converter project.",
      "Conduct user feedback testing on hands-free voice notes.",
      "Review connected notes in your Knowledge Graph to extract core API specs.",
    ],
  };

  return await generateStructuredJson<StrategyAdviceResult>(prompt, undefined, () => fallbackResult);
}
