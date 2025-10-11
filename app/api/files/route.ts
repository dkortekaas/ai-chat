import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir, readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { chunkText } from "@/lib/chunking";
import {
  generateEmbeddings,
  estimateTokens,
  EMBEDDINGS_ENABLED,
} from "@/lib/openai";
import * as mammoth from "mammoth";

const prisma = new PrismaClient();

// GET /api/files - Get all files
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

    // Verify the assistant belongs to the current user
    const assistant = await prisma.chatbotSettings.findFirst({
      where: { id: assistantId, userId: session.user.id },
    });

    if (!assistant) {
      return NextResponse.json(
        { error: "Assistant not found" },
        { status: 404 }
      );
    }

    const files = await prisma.knowledgeFile.findMany({
      where: { assistantId, userId: session.user.id } as Record<
        string,
        unknown
      >,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}

// POST /api/files - Upload a new file
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const description = formData.get("description") as string;
    const assistantId = formData.get("assistantId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!assistantId) {
      return NextResponse.json(
        { error: "Assistant ID is required" },
        { status: 400 }
      );
    }

    // Verify the assistant belongs to the current user
    const assistant = await prisma.chatbotSettings.findFirst({
      where: { id: assistantId, userId: session.user.id },
    });

    if (!assistant) {
      return NextResponse.json(
        { error: "Assistant not found" },
        { status: 404 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "text/plain",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/csv",
      "application/json",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "File type not supported. Allowed types: TXT, PDF, DOC, DOCX, CSV, JSON",
        },
        { status: 400 }
      );
    }

    // Create files directory if it doesn't exist
    const filesDir = join(process.cwd(), "files");
    if (!existsSync(filesDir)) {
      await mkdir(filesDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = join(filesDir, fileName);

    // Save file to filesystem
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save file info to database
    const knowledgeFile = await (
      prisma.knowledgeFile as unknown as {
        create: (args: unknown) => Promise<unknown>;
      }
    ).create({
      data: {
        userId: session.user.id,
        assistantId,
        originalName: file.name,
        fileName,
        filePath,
        mimeType: file.type,
        fileSize: file.size,
        description: description || null,
        status: "PROCESSING",
      },
    });

    // Process the file content for AI usage
    await processDocumentForAI(
      (knowledgeFile as { id: string }).id,
      filePath,
      file.type,
      file.name
    );

    return NextResponse.json(knowledgeFile, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

/**
 * Process uploaded document for AI usage by extracting text and creating chunks
 */
async function processDocumentForAI(
  fileId: string,
  filePath: string,
  mimeType: string,
  originalName: string
) {
  try {
    console.log(`Processing document: ${originalName}`);

    // Extract text content based on file type
    let contentText = "";

    if (mimeType === "text/plain") {
      contentText = await readFile(filePath, "utf-8");
    } else if (mimeType === "application/json") {
      const jsonContent = await readFile(filePath, "utf-8");
      const parsed = JSON.parse(jsonContent);
      contentText = JSON.stringify(parsed, null, 2);
    } else if (mimeType === "text/csv") {
      const csvContent = await readFile(filePath, "utf-8");
      // Convert CSV to readable text format
      const lines = csvContent.split("\n");
      contentText = lines.map((line) => line.replace(/,/g, " | ")).join("\n");
    } else if (mimeType === "application/pdf") {
      // Extract text from PDF
      try {
        const pdfBuffer = await readFile(filePath);

        // Import pdf-parse
        const pdfModule = await import("pdf-parse");
        const { text, numpages } = await (
          pdfModule as unknown as (
            b: Buffer
          ) => Promise<{ text: string; numpages: number }>
        )(pdfBuffer);
        contentText = text ?? "";
        console.log(
          `Extracted ${numpages ?? "unknown"} pages from PDF: ${originalName}`
        );
      } catch (error) {
        console.error(`Error parsing PDF ${originalName}:`, error);
        await prisma.knowledgeFile.update({
          where: { id: fileId },
          data: {
            status: "ERROR",
            errorMessage: `Error parsing PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        });
        return;
      }
    } else if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    ) {
      // Extract text from Word documents (DOCX and DOC)
      try {
        const wordBuffer = await readFile(filePath);
        const result = await mammoth.extractRawText({ buffer: wordBuffer });
        contentText = result.value;
        console.log(`Extracted text from Word document: ${originalName}`);

        // Log any conversion messages
        if (result.messages.length > 0) {
          console.log("Word conversion messages:", result.messages);
        }
      } catch (error) {
        console.error(`Error parsing Word document ${originalName}:`, error);
        await prisma.knowledgeFile.update({
          where: { id: fileId },
          data: {
            status: "ERROR",
            errorMessage: `Error parsing Word document: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        });
        return;
      }
    } else {
      // For other file types - mark as unsupported
      console.warn(
        `File type ${mimeType} not yet supported for text extraction`
      );
      await prisma.knowledgeFile.update({
        where: { id: fileId },
        data: {
          status: "ERROR",
          errorMessage: `File type ${mimeType} not yet supported for text extraction`,
        },
      });
      return;
    }

    if (!contentText || contentText.trim().length === 0) {
      await prisma.knowledgeFile.update({
        where: { id: fileId },
        data: {
          status: "ERROR",
          errorMessage: "No text content found in file",
        },
      });
      return;
    }

    // Determine document type based on mime type
    let documentType = "TXT"; // default
    if (mimeType === "application/pdf") {
      documentType = "PDF";
    } else if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    ) {
      documentType = "DOCX";
    } else if (mimeType === "text/plain") {
      documentType = "TXT";
    }

    // Create a document entry in the documents table
    const document = await prisma.document.create({
      data: {
        name: originalName,
        originalName: originalName,
        type: documentType as "PDF" | "DOCX" | "TXT",
        mimeType: mimeType,
        filePath: filePath,
        contentText: contentText,
        status: "PROCESSING",
        metadata: {
          fileId: fileId,
          originalName: originalName,
          mimeType: mimeType,
        },
      },
    });

    // Chunk the content for better AI processing
    const chunks = chunkText(contentText, {
      chunkSize: 1000,
      chunkOverlap: 200,
      metadata: {
        fileId: fileId,
        documentId: document.id,
        originalName: originalName,
        mimeType: mimeType,
      },
    });

    if (chunks.length === 0) {
      await prisma.document.update({
        where: { id: document.id },
        data: {
          status: "FAILED",
          errorMessage: "No chunks generated",
        },
      });

      await prisma.knowledgeFile.update({
        where: { id: fileId },
        data: { status: "ERROR" },
      });
      return;
    }

    // Generate embeddings if enabled
    if (EMBEDDINGS_ENABLED && process.env.OPENAI_API_KEY) {
      try {
        const chunkTexts = chunks.map((chunk) => chunk.content);
        const embeddings = await generateEmbeddings(chunkTexts);

        // Create document chunks with embeddings
        const documentChunks = chunks.map((chunk, index) => ({
          documentId: document.id,
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          embedding: embeddings[index],
          tokenCount: estimateTokens(chunk.content),
          metadata: chunk.metadata,
        }));

        // Save chunks in batches
        for (const chunk of documentChunks) {
          await (
            prisma.documentChunk as unknown as {
              create: (args: unknown) => Promise<unknown>;
            }
          ).create({
            data: {
              ...chunk,
              metadata: chunk.metadata,
            },
          });
        }

        console.log(
          `Created ${chunks.length} chunks with embeddings for document: ${originalName}`
        );
      } catch (embeddingError) {
        console.warn(
          `Failed to create embeddings for document ${originalName}:`,
          embeddingError
        );

        // Still create chunks without embeddings
        for (const chunk of chunks) {
          await (
            prisma.documentChunk as unknown as {
              create: (args: unknown) => Promise<unknown>;
            }
          ).create({
            data: {
              documentId: document.id,
              chunkIndex: chunk.chunkIndex,
              content: chunk.content,
              tokenCount: estimateTokens(chunk.content),
              metadata: chunk.metadata,
            },
          });
        }

        console.log(
          `Created ${chunks.length} chunks without embeddings for document: ${originalName}`
        );
      }
    } else {
      // Create chunks without embeddings
      for (const chunk of chunks) {
        await (
          prisma.documentChunk as unknown as {
            create: (args: unknown) => Promise<unknown>;
          }
        ).create({
          data: {
            documentId: document.id,
            chunkIndex: chunk.chunkIndex,
            content: chunk.content,
            tokenCount: estimateTokens(chunk.content),
            metadata: chunk.metadata,
          },
        });
      }

      console.log(
        `Created ${chunks.length} chunks without embeddings for document: ${originalName}`
      );
    }

    // Update document status
    await prisma.document.update({
      where: { id: document.id },
      data: {
        status: "COMPLETED",
        metadata: {
          ...((document as { metadata?: Record<string, unknown> }).metadata ??
            {}),
          chunksCreated: chunks.length,
          totalTokens: chunks.reduce(
            (sum, chunk) => sum + estimateTokens(chunk.content),
            0
          ),
        },
      },
    });

    // Update knowledge file status
    await prisma.knowledgeFile.update({
      where: { id: fileId },
      data: {
        status: "COMPLETED",
        metadata: {
          documentId: document.id,
          chunksCreated: chunks.length,
        },
      },
    });

    console.log(`Successfully processed document: ${originalName}`);
  } catch (error) {
    console.error(`Error processing document ${originalName}:`, error);

    // Update both document and knowledge file status to failed
    try {
      await prisma.knowledgeFile.update({
        where: { id: fileId },
        data: {
          status: "ERROR",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        },
      });
    } catch (updateError) {
      console.error("Error updating knowledge file status:", updateError);
    }
  }
}
