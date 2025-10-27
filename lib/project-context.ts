/**
 * Project Context Caching Service
 *
 * This service manages conversation-level context caching for projects.
 * Instead of searching the entire knowledge base on every message, we:
 * 1. Load project documents once at session start
 * 2. Cache the relevant context for the duration of the conversation
 * 3. Refresh cache when needed (new documents, topic shift, etc.)
 */

import { db } from "@/lib/db";
import { searchDocumentChunks } from "@/lib/search";
import { generateOpenAIEmbedding } from "@/lib/embedding-service";

export interface ProjectContextCache {
  projectId: string;
  sessionId: string;
  documents: any[];
  relevantChunks: any[];
  createdAt: Date;
  lastUsed: Date;
  messageCount: number;
  avgConfidence: number;
}

// In-memory cache with TTL
// In production, consider using Redis for distributed caching
const contextCache = new Map<string, ProjectContextCache>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_MESSAGES_BEFORE_REFRESH = 20; // Refresh after 20 messages
const LOW_CONFIDENCE_THRESHOLD = 0.4; // Refresh if avg confidence drops below 40%

/**
 * Get cached context key
 */
function getCacheKey(sessionId: string): string {
  return `session:${sessionId}`;
}

/**
 * Check if cache is still valid
 */
function isCacheValid(cache: ProjectContextCache): boolean {
  const now = new Date();
  const ageMs = now.getTime() - cache.createdAt.getTime();

  // Cache expired by time
  if (ageMs > CACHE_TTL_MS) {
    console.log("🔄 Cache expired by time");
    return false;
  }

  // Too many messages, might have shifted context
  if (cache.messageCount >= MAX_MESSAGES_BEFORE_REFRESH) {
    console.log("🔄 Cache expired by message count");
    return false;
  }

  // Low confidence indicates cache might not be relevant
  if (
    cache.avgConfidence < LOW_CONFIDENCE_THRESHOLD &&
    cache.messageCount > 5
  ) {
    console.log("🔄 Cache expired by low confidence");
    return false;
  }

  return true;
}

/**
 * Load project context and cache it
 */
export async function loadProjectContext(
  projectId: string,
  sessionId: string,
  initialQuery?: string
): Promise<any[]> {
  console.log("📦 Loading project context:", { projectId, sessionId });

  try {
    // Get project with all documents
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        documents: {
          include: {
            document: {
              include: {
                chunks: {
                  select: {
                    id: true,
                    content: true,
                    chunkIndex: true,
                  },
                  take: 100, // Limit to prevent memory issues
                },
              },
            },
          },
        },
      },
    });

    if (!project) {
      console.error("❌ Project not found:", projectId);
      return [];
    }

    console.log(
      "✅ Project loaded with",
      project.documents.length,
      "documents"
    );

    // Flatten all chunks
    const allChunks = project.documents.flatMap((pd) =>
      pd.document.chunks.map((chunk) => ({
        ...chunk,
        documentId: pd.document.id,
        documentName: pd.document.name,
        documentType: pd.document.type,
      }))
    );

    console.log("📚 Total chunks available:", allChunks.length);

    // If we have an initial query, pre-filter relevant chunks
    let relevantChunks = allChunks;
    if (initialQuery && allChunks.length > 0) {
      try {
        console.log("🔍 Pre-filtering chunks with initial query");
        // Use semantic search to get top relevant chunks
        const searchResults = await searchDocumentChunks(initialQuery, {
          limit: 20,
          threshold: 0.3,
        });

        // Filter to only chunks from this project
        const projectChunkIds = new Set(allChunks.map((c) => c.id));
        relevantChunks = searchResults
          .filter((result: any) => projectChunkIds.has(result.chunkId))
          .map((result: any) => {
            const chunk = allChunks.find((c) => c.id === result.chunkId);
            return chunk ? { ...chunk, relevanceScore: result.score } : null;
          })
          .filter(
            (chunk): chunk is NonNullable<typeof chunk> => chunk !== null
          );

        console.log(
          "✅ Pre-filtered to",
          relevantChunks.length,
          "relevant chunks"
        );
      } catch (error) {
        console.error("⚠️ Error pre-filtering chunks, using all:", error);
        relevantChunks = allChunks;
      }
    }

    // Create cache entry
    const cache: ProjectContextCache = {
      projectId,
      sessionId,
      documents: project.documents.map((pd) => ({
        id: pd.document.id,
        name: pd.document.name,
        type: pd.document.type,
      })),
      relevantChunks: relevantChunks.slice(0, 50), // Keep top 50 for memory efficiency
      createdAt: new Date(),
      lastUsed: new Date(),
      messageCount: 0,
      avgConfidence: 1.0,
    };

    contextCache.set(getCacheKey(sessionId), cache);
    console.log("✅ Context cached for session:", sessionId);

    // Also save to database for persistence
    await db.conversationSession.update({
      where: { sessionId },
      data: {
        projectId,
        contextCache: {
          documentIds: cache.documents.map((d) => d.id),
          chunkCount: cache.relevantChunks.length,
          cachedAt: cache.createdAt.toISOString(),
        },
        contextCachedAt: cache.createdAt,
      },
    });

    return relevantChunks;
  } catch (error) {
    console.error("❌ Error loading project context:", error);
    return [];
  }
}

