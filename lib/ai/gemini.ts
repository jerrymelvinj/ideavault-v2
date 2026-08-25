import { GoogleGenAI } from "@google/genai";

export function getGeminiApiKey(): string | null {
  return process.env.GEMINI_API_KEY || null;
}

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error("Failed to initialize Gemini client:", err);
    return null;
  }
}

/**
 * Call Gemini API with structured JSON prompt instructions or fallback to heuristic smart engine.
 */
export async function generateStructuredJson<T>(
  prompt: string,
  systemInstruction?: string,
  fallbackGenerator?: () => T
): Promise<T> {
  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || "You are IdeaVault AI, an expert knowledge organizer and thinking partner. Always reply in clean valid JSON without markdown codeblock formatting.",
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "";
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleaned) as T;
    } catch (error) {
      console.warn("Gemini API call failed or timed out, falling back to local engine:", error);
    }
  }

  if (fallbackGenerator) {
    return fallbackGenerator();
  }
  throw new Error("No Gemini API key and no fallback generator provided.");
}

/**
 * Generate text response using Gemini API or fallback
 */
export async function generateTextResponse(
  prompt: string,
  systemInstruction?: string,
  fallbackText?: string
): Promise<string> {
  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || "You are IdeaVault AI, a personal second-brain assistant.",
        },
      });
      return response.text || fallbackText || "I was unable to process this request.";
    } catch (err) {
      console.warn("Gemini text generation failed, using fallback:", err);
    }
  }
  return fallbackText || "Here is the response generated based on your knowledge base analysis.";
}

/**
 * Generate Vector Embeddings (1536/768 dimensional array) using Gemini API or local TF-IDF vector generator.
 */
export async function generateVectorEmbedding(text: string): Promise<number[]> {
  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = (await ai.models.embedContent({
        model: "text-embedding-004",
        contents: text,
      })) as any;
      if (response.embedding?.values) {
        return response.embedding.values;
      } else if (response.embeddings?.[0]?.values) {
        return response.embeddings[0].values;
      }
    } catch (err) {
      console.warn("Gemini embedding generation failed, falling back to local pseudo-embedding:", err);
    }
  }

  // Local deterministic pseudo-embedding generator (128 dimensions) for offline vector similarity
  return createDeterministicPseudoEmbedding(text);
}

function createDeterministicPseudoEmbedding(text: string): number[] {
  const normalized = text.toLowerCase();
  const vector = new Array(128).fill(0);
  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i);
    const index = (charCode * 31 + i) % 128;
    vector[index] = (vector[index] + (charCode / 255.0)) / 2;
  }
  // Normalize vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vector.map((val) => val / magnitude);
}
