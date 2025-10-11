import { db } from "@/lib/db";
import { generateEmbedding } from "@/lib/openai";

export interface SearchResult {
  chunkId: string;
  documentId: string;
  documentName: string;
  documentType: string;
  content: string;
  similarity: number;
  metadata?: Record<string, unknown>;
  url?: string;
}

/**
 * Semantic search using vector similarity
 */
export async function semanticSearch(
  query: string,
  options: {
    limit?: number;
    similarityThreshold?: number;
    documentTypes?: string[];
  } = {}
): Promise<SearchResult[]> {
  const {
    limit = 5,
    similarityThreshold = 0.7,
    documentTypes = ["URL", "PDF", "DOCX", "TXT"],
  } = options;

  // 1. Generate query embedding
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured for vector search");
  }

  const queryEmbedding = await generateEmbedding(query);

  // 2. Perform vector similarity search
  // Using cosine similarity: 1 - (embedding <=> query)
  const results = await db.$queryRaw<SearchResult[]>`
    SELECT
      dc.id as "chunkId",
      dc."documentId",
      d.name as "documentName",
      d.type as "documentType",
      dc.content,
      1 - (dc.embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity,
      d.metadata,
      d.url
    FROM document_chunks dc
    JOIN documents d ON d.id = dc."documentId"
    WHERE
      d.status = 'COMPLETED'
      AND d.type = ANY(${documentTypes})
      AND 1 - (dc.embedding <=> ${JSON.stringify(queryEmbedding)}::vector) > ${similarityThreshold}
    ORDER BY dc.embedding <=> ${JSON.stringify(queryEmbedding)}::vector
    LIMIT ${limit}
  `;

  return results;
}

/**
 * Search specifically in website content
 */
export async function searchWebsiteContent(
  query: string,
  websiteId?: string,
  options: {
    limit?: number;
    similarityThreshold?: number;
  } = {}
): Promise<SearchResult[]> {
  const { limit = 5, similarityThreshold = 0.7 } = options;

  // Generate query embedding
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured for vector search");
  }

  const queryEmbedding = await generateEmbedding(query);

  // Build the query with optional website filter
  let whereClause = `
    d.status = 'COMPLETED'
    AND d.type = 'URL'
    AND 1 - (dc.embedding <=> ${JSON.stringify(queryEmbedding)}::vector) > ${similarityThreshold}
  `;

  if (websiteId) {
    whereClause += ` AND d.metadata->>'websiteId' = '${websiteId}'`;
  }

  const results = await db.$queryRaw<SearchResult[]>`
    SELECT
      dc.id as "chunkId",
      dc."documentId",
      d.name as "documentName",
      d.type as "documentType",
      dc.content,
      1 - (dc.embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity,
      d.metadata,
      d.url
    FROM document_chunks dc
    JOIN documents d ON d.id = dc."documentId"
    WHERE ${whereClause}
    ORDER BY dc.embedding <=> ${JSON.stringify(queryEmbedding)}::vector
    LIMIT ${limit}
  `;

  return results;
}

/**
 * Hybrid search: semantic + keyword (full-text search)
 */
export async function hybridSearch(
  query: string,
  options: {
    limit?: number;
    semanticWeight?: number; // 0-1
    documentTypes?: string[];
  } = {}
): Promise<SearchResult[]> {
  const {
    limit = 5,
    semanticWeight = 0.7,
    documentTypes = ["URL", "PDF", "DOCX", "TXT"],
  } = options;

  const keywordWeight = 1 - semanticWeight;

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured for vector search");
  }

  const queryEmbedding = await generateEmbedding(query);

  // Combine semantic similarity with keyword matching
  const results = await db.$queryRaw<SearchResult[]>`
    WITH semantic_results AS (
      SELECT
        dc.id,
        dc."documentId",
        dc.content,
        1 - (dc.embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as semantic_score
      FROM document_chunks dc
      JOIN documents d ON d.id = dc."documentId"
      WHERE d.status = 'COMPLETED' AND d.type = ANY(${documentTypes})
    ),
    keyword_results AS (
      SELECT
        dc.id,
        ts_rank(
          to_tsvector('dutch', dc.content),
          plainto_tsquery('dutch', ${query})
        ) as keyword_score
      FROM document_chunks dc
      JOIN documents d ON d.id = dc."documentId"
      WHERE d.status = 'COMPLETED' AND d.type = ANY(${documentTypes})
    )
    SELECT
      sr.id as "chunkId",
      sr."documentId",
      d.name as "documentName",
      d.type as "documentType",
      sr.content,
      (
        sr.semantic_score * ${semanticWeight} +
        COALESCE(kr.keyword_score, 0) * ${keywordWeight}
      ) as similarity,
      d.metadata,
      d.url
    FROM semantic_results sr
    LEFT JOIN keyword_results kr ON kr.id = sr.id
    JOIN documents d ON d.id = sr."documentId"
    WHERE (
      sr.semantic_score * ${semanticWeight} +
      COALESCE(kr.keyword_score, 0) * ${keywordWeight}
    ) > 0.5
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;

  return results;
}

/**
 * Get related content based on a document chunk
 */
export async function getRelatedContent(
  chunkId: string,
  options: {
    limit?: number;
    similarityThreshold?: number;
  } = {}
): Promise<SearchResult[]> {
  const { limit = 3, similarityThreshold = 0.8 } = options;

  // Get the embedding of the source chunk
  const sourceChunk = await db.documentChunk.findUnique({
    where: { id: chunkId },
  });

  if (!sourceChunk || !(sourceChunk as { embedding?: unknown }).embedding) {
    return [];
  }

  // Find similar chunks
  const results = await db.$queryRaw<SearchResult[]>`
    SELECT
      dc.id as "chunkId",
      dc."documentId",
      d.name as "documentName",
      d.type as "documentType",
      dc.content,
      1 - (dc.embedding <=> ${JSON.stringify((sourceChunk as unknown as { embedding: unknown }).embedding)}::vector) as similarity,
      d.metadata,
      d.url
    FROM document_chunks dc
    JOIN documents d ON d.id = dc."documentId"
    WHERE
      d.status = 'COMPLETED'
      AND dc.id != ${chunkId}
      AND 1 - (dc.embedding <=> ${JSON.stringify((sourceChunk as unknown as { embedding: unknown }).embedding)}::vector) > ${similarityThreshold}
    ORDER BY dc.embedding <=> ${JSON.stringify((sourceChunk as unknown as { embedding: unknown }).embedding)}::vector
    LIMIT ${limit}
  `;

  return results;
}
