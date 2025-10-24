import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// Types voor search results
export interface SearchResult {
  id: string;
  type: "faq" | "document" | "knowledge_file" | "website" | "website_page";
  title: string;
  content: string;
  score: number;
  metadata?: any;
  assistantId?: string | null;
  url?: string;
}

export interface SearchOptions {
  assistantId?: string;
  limit?: number;
  threshold?: number; // Minimum similarity score (0-1)
  includeDisabled?: boolean;
}

/**
 * Preprocess query to improve search results
 * - Expands synonyms for better recall
 * - Removes stop words
 * - Normalizes text
 */
export function preprocessQuery(query: string): string {
  let processed = query.toLowerCase().trim();

  // Synoniemen expansie voor betere recall
  const synonyms: Record<string, string[]> = {
    prijs: ["kosten", "tarief", "prijzen", "betalen"],
    werkt: ["functioneert", "werking", "functionaliteit", "gebruik"],
    integratie: ["koppeling", "verbinding", "samenwerking", "connectie"],
    contact: ["bereikbaar", "telefoon", "email", "adres"],
    openingstijden: ["open", "uren", "tijd", "geopend"],
    betalen: ["betaling", "factuur", "rekening", "kosten"],
    installatie: ["installeren", "setup", "configuratie", "instellen"],
    ondersteuning: ["support", "hulp", "assistentie", "service"],
    account: ["gebruiker", "profiel", "inloggen", "registreren"],
    download: ["downloaden", "bestand", "software", "app"],
    bestelling: ["bestellen", "order", "aanvragen"],
    product: ["producten", "artikel", "artikelen", "item"],
    levering: ["leverancier", "verzending", "leveren", "transport"],
    voorraad: ["stock", "inventaris", "beschikbaar"],
  };

  // Voeg synoniemen toe aan query voor betere matching
  Object.entries(synonyms).forEach(([term, syns]) => {
    if (processed.includes(term)) {
      processed += " " + syns.join(" ");
    }
  });

  // Verwijder stop words maar behoud context
  const stopWords = [
    "een",
    "het",
    "de",
    "van",
    "met",
    "voor",
    "aan",
    "op",
    "in",
    "bij",
    "naar",
    "over",
    "onder",
    "tussen",
    "door",
    "zonder",
    "tijdens",
    "na",
    "om",
    "te",
    "dat",
    "die",
    "dit",
  ];

  const words = processed.split(/\s+/).filter((word) => {
    return word.length > 2 && !stopWords.includes(word);
  });

  return words.join(" ");
}

/**
 * Genereert een embedding vector voor een gegeven tekst
 * Gebruikt de OpenAI embedding service met fallback logica uit lib/embedding-service.ts
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { generateOpenAIEmbedding } = await import("./embedding-service");
  return generateOpenAIEmbedding(text);
}

/**
 * Zoekt in FAQ entries op basis van tekstuele matching
 */
export async function searchFAQs(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const { assistantId, limit = 10, includeDisabled = false } = options;

  const faqs = await prisma.fAQ.findMany({
    where: {
      AND: [
        assistantId ? { assistantId } : {},
        includeDisabled ? {} : { enabled: true },
        {
          OR: [
            { question: { contains: query, mode: "insensitive" } },
            { answer: { contains: query, mode: "insensitive" } },
          ],
        },
      ],
    },
    orderBy: { order: "asc" },
    take: limit,
  });

  return faqs.map((faq, index) => ({
    id: faq.id,
    type: "faq" as const,
    title: faq.question,
    content: faq.answer,
    score: 1 - index / faqs.length, // Simpele score gebaseerd op volgorde
    assistantId: faq.assistantId,
  }));
}

/**
 * Zoekt in document chunks op basis van vector similarity
 * Gebruikt pgvector voor semantische zoeken
 * Valt automatisch terug naar text-based search als embeddings niet werken
 */
