import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { WebsiteScraper } from "@/lib/WebsiteScraper";
import { chunkWebsiteContent } from "@/lib/chunking";
import {
  generateEmbeddings,
  estimateTokens,
  EMBEDDINGS_ENABLED,
} from "@/lib/openai";

// GET /api/websites - Get all websites for a specific assistant
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assistantId = searchParams.get("assistantId");

    if (!assistantId) {
      return NextResponse.json(
        { error: "Assistant ID is required" },
        { status: 400 }
      );
    }

    // Load current user with company for scoping
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, companyId: true },
    });

    if (!currentUser) {
      console.error("User not found in database:", session.user.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the assistant belongs to the company
    const assistant = await db.chatbotSettings.findFirst({
      where: {
        id: assistantId,
        users: {
          companyId: currentUser.companyId,
        },
      },
      include: {
        users: {
          select: {
            companyId: true,
          },
        },
      },
    });

    if (!assistant) {
      return NextResponse.json(
        { error: "Assistant not found" },
        { status: 404 }
      );
    }

    const websites = await db.website.findMany({
      where: {
        assistantId: assistantId,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(websites);
  } catch (error) {
    console.error("Error fetching websites:", error);
    return NextResponse.json(
      { error: "Failed to fetch websites" },
      { status: 500 }
    );
  }
}

// POST /api/websites - Create a new website
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, name, description, syncInterval, assistantId } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (!assistantId) {
      return NextResponse.json(
        { error: "Assistant ID is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Load current user with company for scoping
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, companyId: true },
    });

    if (!currentUser) {
      console.error("User not found in database:", session.user.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the assistant belongs to the company
    const assistant = await db.chatbotSettings.findFirst({
      where: {
        id: assistantId,
        users: {
          companyId: currentUser.companyId,
        },
      },
      include: {
        users: {
          select: {
            companyId: true,
          },
        },
      },
    });

    if (!assistant) {
      return NextResponse.json(
        { error: "Assistant not found" },
        { status: 404 }
      );
    }

    // Normalize URL for comparison (remove trailing slash, convert to lowercase)
    const normalizedUrl = url.toLowerCase().replace(/\/$/, "");

    // Check if website already exists for this assistant
    const existingWebsite = await db.website.findFirst({
      where: {
        assistantId: assistantId,
        url: {
          equals: normalizedUrl,
          mode: "insensitive",
        },
      },
    });

    if (existingWebsite) {
      return NextResponse.json(
        {
          error:
            "This website URL has already been added to this assistant. Please choose a different URL or edit the existing one.",
          code: "DUPLICATE_URL",
        },
        { status: 409 }
      );
    }

    const website = await db.website.create({
      data: {
        assistantId: assistantId,
        url: normalizedUrl,
        name: name || null,
        description: description || null,
        syncInterval: syncInterval || "never",
        status: "PENDING",
      },
    });

    // Start scraping automatically in the background
    scrapeWebsiteInBackground(website.id, website.url);

    return NextResponse.json(website, { status: 201 });
  } catch (error: unknown) {
    // Prisma unique constraint -> duplicate URL
    if (
      typeof error === "object" &&
      error !== null &&
      (error as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "Deze website URL is al toegevoegd. Kies een andere URL of bewerk de bestaande.",
          code: "DUPLICATE_URL",
        },
        { status: 409 }
      );
    }
    console.error("Error creating website:", error);
    return NextResponse.json(
      { error: "Failed to create website" },
      { status: 500 }
    );
  }
}

// Background scraping function
async function scrapeWebsiteInBackground(websiteId: string, url: string) {
  try {
    // Update status to SYNCING
    await db.website.update({
      where: { id: websiteId },
      data: {
        status: "SYNCING",
        lastSync: new Date(),
      },
    });

    // Clear existing pages
    await db.websitePage.deleteMany({
      where: { websiteId },
    });

    const scraper = new WebsiteScraper(10, 2); // Max 10 pages, depth 2
    const scrapedData = await scraper.scrapeWebsite(url);

    // Combine all content from all pages
    const combinedContent = scrapedData.pages
      .map((page) => page.content)
      .filter((content) => content.trim().length > 0)
      .join("\n\n");

    // Extract all unique links
    const allLinks = scrapedData.pages
      .flatMap((page) => page.links)
      .filter((link, index, array) => array.indexOf(link) === index); // Remove duplicates

    // Update website with scraped content
    await db.website.update({
      where: { id: websiteId },
      data: {
        status: scrapedData.errors.length > 0 ? "ERROR" : "COMPLETED",
        scrapedContent: combinedContent,
        scrapedLinks: allLinks,
        pageCount: scrapedData.pages.length,
        errorMessage:
          scrapedData.errors.length > 0 ? scrapedData.errors.join("; ") : null,
        lastSync: new Date(),
      },
    });

    // Save individual pages and create document chunks for RAG
    for (const page of scrapedData.pages) {
      const websitePage = await db.websitePage.create({
        data: {
          websiteId,
          url: page.url,
          title: page.title,
          content: page.content,
          links: page.links,
          status: page.error ? "ERROR" : "COMPLETED",
          errorMessage: page.error,
          scrapedAt: new Date(),
        },
      });

      // Create document chunks for RAG if content exists and OpenAI is available
      if (
        page.content &&
        page.content.trim().length > 0 &&
        !page.error &&
        process.env.OPENAI_API_KEY &&
        EMBEDDINGS_ENABLED
      ) {
        try {
          await createDocumentChunksForPage(
            {
              id: websitePage.id,
              url: websitePage.url,
              title: websitePage.title,
              content: websitePage.content,
              scrapedAt: websitePage.scrapedAt,
              links: (websitePage.links as string[]) || [],
            },
            { id: websiteId, url: websitePage.url }
          );
        } catch (embeddingError) {
          console.warn(
            `Failed to create embeddings for page ${page.url}:`,
            embeddingError
          );
          // Continue without embeddings - the page is still saved
        }
      }
    }

    console.log(
      `Successfully scraped website ${url}: ${scrapedData.pages.length} pages`
    );
  } catch (error) {
    console.error(`Error scraping website ${url}:`, error);

    // Update website status to ERROR
    await db.website.update({
      where: { id: websiteId },
      data: {
        status: "ERROR",
        errorMessage:
          error instanceof Error ? error.message : "Unknown error occurred",
        lastSync: new Date(),
      },
    });
  }
}

// Create document chunks for RAG system
async function createDocumentChunksForPage(
  websitePage: {
    id: string;
    url: string;
    title: string | null;
    content: string;
    scrapedAt: Date | null;
    links?: string[];
  },
  website: { id: string; url: string }
) {
  try {
    // Chunk the content
    const chunks = chunkWebsiteContent(
      websitePage.content,
      websitePage.url,
      websitePage.title || undefined
    );

    // Create a document record first
    const document = await db.document.create({
      data: {
        name: websitePage.title || websitePage.url,
        originalName: websitePage.title || websitePage.url,
        type: "URL",
        url: websitePage.url,
        contentText: websitePage.content,
        metadata: {
          websiteId: website.id,
          websiteUrl: website.url,
          pageId: websitePage.id,
          pageUrl: websitePage.url,
          scrapedAt: websitePage.scrapedAt?.toISOString(),
          links: websitePage.links || [],
        },
      },
    });

    // Create document chunks in database
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const documentChunk = await db.documentChunk.create({
        data: {
          documentId: document.id,
          chunkIndex: i,
          content: chunk.content,
          metadata: {
            source: "website",
            websiteId: website.id,
            websiteUrl: website.url,
            pageId: websitePage.id,
            pageUrl: websitePage.url,
            pageTitle: websitePage.title,
            chunkIndex: i,
            totalChunks: chunks.length,
            scrapedAt: websitePage.scrapedAt?.toISOString(),
            links: websitePage.links || [],
          },
          tokenCount: estimateTokens(chunk.content),
        },
      });

      // Generate embeddings if OpenAI is available
      if (process.env.OPENAI_API_KEY && EMBEDDINGS_ENABLED) {
        try {
          const embeddings = await generateEmbeddings([chunk.content]);
          // Use raw SQL to update the embedding field since Prisma client has issues with vector type
          await db.$executeRaw`
            UPDATE document_chunks 
            SET embedding = ${JSON.stringify(embeddings[0])}::vector 
            WHERE id = ${documentChunk.id}
          `;
        } catch (embeddingError) {
          console.warn(
            `Failed to generate embeddings for chunk ${i} of page ${websitePage.url}:`,
            embeddingError
          );
          // Continue without embeddings - the chunk is still saved
        }
      }
    }

    console.log(
      `Created ${chunks.length} document chunks for page ${websitePage.url}`
    );
  } catch (error) {
    console.error(
      `Error creating document chunks for page ${websitePage.url}:`,
      error
    );
    throw error;
  }
}
