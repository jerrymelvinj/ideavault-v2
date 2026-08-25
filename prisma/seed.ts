import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding IdeaVault database...");

  // 1. Create Default User
  const user = await prisma.user.upsert({
    where: { email: "alex@ideavault.app" },
    update: {},
    create: {
      id: "default-user-id",
      name: "Alex Rivera",
      email: "alex@ideavault.app",
      preferences: JSON.stringify({ theme: "dark", aiProactive: true }),
    },
  });

  // 2. Categories
  const catDesign = await prisma.category.create({
    data: { userId: user.id, name: "Design & UX", description: "Design systems, UI tools, interaction concepts" },
  });
  const catAI = await prisma.category.create({
    data: { userId: user.id, name: "AI & Automation", description: "Generative AI models, agentic tools, workflow automation" },
  });
  const catProduct = await prisma.category.create({
    data: { userId: user.id, name: "Product Strategy", description: "Startup ideas, market positioning, business models" },
  });

  // 3. Projects
  const projFigma = await prisma.project.create({
    data: { userId: user.id, name: "AI Web-to-Figma Converter", description: "Automated reverse engineering of websites into Figma components", status: "Active" },
  });

  // 4. Sample Knowledge Items
  const item1 = await prisma.knowledgeItem.create({
    data: {
      userId: user.id,
      title: "AI Tool for Converting Websites into Editable Figma Designs",
      rawContent: "What if users could paste any live URL, and an AI agent inspects the DOM, extracts visual CSS tokens, reconstructs component layers, and automatically generates organized Figma frames with responsive auto-layout?",
      summary: "AI system that inspects web URLs and generates editable, structured Figma components automatically.",
      contentType: "Idea",
      status: "Active",
      source: "Direct",
      categoryId: catDesign.id,
      projectId: projFigma.id,
      structuredData: JSON.stringify({
        keyEntities: ["Figma", "CSS", "DOM", "Auto-layout"],
        suggestedNextAction: "Build DOM-to-Figma AST parser prototype.",
      }),
    },
  });

  const item2 = await prisma.knowledgeItem.create({
    data: {
      userId: user.id,
      title: "Automated UX Audit Assistant for Design Systems",
      rawContent: "Idea: An automated design system auditor that scans Figma files against WCAG 2.1 accessibility contrast guidelines and flags inconsistent typography scales before handover to developers.",
      summary: "Automated scanner for Figma files to check accessibility and design system typography token adherence.",
      contentType: "Idea",
      status: "Active",
      source: "Direct",
      categoryId: catDesign.id,
      structuredData: JSON.stringify({
        keyEntities: ["Figma", "WCAG", "Accessibility", "Design System"],
        suggestedNextAction: "Validate Figma REST API plugin permissions.",
      }),
    },
  });

  const item3 = await prisma.knowledgeItem.create({
    data: {
      userId: user.id,
      title: "Unfinished Concept: Voice-based Capture for Driving & Walking",
      rawContent: "Need a way to capture raw thoughts hands-free while driving or walking. Voice memo -> Whisper transcription -> AI auto-formatting into structured notes. Haven't worked on this in 90 days.",
      summary: "Hands-free voice recorder with AI transcription and auto-formatting into structured notes.",
      contentType: "Idea",
      status: "Unfinished",
      source: "Direct",
      categoryId: catAI.id,
    },
  });

  const item4 = await prisma.knowledgeItem.create({
    data: {
      userId: user.id,
      title: "Physical Notebook Scan: Reverse Engineering Web Layouts",
      rawContent: "Handwritten note from notebook (Feb 2026): 'Maybe build AI tool for converting websites to Figma. Start with DOM element bounding boxes -> SVG vector export -> Figma plugin API payload.'",
      summary: "Early handwritten concept on converting web bounding boxes into Figma API payloads.",
      contentType: "Note",
      status: "Active",
      source: "OCR",
      categoryId: catDesign.id,
      projectId: projFigma.id,
    },
  });

  const item5 = await prisma.knowledgeItem.create({
    data: {
      userId: user.id,
      title: "Research on Vector Hybrid Search and RAG Architectures",
      rawContent: "Combining keyword BM25 scoring with dense vector embedding cosine similarity yields superior retrieval accuracy for personal knowledge bases compared to pure semantic search. Re-ranking top candidates reduces LLM hallucination.",
      summary: "Technical notes on hybrid vector + keyword retrieval and reranking for personal knowledge bases.",
      contentType: "Research",
      status: "Active",
      source: "GoogleDocs",
      categoryId: catAI.id,
    },
  });

  // 5. Relationships
  await prisma.relationship.create({
    data: {
      sourceItemId: item1.id,
      targetItemId: item4.id,
      relationshipType: "EvolvesFrom",
      confidence: 0.88,
      reason: "Item 1 is a detailed evolution of the handwritten note in Item 4.",
    },
  });

  await prisma.relationship.create({
    data: {
      sourceItemId: item1.id,
      targetItemId: item2.id,
      relationshipType: "Similar",
      confidence: 0.65,
      reason: "Both ideas focus on AI automation within Figma and design workflows.",
    },
  });

  // 6. Proactive AI Insights
  await prisma.aIInsight.create({
    data: {
      userId: user.id,
      type: "Connection",
      content: "Possible connection: Your recent idea 'AI Tool for Converting Websites into Editable Figma Designs' evolves from your physical notebook scan from 6 months ago.",
      relatedItemIds: JSON.stringify([item1.id, item4.id]),
      confidence: 0.88,
    },
  });

  await prisma.aIInsight.create({
    data: {
      userId: user.id,
      type: "Unfinished",
      content: "Unfinished Idea: You have a voice-based capture concept that hasn't been revisited in over 90 days.",
      relatedItemIds: JSON.stringify([item3.id]),
      confidence: 0.9,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