/**
 * Get or create cached context for a session
 */
export async function getSessionContext(
  sessionId: string,
  projectId: string,
  query?: string
): Promise<any[]> {
  const cacheKey = getCacheKey(sessionId);
  const cached = contextCache.get(cacheKey);

  // Return cached if valid
  if (cached && isCacheValid(cached)) {
    console.log("✅ Using cached context for session:", sessionId);
    cached.lastUsed = new Date();
    cached.messageCount++;
    return cached.relevantChunks;
  }

  // Load fresh context
  console.log("🔄 Loading fresh context for session:", sessionId);
  return await loadProjectContext(projectId, sessionId, query);
}

/**
 * Update cache confidence after message
 */
export function updateCacheConfidence(
  sessionId: string,
  confidence: number
): void {
  const cacheKey = getCacheKey(sessionId);
  const cached = contextCache.get(cacheKey);

  if (cached) {
    // Running average of confidence
    const totalConfidence =
      cached.avgConfidence * (cached.messageCount - 1) + confidence;
    cached.avgConfidence = totalConfidence / cached.messageCount;

    console.log("📊 Updated cache confidence:", {
      session: sessionId,
      messageCount: cached.messageCount,
      avgConfidence: cached.avgConfidence.toFixed(2),
    });
  }
}

/**
 * Invalidate cache for a session
 */
export function invalidateSessionCache(sessionId: string): void {
  const cacheKey = getCacheKey(sessionId);
  contextCache.delete(cacheKey);
  console.log("🗑️ Cache invalidated for session:", sessionId);
}

/**
 * Invalidate all caches for a project (when documents are added/removed)
 */
export function invalidateProjectCaches(projectId: string): void {
  let count = 0;
  for (const [key, cache] of contextCache.entries()) {
    if (cache.projectId === projectId) {
      contextCache.delete(key);
      count++;
    }
  }
  console.log(`🗑️ Invalidated ${count} caches for project:`, projectId);
}

/**
 * Clean up expired caches (run periodically)
 */
export function cleanupExpiredCaches(): void {
  const now = new Date();
  let count = 0;

  for (const [key, cache] of contextCache.entries()) {
    if (!isCacheValid(cache)) {
      contextCache.delete(key);
      count++;
    }
  }

  if (count > 0) {
    console.log(`🧹 Cleaned up ${count} expired caches`);
  }
}

// Run cleanup every 10 minutes
setInterval(cleanupExpiredCaches, 10 * 60 * 1000);