export async function searchDocumentChunks(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const { limit = 10, threshold = 0.7, assistantId } = options;

  try {
    // Genereer embedding voor de query
    const queryEmbedding = await generateEmbedding(query);

    // Check of embedding leeg is (alle nullen = embeddings werken niet)
    const isEmptyEmbedding = queryEmbedding.every((val) => val === 0);

    if (isEmptyEmbedding) {
      console.warn(
        "⚠️  Embeddings are not working (empty embedding returned). Falling back to text-based search."
      );
      return searchDocumentsByText(query, options);
    }

    // Filter documents by assistantId if provided
    let allowedDocumentIds: string[] | null = null;

    if (assistantId) {
      console.log(`🔍 Vector search: Filtering for assistant: ${assistantId}`);

      // Find knowledge files for this assistant
      const knowledgeFiles = await prisma.knowledgeFile.findMany({
        where: { assistantId, enabled: true },
        select: { id: true },
      });

      const fileIds = knowledgeFiles.map((f) => f.id);

      if (fileIds.length === 0) {
        console.warn(
          `⚠️  No knowledge files found for assistant ${assistantId}`
        );
        return [];
      }

      // Find documents that have these fileIds in their metadata
      const documents = await prisma.document.findMany({
        where: { status: "COMPLETED" },
        select: { id: true, metadata: true },
      });

      allowedDocumentIds = documents
        .filter((doc) => {
          const metadata = doc.metadata as { fileId?: string } | null;
          return metadata?.fileId && fileIds.includes(metadata.fileId);
        })
        .map((doc) => doc.id);

      console.log(
        `📄 Vector search: Found ${allowedDocumentIds.length} documents for this assistant`
      );

      if (allowedDocumentIds.length === 0) {
        console.warn(`⚠️  No documents found for assistant ${assistantId}`);
        return [];
      }
    }

    // Converteer array naar string format voor pgvector
    const embeddingString = `[${queryEmbedding.join(",")}]`;

    // Build the SQL query with optional document filtering
    let results;

    if (allowedDocumentIds && allowedDocumentIds.length > 0) {
      // Query with document ID filtering
      results = await prisma.$queryRaw<
        Array<{
          id: string;
          documentId: string;
          content: string;
          chunkIndex: number;
          similarity: number;
          document_name: string;
          document_type: string;
        }>
      >`
        SELECT 
          dc.id,
          dc."documentId",
          dc.content,
          dc."chunkIndex",
          1 - (dc.embedding <=> ${embeddingString}::vector) as similarity,
          d.name as document_name,
          d.type as document_type
        FROM document_chunks dc
        INNER JOIN documents d ON dc."documentId" = d.id
        WHERE 
          d.status = 'COMPLETED'
          AND dc.embedding IS NOT NULL
          AND dc."documentId" = ANY(${allowedDocumentIds}::text[])
          AND 1 - (dc.embedding <=> ${embeddingString}::vector) >= ${threshold}
        ORDER BY dc.embedding <=> ${embeddingString}::vector
        LIMIT ${limit}
      `;
    } else {
      // Query without filtering (when no assistantId provided)
      results = await prisma.$queryRaw<
        Array<{
          id: string;
          documentId: string;
          content: string;
          chunkIndex: number;
          similarity: number;
          document_name: string;
          document_type: string;
        }>
      >`
        SELECT 
          dc.id,
          dc."documentId",
          dc.content,
          dc."chunkIndex",
          1 - (dc.embedding <=> ${embeddingString}::vector) as similarity,
          d.name as document_name,
          d.type as document_type
        FROM document_chunks dc
        INNER JOIN documents d ON dc."documentId" = d.id
        WHERE 
          d.status = 'COMPLETED'
          AND dc.embedding IS NOT NULL
          AND 1 - (dc.embedding <=> ${embeddingString}::vector) >= ${threshold}
        ORDER BY dc.embedding <=> ${embeddingString}::vector
        LIMIT ${limit}
      `;
    }

    // Als geen resultaten, probeer text-based search als fallback
    if (results.length === 0) {
      console.log(
        "ℹ️  No vector search results found, trying text-based search as fallback..."
      );
      return searchDocumentsByText(query, options);
    }

    // Check if all results have 0 similarity (empty embeddings problem)
    const allZeroScores = results.every(
      (r) => r.similarity === 0 || r.similarity < 0.01
    );
    if (allZeroScores) {
      console.log(
        "⚠️  All vector search results have 0 similarity (empty embeddings). Falling back to text-based search..."
      );
      return searchDocumentsByText(query, options);
    }

    return results.map((result) => ({
      id: result.id,
      type: "document" as const,
      title: result.document_name,
      content: result.content,
      score: result.similarity,
      metadata: {
        documentId: result.documentId,
        documentType: result.document_type,
        chunkIndex: result.chunkIndex,
      },
    }));
  } catch (error) {
    console.error("Error in vector search:", error);
    console.log("🔄 Falling back to text-based search...");
    // Fallback naar text-based search als vector search faalt
    return searchDocumentsByText(query, options);
  }
}

/**
 * Fallback: zoekt in documenten op basis van tekstuele matching
 * Gebruikt keyword matching met score berekening
 */
