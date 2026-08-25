import { db } from "@/lib/db";
import { calculateCosineSimilarity } from "./pipeline";
import { generateVectorEmbedding, generateTextResponse } from "./gemini";

export interface SearchResultItem {
  id: string;
  title: string;
  summary: string | null;
  rawContent: string;
  contentType: string;
  status: string;
  createdAt: Date;
  categoryName: string | null;
  tags: string[];
  score: number;
  matchType: "Keyword" | "Semantic" | "Hybrid";
  relevanceReason: string;
}

export interface HybridSearchFilter {
  category?: string;
  contentType?: string;
  status?: string;
  userId: string;
}

/**
 * Hybrid Search Engine: Combines Keyword matching & Vector Semantic Similarity
 */
export async function performHybridSearch(
  query: string,
  filter: HybridSearchFilter
): Promise<SearchResultItem[]> {
  const items = await db.knowledgeItem.findMany({
    where: {
      userId: filter.userId,
      ...(filter.contentType ? { contentType: filter.contentType } : {}),
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.category
        ? {
            category: {
              name: { contains: filter.category },
            },
          }
        : {}),
    },
    include: {
      category: true,
      tags: {
        include: { tag: true },
      },
    },
  });

  if (items.length === 0) return [];

  const queryVector = await generateVectorEmbedding(query);
  const normalizedQuery = query.toLowerCase().trim();
  const queryTokens = normalizedQuery.split(/\s+/).filter((t) => t.length > 2);

  const scoredResults: SearchResultItem[] = [];

  for (const item of items) {
    let keywordScore = 0;
    const itemTitle = item.title.toLowerCase();
    const itemContent = item.rawContent.toLowerCase();
    const itemSummary = (item.summary || "").toLowerCase();
    const itemCategory = (item.category?.name || "").toLowerCase();
    const itemTags = item.tags.map((t) => t.tag.name.toLowerCase());

    // 1. Title match
    if (itemTitle.includes(normalizedQuery)) keywordScore += 0.9;
    // 2. Keyword tokens match
    for (const token of queryTokens) {
      if (itemTitle.includes(token)) keywordScore += 0.3;
      if (itemContent.includes(token)) keywordScore += 0.2;
      if (itemSummary.includes(token)) keywordScore += 0.2;
      if (itemCategory.includes(token)) keywordScore += 0.2;
      if (itemTags.some((t) => t.includes(token))) keywordScore += 0.25;
    }

    // 3. Vector Semantic Similarity
    let semanticScore = 0;
    if (item.embedding) {
      try {
        const itemVector = JSON.parse(item.embedding) as number[];
        semanticScore = calculateCosineSimilarity(queryVector, itemVector);
      } catch (e) {
        semanticScore = 0;
      }
    }

    // Combined score calculation
    const hybridScore = Math.max(keywordScore, semanticScore * 0.85, (keywordScore + semanticScore) / 2);

    if (hybridScore > 0.15) {
      let matchType: "Keyword" | "Semantic" | "Hybrid" = "Hybrid";
      if (keywordScore > semanticScore + 0.3) matchType = "Keyword";
      else if (semanticScore > keywordScore + 0.3) matchType = "Semantic";

      let relevanceReason = `Matches terms in query with high semantic context.`;
      if (matchType === "Keyword") relevanceReason = `Contains exact keyword matches in title or content.`;
      else if (matchType === "Semantic") relevanceReason = `Conceptually related thought (Similarity score: ${Math.round(semanticScore * 100)}%).`;

      scoredResults.push({
        id: item.id,
        title: item.title,
        summary: item.summary,
        rawContent: item.rawContent,
        contentType: item.contentType,
        status: item.status,
        createdAt: item.createdAt,
        categoryName: item.category?.name || null,
        tags: item.tags.map((t) => t.tag.name),
        score: Math.round(hybridScore * 100) / 100,
        matchType,
        relevanceReason,
      });
    }
  }

  // Sort descending by score
  return scoredResults.sort((a, b) => b.score - a.score);
}

/**
 * AI RAG Assistant: Answers user question using retrieved Knowledge Base items with explicit source citations
 */
export async function answerQuestionWithKnowledgeBase(
  question: string,
  userId: string
): Promise<{ answer: string; citations: { id: string; title: string; contentType: string }[] }> {
  // Retrieve top relevant items
  const results = await performHybridSearch(question, { userId });
  const topResults = results.slice(0, 5);

  if (topResults.length === 0) {
    return {
      answer: "I couldn't find evidence of that in your knowledge base. Try capturing some notes or expanding your query!",
      citations: [],
    };
  }

  const contextBlock = topResults
    .map(
      (item, idx) => `[Source ${idx + 1} - ID: ${item.id} - Title: ${item.title}]
Type: ${item.contentType} | Category: ${item.categoryName || "Uncategorized"}
Content: ${item.rawContent}
---`
    )
    .join("\n\n");

  const prompt = `You are IdeaVault AI Knowledge Assistant. Answer the user's question based ONLY on their captured knowledge base context provided below.

User Question: "${question}"

User Knowledge Context:
${contextBlock}

Instructions:
1. Provide a direct, intelligent, synthesised answer.
2. Refer explicitly to relevant items using numbers like [Source 1], [Source 2] or by title when citing facts.
3. Be clear if information is partial.
4. Format output nicely with markdown.`;

  const fallbackText = `Based on your library, I found ${topResults.length} relevant items. Your notes on "${topResults[0].title}" describe ${topResults[0].summary || "this concept"}.`;

  const answer = await generateTextResponse(
    prompt,
    "You are a personal second-brain AI assistant. Rely strictly on the provided context.",
    fallbackText
  );

  const citations = topResults.map((r) => ({
    id: r.id,
    title: r.title,
    contentType: r.contentType,
  }));

  return { answer, citations };
}
