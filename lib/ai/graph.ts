import { db, getOrCreateDefaultUser } from "@/lib/db";

export interface GraphNode {
  id: string;
  label: string;
  type: "Idea" | "Note" | "Project" | "Research" | "Category";
  category: string;
  val: number; // node size weight
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string; // EvolvesFrom, Similar, PartOf, Contradicts
  confidence: number;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Builds full Knowledge Graph nodes and edges for visual rendering
 */
export async function getKnowledgeGraphData(userId?: string): Promise<KnowledgeGraphData> {
  const user = await getOrCreateDefaultUser();
  const targetUserId = userId || user.id;

  const items = await db.knowledgeItem.findMany({
    where: { userId: targetUserId },
    include: {
      category: true,
      sourceItemRel: { include: { targetItem: true } },
    },
  });

  const categories = await db.category.findMany({
    where: { userId: targetUserId },
  });

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Add Category Nodes
  categories.forEach((cat, idx) => {
    nodes.push({
      id: `cat-${cat.id}`,
      label: cat.name,
      type: "Category",
      category: cat.name,
      val: 20,
      x: Math.cos((idx / categories.length) * 2 * Math.PI) * 250,
      y: Math.sin((idx / categories.length) * 2 * Math.PI) * 250,
    });
  });

  // Add KnowledgeItem Nodes
  items.forEach((item, idx) => {
    const categoryName = item.category?.name || "General";
    nodes.push({
      id: item.id,
      label: item.title,
      type: (item.contentType as any) || "Idea",
      category: categoryName,
      val: item.contentType === "Project" ? 16 : 12,
      x: (Math.random() - 0.5) * 500,
      y: (Math.random() - 0.5) * 500,
    });

    // Link item to its Category Node
    if (item.categoryId) {
      edges.push({
        id: `e-cat-${item.id}`,
        source: item.id,
        target: `cat-${item.categoryId}`,
        label: "BelongsTo",
        confidence: 1.0,
      });
    }

    // Link Item Relationships
    item.sourceItemRel.forEach((rel) => {
      edges.push({
        id: rel.id,
        source: rel.sourceItemId,
        target: rel.targetItemId,
        label: rel.relationshipType,
        confidence: rel.confidence,
      });
    });
  });

  return { nodes, edges };
}
