// embedding-service.ts
// Voorbeeld implementatie van de embedding service met OpenAI

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Model Configuration with fallbacks
const EMBEDDING_MODEL = "text-embedding-ada-002"; // Most compatible
const EMBEDDING_MODEL_FALLBACK = "text-embedding-3-small"; // Fallback if ada-002 doesn't work
const EMBEDDING_MODEL_FALLBACK2 = "text-embedding-3-large"; // Second fallback

/**
 * Genereert een embedding vector met OpenAI's text-embedding model
 * Probeert automatisch meerdere modellen als fallback
 */
export async function generateOpenAIEmbedding(text: string): Promise<number[]> {
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
        input: text.slice(0, 8000), // Limiteer input lengte
      });

      console.log(`✅ Successfully generated embedding using model: ${model}`);
      return response.data[0].embedding;
    } catch (error: unknown) {
      const errorObj = error as {
        message?: string;
        status?: number;
        code?: string;
      };
      console.warn(`⚠️ Model ${model} failed:`, errorObj?.message || error);

      // If it's a model access error (403), try the next model
      if (errorObj?.status === 403 && errorObj?.code === "model_not_found") {
        console.log(`🔄 Trying next model...`);
        continue;
      }

      // For other errors, still try next model
      if (modelsToTry.indexOf(model) < modelsToTry.length - 1) {
        console.log(`🔄 Trying next model...`);
        continue;
      }

      // Last model also failed, throw error
      throw new Error(
        `Failed to generate embedding: ${errorObj?.message || "Unknown error"}`
      );
    }
  }

  // If all models failed, return empty embeddings to prevent complete failure
  console.error(
    `❌ All embedding models failed. Tried: ${modelsToTry.join(", ")}`
  );
  console.error(
    "⚠️ Your OpenAI API key doesn't have access to any embedding models. Please check your OpenAI account settings."
  );
  console.warn(
    "⚠️ Returning empty embeddings. Search will work but without semantic matching."
  );

  // Return empty embeddings array with correct dimensions (1536)
  return new Array(1536).fill(0);
}

/**
 * Alternatief: batch embeddings genereren voor betere performance
 */
export async function generateBatchEmbeddings(
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

      console.log(
        `✅ Successfully generated batch embeddings using model: ${model}`
      );
      return response.data.map((item) => item.embedding);
    } catch (error: unknown) {
      const errorObj = error as {
        message?: string;
        status?: number;
        code?: string;
      };
      console.warn(
        `⚠️ Batch model ${model} failed:`,
        errorObj?.message || error
      );

      // If it's a model access error (403), try the next model
      if (errorObj?.status === 403 && errorObj?.code === "model_not_found") {
        console.log(`🔄 Trying next model...`);
        continue;
      }

      // For other errors, still try next model
      if (modelsToTry.indexOf(model) < modelsToTry.length - 1) {
        console.log(`🔄 Trying next model...`);
        continue;
      }

      // Last model also failed, throw error
      throw new Error(
        `Failed to generate batch embeddings: ${errorObj?.message || "Unknown error"}`
      );
    }
  }

  // If all models failed, return empty embeddings
  console.error(
    `❌ All batch embedding models failed. Tried: ${modelsToTry.join(", ")}`
  );
  console.warn(
    "⚠️ Returning empty embeddings. Search will work but without semantic matching."
  );

  // Return empty embeddings arrays with correct dimensions (1536)
  return texts.map(() => new Array(1536).fill(0));
}

/**
 * Helper functie om document chunks te embedden
 */
export async function embedDocumentChunks(documentId: string) {
  const { prisma } = await import("./search");

  const chunks = await prisma.$queryRaw<
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
    return { processed: 0 };
  }

  // Process in batches van 100 (OpenAI limiet)
  const batchSize = 100;
  let processed = 0;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const contents = batch.map((chunk) => chunk.content);

    try {
      const embeddings = await generateBatchEmbeddings(contents);

      // Update chunks met embeddings
      await Promise.all(
        batch.map(
          (chunk, index) =>
            prisma.$executeRaw`
            UPDATE document_chunks 
            SET embedding = ${`[${embeddings[index].join(",")}]`}::vector
            WHERE id = ${chunk.id}
          `
        )
      );

      processed += batch.length;
    } catch (error) {
      console.error(`Error processing batch ${i / batchSize}:`, error);
    }
  }

  return { processed };
}
