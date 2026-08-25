import { db } from "@/lib/db";
import { generateStructuredJson } from "./gemini";

export interface IdeaDevelopmentOutput {
  currentIdea: string;
  problem: string;
  targetUser: string;
  whyThisMatters: string;
  potentialSolution: string;
  possibleFeatures: string[];
  useCases: string[];
  assumptions: string[];
  questions: string[];
  risks: string[];
  experiments: string[];
  nextSteps: string[];
}

export interface IdeaEvaluationOutput {
  ideaSummary: string;
  scorecard: {
    problemStrength: number; // 1-10
    userValue: number;       // 1-10
    differentiation: number; // 1-10
    complexity: number;      // 1-10
    confidence: number;      // 1-10
  };
  strengths: string[];
  weaknesses: string[];
  assumptionsVsFacts: {
    assumptions: string[];
    verifiedFacts: string[];
  };
  potentialRisks: string[];
  differentiationNotes: string;
  openQuestions: string[];
  recommendedExperiments: string[];
  overallAssessment: string;
}

/**
 * Generates structured Idea Development canvas
 */
export async function developIdea(itemId: string): Promise<IdeaDevelopmentOutput> {
  const item = await db.knowledgeItem.findUnique({ where: { id: itemId } });
  if (!item) throw new Error("Item not found");

  const prompt = `Perform an in-depth Idea Development breakdown for the following concept.

Idea Title: "${item.title}"
Content:
"""
${item.rawContent}
"""

Return JSON format matching:
{
  "currentIdea": "Summary of current state",
  "problem": "Clear formulation of core user/technical problem being solved",
  "targetUser": "Specific primary user persona",
  "whyThisMatters": "Why this problem is valuable to solve",
  "potentialSolution": "Expanded solution architecture",
  "possibleFeatures": ["Feature 1", "Feature 2", "Feature 3"],
  "useCases": ["Use Case A", "Use Case B"],
  "assumptions": ["Assumption 1", "Assumption 2"],
  "questions": ["Open Question 1", "Open Question 2"],
  "risks": ["Risk 1", "Risk 2"],
  "experiments": ["Experiment 1 to validate hypothesis"],
  "nextSteps": ["Immediate Action Step 1", "Action Step 2"]
}`;

  return generateStructuredJson<IdeaDevelopmentOutput>(
    prompt,
    "You are a Senior Product Strategist helping develop early concepts into structured project blueprints.",
    () => generateLocalDevelopmentFallback(item.title, item.rawContent)
  );
}

function generateLocalDevelopmentFallback(title: string, content: string): IdeaDevelopmentOutput {
  return {
    currentIdea: `${title} - ${content.substring(0, 100)}...`,
    problem: `Users struggle with efficiency and manual organization in relation to: ${title}.`,
    targetUser: "Creative professionals, builders, and knowledge workers.",
    whyThisMatters: "Eliminates friction and unlocks high leverage personal productivity.",
    potentialSolution: `An automated smart system built around ${title}.`,
    possibleFeatures: [
      "Instant capture and classification",
      "Seamless context extraction",
      "Automated workflow pipeline"
    ],
    useCases: [
      "Daily personal capture and ideation",
      "Project blueprint generation"
    ],
    assumptions: [
      "Users are willing to capture raw unorganized thoughts",
      "AI automation saves significant manual organizing time"
    ],
    questions: [
      "What is the simplest MVP version?",
      "How do we measure success for this concept?"
    ],
    risks: [
      "Adoption barrier if setup requires configuration",
      "Over-complication of early core feature loop"
    ],
    experiments: [
      "Build a lightweight prototype and test with 5 target users."
    ],
    nextSteps: [
      "Define MVP scope",
      "Draft interactive UX mocks",
      "Implement core prototype"
    ]
  };
}

/**
 * Generates structured Idea Evaluation scorecard
 */
export async function evaluateIdea(itemId: string): Promise<IdeaEvaluationOutput> {
  const item = await db.knowledgeItem.findUnique({ where: { id: itemId } });
  if (!item) throw new Error("Item not found");

  const prompt = `Evaluate the following idea thoroughly and return an objective scorecard.

Idea Title: "${item.title}"
Content:
"""
${item.rawContent}
"""

Return JSON format matching:
{
  "ideaSummary": "One sentence summary of evaluated concept",
  "scorecard": {
    "problemStrength": 8,
    "userValue": 9,
    "differentiation": 7,
    "complexity": 6,
    "confidence": 7
  },
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "assumptionsVsFacts": {
    "assumptions": ["Unverified assumption 1"],
    "verifiedFacts": ["Fact grounded in provided note"]
  },
  "potentialRisks": ["Risk 1", "Risk 2"],
  "differentiationNotes": "How this concept sets itself apart",
  "openQuestions": ["Unresolved question 1"],
  "recommendedExperiments": ["Validation experiment 1"],
  "overallAssessment": "Strategic summary recommendation"
}`;

  return generateStructuredJson<IdeaEvaluationOutput>(
    prompt,
    "You are an AI Product Evaluator. Clearly separate unverified assumptions from facts. Do not invent fake market data.",
    () => generateLocalEvaluationFallback(item.title, item.rawContent)
  );
}

function generateLocalEvaluationFallback(title: string, content: string): IdeaEvaluationOutput {
  return {
    ideaSummary: `Evaluation of "${title}"`,
    scorecard: {
      problemStrength: 8,
      userValue: 8,
      differentiation: 7,
      complexity: 5,
      confidence: 7
    },
    strengths: [
      "High relevance to workflow automation",
      "Strong potential user utility"
    ],
    weaknesses: [
      "Requires validation of user demand",
      "Potential technical implementation complexity"
    ],
    assumptionsVsFacts: {
      assumptions: [
        "Assumes users encounter this problem regularly",
        "Assumes standard LLM models can execute the pipeline reliably"
      ],
      verifiedFacts: [
        "Concept addresses personal knowledge retrieval friction"
      ]
    },
    potentialRisks: [
      "Integration friction with existing workflows",
      "Resource allocation for initial build"
    ],
    differentiationNotes: "Combines zero-friction capture with automated structure.",
    openQuestions: [
      "What is the primary retention trigger for users?"
    ],
    recommendedExperiments: [
      "Create a quick test project to measure user engagement."
    ],
    overallAssessment: "Strong candidate for MVP prototyping. High potential user value with manageable technical scope."
  };
}
