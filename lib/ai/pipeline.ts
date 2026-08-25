import { db } from "@/lib/db";
import { generateStructuredJson, generateVectorEmbedding } from "./gemini";

export interface AIAnalysisResult {
  title: string;
  summary: string;
  contentType: "Idea" | "Note" | "Project" | "Research" | "Draft" | "Reference" | "Observation" | "Question";
  category: string;
  tags: string[];
  suggestedStatus: "Active" | "InProgress" | "Unfinished";
  keyEntities: string[];
  suggestedNextAction: string;
}

/**
 * Analyzes raw content using Gemini or local heuristic engine
 */
export async function analyzeContent(rawContent: string): Promise<AIAnalysisResult> {
  const prompt = `Analyze the following user-captured content and produce structured metadata.

User Content:
"""
${rawContent}
"""

Return JSON format with exact keys:
{
  "title": "Concise representative title (max 7 words)",
  "summary": "Short 1-2 sentence summary of core thought",
  "contentType": "Idea" | "Note" | "Project" | "Research" | "Draft" | "Reference" | "Observation" | "Question",
  "category": "Broad domain category (e.g. Design, Product, Technology, Business, Personal, AI, Research)",
  "tags": ["tag1", "tag2", "tag3"],
  "suggestedStatus": "Active" | "InProgress" | "Unfinished",
  "keyEntities": ["entity1", "entity2"],
  "suggestedNextAction": "A practical action step to advance this thought"
}`;

  return generateStructuredJson<AIAnalysisResult>(
    prompt,
    "You are an AI Knowledge Organizer. Analyze content accurately without hallucinating details.",
    () => generateLocalHeuristicAnalysis(rawContent)
  );
}