export async function searchDocumentsByText(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const { limit = 10, assistantId } = options;

  console.log(`🔍 Using text-based search for query: "${query}"`);

  // Split query into keywords (remove common words and punctuation)
  const stopWords = [
    "de",
    "het",
    "een",
    "is",
    "was",
    "zijn",
    "wat",
    "wie",
    "waar",
    "hoe",
    "hoeveel",
    "kan",
    "ik",
    "heb",
    "met",
    "voor",
    "op",
    "in",
    "aan",
    "van",
    "te",
    "dit",
    "dat",
  ];
  const keywords = query
    .toLowerCase()
    .replace(/[?.,!]/g, " ") // Remove punctuation
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.includes(word));

  console.log(`📝 Searching for keywords: ${keywords.join(", ")}`);

  // Build OR conditions for each keyword
  const keywordConditions = keywords.map((keyword) => ({
    content: { contains: keyword, mode: "insensitive" as const },
  }));

  if (keywordConditions.length === 0) {
    // If no valid keywords, use full query
    keywordConditions.push({
      content: { contains: query, mode: "insensitive" as const },
    });
  }

  // First, find documents that belong to this assistant
  let documentIds: string[] | undefined;

  if (assistantId) {
    console.log(`🔍 Filtering for assistant: ${assistantId}`);

    // Find knowledge files for this assistant
    const knowledgeFiles = await prisma.knowledgeFile.findMany({
      where: { assistantId, enabled: true },
      select: { id: true },
    });

    const fileIds = knowledgeFiles.map((f) => f.id);
    console.log(
      `📁 Found ${fileIds.length} knowledge files for this assistant`
    );

    if (fileIds.length === 0) {
      console.warn(`⚠️  No knowledge files found for assistant ${assistantId}`);
      return [];
    }

    // Find documents that have these fileIds in their metadata
    const documents = await prisma.document.findMany({
      where: {
        status: "COMPLETED",
      },
      select: {
        id: true,
        metadata: true,
      },
    });

    // Filter documents by fileId in metadata
    documentIds = documents
      .filter((doc) => {
        const metadata = doc.metadata as { fileId?: string } | null;
        return metadata?.fileId && fileIds.includes(metadata.fileId);
      })
      .map((doc) => doc.id);

    console.log(`📄 Found ${documentIds.length} documents for this assistant`);

    if (documentIds.length === 0) {
      console.warn(`⚠️  No documents found for assistant ${assistantId}`);
      return [];
    }
  }

  const whereConditions: any = {
    AND: [{ OR: keywordConditions }, { document: { status: "COMPLETED" } }],
  };

  // If we have specific documents for this assistant, filter by them
  if (documentIds) {
    whereConditions.AND.push({ documentId: { in: documentIds } });
  }

  const chunks = await prisma.documentChunk.findMany({
    where: whereConditions,
    include: {
      document: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
    take: limit * 5, // Get more results to filter and score
  });

  // Calculate relevance score based on keyword matches
  const scoredChunks = chunks.map((chunk) => {
    const contentLower = chunk.content.toLowerCase();

    // Count how many keywords appear in the content
    const keywordMatches = keywords.filter((keyword) =>
      contentLower.includes(keyword)
    ).length;

    // Calculate base score (0-1)
    let score = keywords.length > 0 ? keywordMatches / keywords.length : 0.5;

    // Boost score if ALL keywords appear
    if (keywordMatches === keywords.length) {
      score = Math.min(score * 1.5, 1.0); // 50% boost for exact match
    }

    // Boost score if query appears as exact phrase
    if (contentLower.includes(query.toLowerCase().replace(/[?.,!]/g, ""))) {
      score = Math.min(score + 0.3, 1.0); // Extra boost for phrase match
    }

    // HUGE boost if keyword appears CLOSE to a Markdown heading (## Keyword)
    // Only boost if keyword is within 50 chars of ##
    for (const keyword of keywords) {
      const headingPattern = new RegExp(`##+[^#]{0,50}${keyword}`, "mi");
      if (headingPattern.test(chunk.content)) {
        score = Math.min(score + 0.4, 1.0); // MAJOR boost for heading match
        break; // Only boost once
      }
    }

    // Extra boost if keyword appears at start of line (likely important)
    for (const keyword of keywords) {
      const startOfLinePattern = new RegExp(`^${keyword}|\\n${keyword}`, "mi");
      if (startOfLinePattern.test(chunk.content)) {
        score = Math.min(score + 0.15, 1.0);
        break;
      }
    }

    return {
      ...chunk,
      score,
    };
  });

  // Sort by score and take top results
  const sortedChunks = scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  console.log(
    `✅ Found ${sortedChunks.length} results via text search (scores: ${sortedChunks.map((c) => c.score.toFixed(2)).join(", ")})`
  );

  return sortedChunks.map((chunk) => ({
    id: chunk.id,
    type: "document" as const,
    title: chunk.document.name,
    content: chunk.content,
    score: chunk.score,
    metadata: {
      documentId: chunk.documentId,
      documentType: chunk.document.type,
      chunkIndex: chunk.chunkIndex,
    },
  }));
}

