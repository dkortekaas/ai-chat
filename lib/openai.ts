import OpenAI from "openai";

// Initialize OpenAI client only if API key is available
export const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// Model Configuration
export const EMBEDDING_MODEL = "text-embedding-3-small"; // 1536 dimensions, newer model
export const EMBEDDING_MODEL_FALLBACK = "text-embedding-ada-002"; // Fallback model
export const CHAT_MODEL = "gpt-4o-mini"; // Cost-effective
export const CHAT_MODEL_ADVANCED = "gpt-4o"; // For complex queries

// Environment variable to disable embeddings completely
export const EMBEDDINGS_ENABLED = process.env.EMBEDDINGS_ENABLED !== "false";

// Pricing (per 1M tokens, approximate)
export const PRICING = {
  EMBEDDING: 0.02, // $0.02 per 1M tokens
  CHAT_INPUT: 0.15, // $0.15 per 1M tokens (gpt-4o-mini)
  CHAT_OUTPUT: 0.6, // $0.60 per 1M tokens (gpt-4o-mini)
};

/**
 * Generate embedding for a single text with fallback models
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!openai) {
    throw new Error("OpenAI API key not configured");
  }

  const modelsToTry = [EMBEDDING_MODEL, EMBEDDING_MODEL_FALLBACK];

  for (const model of modelsToTry) {
    try {
      console.log(`Trying embedding model: ${model}`);
      const response = await openai.embeddings.create({
        model: model,
        input: text,
      });

      console.log(`Successfully generated embedding using model: ${model}`);
      return response.data[0].embedding;
    } catch (error: unknown) {
      const errorObj = error as {
        message?: string;
        status?: number;
        code?: string;
      };
      console.warn(`Model ${model} failed:`, errorObj?.message || error);

      // If it's a model access error, try the next model
      if (errorObj?.status === 403 && errorObj?.code === "model_not_found") {
        continue;
      }

      // For other errors, throw immediately
      throw new Error(
        `Failed to generate embedding with model ${model}: ${errorObj?.message || "Unknown error"}`
      );
    }
  }

  // If all models failed, return empty embeddings to prevent complete failure
  console.error(
    `All embedding models failed. Tried: ${modelsToTry.join(", ")}. Please check your OpenAI project settings.`
  );
  console.warn(
    "Returning empty embeddings to prevent complete failure. Website scraping will continue without vector search."
  );

  // Return empty embeddings array with correct dimensions (1536 for text-embedding-3-small)
  return new Array(1536).fill(0);
}

/**
 * Generate embeddings for multiple texts (batch) with fallback models
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (!openai) {
    throw new Error("OpenAI API key not configured");
  }

  const modelsToTry = [EMBEDDING_MODEL, EMBEDDING_MODEL_FALLBACK];

  for (const model of modelsToTry) {
    try {
      console.log(`Trying embedding model: ${model}`);
      const response = await openai.embeddings.create({
        model: model,
        input: texts,
      });

      console.log(`Successfully generated embeddings using model: ${model}`);
      return response.data.map((item) => item.embedding);
    } catch (error: unknown) {
      const errorObj = error as {
        message?: string;
        status?: number;
        code?: string;
      };
      console.warn(`Model ${model} failed:`, errorObj?.message || error);

      // If it's a model access error, try the next model
      if (
        errorObj?.status === 403 &&
        (errorObj?.code === "model_not_found" ||
          errorObj?.message?.includes("does not have access"))
      ) {
        console.warn(`Model ${model} not accessible, trying next model...`);
        continue;
      }

      // For other errors, throw immediately
      throw new Error(
        `Failed to generate embeddings with model ${model}: ${errorObj?.message || "Unknown error"}`
      );
    }
  }

  // If all models failed, return empty embeddings to prevent complete failure
  console.error(
    `All embedding models failed. Tried: ${modelsToTry.join(", ")}. Please check your OpenAI project settings.`
  );
  console.warn(
    "Returning empty embeddings to prevent complete failure. Website scraping will continue without vector search."
  );

  // Return empty embeddings array with correct dimensions (1536 for text-embedding-3-small)
  return texts.map(() => new Array(1536).fill(0));
}

/**
 * Estimate token count (approximate)
 */
export function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters for English
  return Math.ceil(text.length / 4);
}

/**
 * Calculate cost for embedding generation
 */
export function calculateEmbeddingCost(tokenCount: number): number {
  // $0.02 per 1M tokens
  return (tokenCount / 1_000_000) * 0.02;
}