function generateLocalHeuristicAnalysis(text: string): AIAnalysisResult {
  const firstLine = text.trim().split("\n")[0] || "Untitled Thought";
  const title = firstLine.length > 50 ? firstLine.substring(0, 47) + "..." : firstLine;
  const cleanTitle = title.replace(/^#+\s*/, "");

  let contentType: AIAnalysisResult["contentType"] = "Idea";
  const lower = text.toLowerCase();

  if (lower.includes("research") || lower.includes("study") || lower.includes("paper")) {
    contentType = "Research";
  } else if (lower.includes("todo") || lower.includes("project") || lower.includes("build")) {
    contentType = "Project";
  } else if (lower.includes("?") || lower.includes("how to") || lower.includes("why")) {
    contentType = "Question";
  } else if (lower.includes("note") || lower.includes("meeting")) {
    contentType = "Note";
  }

  let category = "General";
  if (lower.includes("design") || lower.includes("ui") || lower.includes("ux") || lower.includes("figma")) {
    category = "Design";
  } else if (lower.includes("ai") || lower.includes("llm") || lower.includes("gpt") || lower.includes("model")) {
    category = "AI & Technology";
  } else if (lower.includes("business") || lower.includes("market") || lower.includes("startup")) {
    category = "Business";
  } else if (lower.includes("code") || lower.includes("api") || lower.includes("dev")) {
    category = "Engineering";
  }

  // Extract tags from words
  const words = text.match(/\b[A-Za-z0-9]{4,}\b/g) || [];
  const uniqueWords = Array.from(new Set(words.map((w) => w.toLowerCase())));
  const tags = uniqueWords.slice(0, 4);

  return {
    title: cleanTitle || "Captured Thought",
    summary: text.length > 140 ? text.substring(0, 137) + "..." : text,
    contentType,
    category,
    tags: tags.length > 0 ? tags : ["general"],
    suggestedStatus: lower.includes("todo") ? "InProgress" : "Active",
    keyEntities: uniqueWords.slice(0, 3),
    suggestedNextAction: "Refine and explore connections with existing notes.",
  };
}

/**
 * Full Pipeline: Ingest item, generate metadata, compute vector embedding, create relationships & insights
 */
export async function processKnowledgeItemPipeline(itemId: string): Promise<void> {
  const item = await db.knowledgeItem.findUnique({
    where: { id: itemId },
    include: { user: true },
  });

  if (!item) return;

  // 1. Analyze content
  const analysis = await analyzeContent(item.rawContent);

  // 2. Find or create Category
  let categoryId: string | undefined = undefined;
  if (analysis.category) {
    const existingCat = await db.category.findFirst({
      where: { userId: item.userId, name: analysis.category },
    });
    if (existingCat) {
      categoryId = existingCat.id;
    } else {
      const newCat = await db.category.create({
        data: {
          userId: item.userId,
          name: analysis.category,
          description: `Auto-generated category for ${analysis.category}`,
        },
      });
      categoryId = newCat.id;
    }
  }

  // 3. Generate Vector Embedding
  const embedding = await generateVectorEmbedding(item.rawContent);
  const embeddingStr = JSON.stringify(embedding);

  // 4. Update KnowledgeItem
  await db.knowledgeItem.update({
    where: { id: itemId },
    data: {
      title: item.title === "Untitled Idea" || !item.title ? analysis.title : item.title,
      summary: analysis.summary,
      contentType: analysis.contentType,
      categoryId,
      embedding: embeddingStr,
      structuredData: JSON.stringify({
        keyEntities: analysis.keyEntities,
        suggestedNextAction: analysis.suggestedNextAction,
      }),
    },
  });

  // 5. Connect Tags
  for (const tagName of analysis.tags) {
    const cleanName = tagName.toLowerCase().trim();
    if (!cleanName) continue;

    let tag = await db.tag.findUnique({ where: { name: cleanName } });
    if (!tag) {
      tag = await db.tag.create({
        data: {
          userId: item.userId,
          name: cleanName,
        },
      });
    }

    await db.knowledgeItemTag.upsert({
      where: {
        itemId_tagId: {
          itemId,
          tagId: tag.id,
        },
      },
      create: { itemId, tagId: tag.id },
      update: {},
    });
  }

  // 6. Relationship Detection
  await detectRelationshipsForItem(itemId, embedding);
}

/**
 * Compare target item embedding against other items to build semantic relationships
 */
async function detectRelationshipsForItem(itemId: string, targetEmbedding: number[]): Promise<void> {
  const currentItem = await db.knowledgeItem.findUnique({ where: { id: itemId } });
  if (!currentItem) return;

  const otherItems = await db.knowledgeItem.findMany({
    where: {
      userId: currentItem.userId,
      id: { not: itemId },
      embedding: { not: null },
    },
  });

  for (const other of otherItems) {
    if (!other.embedding) continue;
    try {
      const otherVector = JSON.parse(other.embedding) as number[];
      const similarity = calculateCosineSimilarity(targetEmbedding, otherVector);

      if (similarity > 0.45) {
        let relType = "Similar";
        if (similarity > 0.75) relType = "EvolvesFrom";
        else if (other.contentType === "Project") relType = "PartOf";

        await db.relationship.create({
          data: {
            sourceItemId: itemId,
            targetItemId: other.id,
            relationshipType: relType,
            confidence: Math.round(similarity * 100) / 100,
            reason: `Semantic similarity score of ${Math.round(similarity * 100)}% between "${currentItem.title}" and "${other.title}"`,
          },
        });

        // Trigger Proactive Insight if high similarity found
        if (similarity > 0.65) {
          await db.aIInsight.create({
            data: {
              userId: currentItem.userId,
              type: "Connection",
              content: `Possible connection: "${currentItem.title}" appears strongly related to your earlier note "${other.title}".`,
              relatedItemIds: JSON.stringify([itemId, other.id]),
              confidence: similarity,
            },
          });
        }
      }
    } catch (e) {
      // Ignore invalid JSON embedding parse error
    }
  }
}

export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const minLen = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < minLen; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