/**
 * Zoekt in knowledge files op basis van metadata en beschrijving
 */
export async function searchKnowledgeFiles(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const { assistantId, limit = 10, includeDisabled = false } = options;

  const files = await prisma.knowledgeFile.findMany({
    where: {
      AND: [
        assistantId ? { assistantId } : {},
        includeDisabled ? {} : { enabled: true },
        { status: "COMPLETED" },
        {
          OR: [
            { originalName: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return files.map((file, index) => ({
    id: file.id,
    type: "knowledge_file" as const,
    title: file.originalName,
    content: file.description || "",
    score: 1 - index / files.length,
    assistantId: file.assistantId,
    metadata: {
      fileName: file.fileName,
      filePath: file.filePath,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
    },
  }));
}

/**
 * Zoekt in websites op basis van scraped content
 */
export async function searchWebsites(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const { assistantId, limit = 10 } = options;

  const websites = await prisma.website.findMany({
    where: {
      AND: [
        assistantId ? { assistantId } : {},
        { status: "COMPLETED" },
        {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { scrapedContent: { contains: query, mode: "insensitive" } },
            { url: { contains: query, mode: "insensitive" } },
          ],
        },
      ],
    },
    orderBy: { lastSync: "desc" },
    take: limit,
  });

  return websites.map((website, index) => ({
    id: website.id,
    type: "website" as const,
    title: website.name || website.url,
    content: website.scrapedContent?.slice(0, 500) || website.description || "",
    score: 1 - index / websites.length,
    url: website.url,
    assistantId: website.assistantId,
    metadata: {
      pageCount: website.pageCount,
      lastSync: website.lastSync,
      syncInterval: website.syncInterval,
    },
  }));
}

/**
 * Zoekt in website pages op basis van content
 */
export async function searchWebsitePages(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const { assistantId, limit = 10 } = options;

  const pages = await prisma.websitePage.findMany({
    where: {
      AND: [
        assistantId ? { website: { assistantId } } : {},
        { status: "COMPLETED" },
        {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
            { url: { contains: query, mode: "insensitive" } },
          ],
        },
      ],
    },
    include: {
      website: {
        select: {
          id: true,
          name: true,
          url: true,
        },
      },
    },
    orderBy: { scrapedAt: "desc" },
    take: limit,
  });

  return pages.map((page, index) => ({
    id: page.id,
    type: "website_page" as const,
    title: page.title || page.url,
    content: page.content.slice(0, 500), // Limiteer content voor preview
    score: 1 - index / pages.length,
    url: page.url,
    metadata: {
      websiteId: page.websiteId,
      websiteName: page.website.name,
      websiteUrl: page.website.url,
      scrapedAt: page.scrapedAt,
    },
  }));
}

/**
 * Unified search: zoekt over alle bronnen en combineert resultaten
 */
export async function unifiedSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const { limit = 10 } = options;

  // Voer alle searches parallel uit
  // Give more weight to document chunks since that's where most content is
  const [
    faqResults,
    documentResults,
    fileResults,
    websiteResults,
    websitePageResults,
  ] = await Promise.all([
    searchFAQs(query, { ...options, limit: Math.ceil(limit / 5) }),
    searchDocumentChunks(query, { ...options, limit: limit * 2 }), // More chunks to find best matches
    searchKnowledgeFiles(query, { ...options, limit: Math.ceil(limit / 5) }),
    searchWebsites(query, { ...options, limit: Math.ceil(limit / 5) }),
    searchWebsitePages(query, { ...options, limit: Math.ceil(limit / 5) }),
  ]);

  // Debug logging voor elke bron
  console.log("🔍 Unified Search Results:");
  console.log(`📋 FAQs: ${faqResults.length} results`);
  if (faqResults.length > 0) {
    faqResults.forEach((result, index) => {
      console.log(
        `  ${index + 1}. ${result.title} (score: ${(result.score * 100).toFixed(1)}%)`
      );
    });
  }

  console.log(`📄 Documents: ${documentResults.length} results`);
  if (documentResults.length > 0) {
    documentResults.forEach((result, index) => {
      console.log(
        `  ${index + 1}. ${result.title} (score: ${(result.score * 100).toFixed(1)}%)`
      );
    });
  }

  console.log(`📁 Knowledge Files: ${fileResults.length} results`);
  if (fileResults.length > 0) {
    fileResults.forEach((result, index) => {
      console.log(
        `  ${index + 1}. ${result.title} (score: ${(result.score * 100).toFixed(1)}%)`
      );
    });
  }

  console.log(`🌐 Websites: ${websiteResults.length} results`);
  if (websiteResults.length > 0) {
    websiteResults.forEach((result, index) => {
      console.log(
        `  ${index + 1}. ${result.title} (score: ${(result.score * 100).toFixed(1)}%)`
      );
    });
  }

  console.log(`📰 Website Pages: ${websitePageResults.length} results`);
  if (websitePageResults.length > 0) {
    websitePageResults.forEach((result, index) => {
      console.log(
        `  ${index + 1}. ${result.title} (score: ${(result.score * 100).toFixed(1)}%)`
      );
    });
  }

  // Combineer alle resultaten
  const allResults = [
    ...faqResults,
    ...documentResults,
    ...fileResults,
    ...websiteResults,
    ...websitePageResults,
  ];

  console.log(
    `✅ Total results before sorting: ${allResults.length} from ${faqResults.length + documentResults.length + fileResults.length + websiteResults.length + websitePageResults.length} sources`
  );

  // Sorteer op score en limiteer
  const sortedResults = allResults
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  console.log(
    `🎯 Final sorted results (top ${limit}): ${sortedResults.length}`
  );
  if (sortedResults.length > 0) {
    sortedResults.forEach((result, index) => {
      console.log(
        `  ${index + 1}. [${result.type.toUpperCase()}] ${result.title} (score: ${(result.score * 100).toFixed(1)}%)`
      );
    });
  }

  return sortedResults;
}

/**
 * Hybride search: combineert vector similarity met keyword matching
 * Voor betere resultaten bij diverse queries
 */
export async function hybridSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const { limit = 10 } = options;

  // Voer zowel vector als text search uit
  const [vectorResults, textResults] = await Promise.all([
    searchDocumentChunks(query, { ...options, limit }),
    searchDocumentsByText(query, { ...options, limit }),
  ]);

  // Merge resultaten en boost items die in beide voorkomen
  const resultMap = new Map<string, SearchResult>();

  vectorResults.forEach((result) => {
    resultMap.set(result.id, { ...result, score: result.score * 0.7 }); // Vector krijgt 70% weight
  });

  textResults.forEach((result) => {
    const existing = resultMap.get(result.id);
    if (existing) {
      // Item komt in beide voor - boost de score
      existing.score = existing.score + result.score * 0.3;
    } else {
      resultMap.set(result.id, { ...result, score: result.score * 0.3 }); // Text krijgt 30% weight
    }
  });

  // Converteer terug naar array en sorteer
  const mergedResults = Array.from(resultMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return mergedResults;
}

/**
 * Zoekt relevante context voor een chatbot vraag
 * Dit is de hoofdfunctie die je in je chatbot zou gebruiken
 */
export async function searchRelevantContext(
  query: string,
  assistantId: string,
  options: Partial<SearchOptions> = {}
): Promise<SearchResult[]> {
  // Preprocess query voor betere zoekresultaten
  const preprocessedQuery = preprocessQuery(query);
  console.log(`🔍 Original query: "${query}"`);
  console.log(`🔍 Preprocessed query: "${preprocessedQuery}"`);

  const searchOptions: SearchOptions = {
    assistantId,
    limit: 5,
    threshold: 0.7,
    ...options,
  };

  // Gebruik unified search voor beste dekking met preprocessed query
  const results = await unifiedSearch(preprocessedQuery, searchOptions);

  return results;
}

/**
 * Formatteert search results naar een context string voor de AI
 */
export function formatContextForAI(results: SearchResult[]): string {
  if (results.length === 0) {
    return "Geen relevante informatie gevonden in de kennisbank.";
  }

  const contextParts = results.map((result, index) => {
    return `[Bron ${index + 1} - ${result.type.toUpperCase()}]
Titel: ${result.title}
Content: ${result.content}
Relevantie: ${(result.score * 100).toFixed(1)}%
`;
  });

  return `Relevante informatie uit de kennisbank:\n\n${contextParts.join("\n---\n\n")}`;
}

// Export de prisma client voor gebruik elders
export { prisma };
