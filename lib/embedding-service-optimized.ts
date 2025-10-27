/**
 * Optimized Embedding Service - NEW VERSION
 *
 * Cost Optimizations:
 * 1. Uses text-embedding-3-small (5x cheaper than ada-002)
 * 2. Content deduplication (reuse identical chunks)
 * 3. Query caching (reuse common searches)
 * 4. Batch processing (more efficient API usage)
 * 5. Smart fallbacks
 *
 * Cost comparison:
 * - ada-002: $0.0001 per 1K tokens
 * - text-embedding-3-small: $0.00002 per 1K tokens (5x cheaper!)
 */

import OpenAI from "openai";
import {
  generateEmbeddingWithCache,
  generateBatchEmbeddingsOptimized,
  getCacheStats,
  estimateCostSavings,
} from "./embedding-optimization";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use cheapest model first
const EMBEDDING_MODEL = "text-embedding-3-small"; // 5x cheaper!
const EMBEDDING_MODEL_FALLBACK = "text-embedding-ada-002";
const EMBEDDING_MODEL_FALLBACK2 = "text-embedding-3-large";

/**
 * Generate embedding with caching and optimization
 * Use this for search queries
 */
export async function generateEmbedding(
  text: string,
  type: 'query' | 'document' = 'document'
): Promise<number[]> {
  try {
    // Use optimized version with caching
    return await generateEmbeddingWithCache(text, type);
  } catch (error) {
    console.error('❌ Optimized embedding failed, trying fallback:', error);

    // Fallback to direct OpenAI call
    return await generateOpenAIEmbeddingDirect(text);
  }
}

/**
 * Generate batch embeddings with deduplication
 * Use this for document uploads
 */
export async function generateBatchEmbeddings(
  texts: string[],
  chunkIds?: string[]
): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  console.log(`\n🚀 Starting optimized batch embedding for ${texts.length} texts`);

  try {
    // Use optimized version with deduplication
    const embeddings = await generateBatchEmbeddingsOptimized(texts, chunkIds);

    // Calculate and log cost savings
    const stats = getCacheStats();
    console.log(`\n💰 Cache Stats:`);
    console.log(`   Query cache: ${stats.queryCache.size} entries`);
    console.log(`   Content cache: ${stats.contentHashCache.size} entries`);

    return embeddings;
  } catch (error) {
    console.error('❌ Optimized batch embedding failed, trying fallback:', error);

    // Fallback to direct OpenAI call
    return await generateBatchEmbeddingsDirectFallback(texts);
  }
}

/**
 * Direct OpenAI embedding call (fallback)
 */
async function generateOpenAIEmbeddingDirect(text: string): Promise<number[]> {
  const modelsToTry = [
    EMBEDDING_MODEL,
    EMBEDDING_MODEL_FALLBACK,
    EMBEDDING_MODEL_FALLBACK2,
  ];

  for (const model of modelsToTry) {
    try {
      console.log(`🔄 Trying embedding model: ${model}`);
      const response = await openai.embeddings.create({
        model: model,
        input: text.slice(0, 8000),
      });

      console.log(`✅ Successfully generated embedding using model: ${model}`);
      return response.data[0].embedding;
    } catch (error: any) {
      console.warn(`⚠️  Model ${model} failed:`, error?.message);

      if (modelsToTry.indexOf(model) < modelsToTry.length - 1) {
        console.log(`🔄 Trying next model...`);
        continue;
      }

      throw error;
    }
  }

  // Should never reach here
  return new Array(1536).fill(0);
}

/**
 * Direct batch OpenAI embedding call (fallback)
 */
async function generateBatchEmbeddingsDirectFallback(
  texts: string[]
): Promise<number[][]> {
  const modelsToTry = [
    EMBEDDING_MODEL,
    EMBEDDING_MODEL_FALLBACK,
    EMBEDDING_MODEL_FALLBACK2,
  ];

  for (const model of modelsToTry) {
    try {
      console.log(`🔄 Trying batch embedding model: ${model}`);
      const response = await openai.embeddings.create({
        model: model,
        input: texts.map((text) => text.slice(0, 8000)),
      });

      console.log(`✅ Successfully generated batch embeddings using model: ${model}`);
      return response.data.map((item) => item.embedding);
    } catch (error: any) {
      console.warn(`⚠️  Batch model ${model} failed:`, error?.message);

      if (modelsToTry.indexOf(model) < modelsToTry.length - 1) {
        console.log(`🔄 Trying next model...`);
        continue;
      }

      throw error;
    }
  }

  // Fallback: return empty embeddings
  return texts.map(() => new Array(1536).fill(0));
}

/**
 * Embed document chunks with optimization
 */
export async function embedDocumentChunks(documentId: string) {
  const { db } = await import("./db");

  // Find chunks without embeddings
  const chunks = await db.$queryRaw<
    Array<{
      id: string;
      content: string;
    }>
  >`
    SELECT id, content
    FROM document_chunks
    WHERE "documentId" = ${documentId}
    AND embedding IS NULL
  `;

  if (chunks.length === 0) {
    console.log('✅ All chunks already have embeddings');
    return { processed: 0, saved: 0 };
  }

  console.log(`\n📊 Embedding ${chunks.length} chunks for document ${documentId}`);

  // Process in batches of 100 (OpenAI limit)
  const batchSize = 100;
  let processed = 0;
  let totalSaved = 0;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const contents = batch.map((chunk) => chunk.content);
    const chunkIds = batch.map((chunk) => chunk.id);

    try {
      console.log(`\n🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}`);

      // Use optimized batch embedding with deduplication
      const embeddings = await generateBatchEmbeddings(contents, chunkIds);

      // Calculate savings for this batch
      const uniqueContents = new Set(contents).size;
      const saved = contents.length - uniqueContents;
      totalSaved += saved;

      // Update chunks with embeddings
      await Promise.all(
        batch.map((chunk, index) =>
          db.$executeRaw`
            UPDATE document_chunks
            SET embedding = ${`[${embeddings[index].join(",")}]`}::vector
            WHERE id = ${chunk.id}
          `
        )
      );

      processed += batch.length;
      console.log(`✅ Batch complete: ${batch.length} chunks embedded, ${saved} duplicates reused`);
    } catch (error) {
      console.error(`❌ Error processing batch ${i / batchSize}:`, error);
    }
  }

  // Log final stats
  const savings = estimateCostSavings(chunks.length, chunks.length - totalSaved, 0);
  console.log(`\n💰 Embedding Complete:`);
  console.log(`   Processed: ${processed} chunks`);
  console.log(`   API calls: ${savings.apiCalls}`);
  console.log(`   Saved: ${savings.saved} calls`);
  console.log(`   Estimated cost: $${savings.estimatedCost.toFixed(6)}`);
  console.log(`   Estimated savings: $${savings.estimatedSavings.toFixed(6)}`);

  return {
    processed,
    saved: totalSaved,
    cost: savings.estimatedCost,
    savings: savings.estimatedSavings,
  };
}

/**
 * Get cache statistics
 */
export function getEmbeddingCacheStats() {
  return getCacheStats();
}

/**
 * Export old functions for backwards compatibility
 */
export { generateOpenAIEmbedding } from "./embedding-service";
