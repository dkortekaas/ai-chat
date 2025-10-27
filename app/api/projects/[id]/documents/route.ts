import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { invalidateProjectCaches } from "@/lib/project-context";

// Validation schema for adding documents
const addDocumentsSchema = z.object({
  documentIds: z.array(z.string()).min(1, "At least one document ID is required"),
});

// Validation schema for removing a document
const removeDocumentSchema = z.object({
  documentId: z.string().min(1, "Document ID is required"),
});

/**
 * POST /api/projects/[id]/documents
 * Add documents to a project
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Load current user with company
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, companyId: true },
    });

    if (!currentUser?.companyId) {
      return NextResponse.json(
        { error: "User must belong to a company" },
        { status: 403 }
      );
    }

    // Verify project exists and belongs to company
    const project = await db.project.findFirst({
      where: {
        id: params.id,
        companyId: currentUser.companyId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { documentIds } = addDocumentsSchema.parse(body);

    // Verify all documents exist
    const documents = await db.document.findMany({
      where: {
        id: { in: documentIds },
        status: "COMPLETED",
      },
      select: { id: true },
    });

    if (documents.length !== documentIds.length) {
      return NextResponse.json(
        { error: "Some documents not found or not completed" },
        { status: 400 }
      );
    }

    // Add documents to project (using createMany with skipDuplicates)
    const result = await db.projectDocument.createMany({
      data: documentIds.map((documentId) => ({
        projectId: params.id,
        documentId,
        addedById: currentUser.id,
      })),
      skipDuplicates: true,
    });

    // Update project document count
    const documentCount = await db.projectDocument.count({
      where: { projectId: params.id },
    });

    await db.project.update({
      where: { id: params.id },
      data: { documentCount },
    });

    // Invalidate all caches for this project
    invalidateProjectCaches(params.id);
    console.log("🗑️ Invalidated project caches after adding documents");

    return NextResponse.json({
      success: true,
      added: result.count,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error adding documents to project:", error);
    return NextResponse.json(
      { error: "Failed to add documents" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]/documents
 * Remove a document from a project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Load current user with company
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, companyId: true },
    });

    if (!currentUser?.companyId) {
      return NextResponse.json(
        { error: "User must belong to a company" },
        { status: 403 }
      );
    }

    // Verify project exists and belongs to company
    const project = await db.project.findFirst({
      where: {
        id: params.id,
        companyId: currentUser.companyId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { documentId } = removeDocumentSchema.parse(body);

    // Remove document from project
    await db.projectDocument.delete({
      where: {
        projectId_documentId: {
          projectId: params.id,
          documentId,
        },
      },
    });

    // Update project document count
    const documentCount = await db.projectDocument.count({
      where: { projectId: params.id },
    });

    await db.project.update({
      where: { id: params.id },
      data: { documentCount },
    });

    // Invalidate all caches for this project
    invalidateProjectCaches(params.id);
    console.log("🗑️ Invalidated project caches after removing document");

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error removing document from project:", error);
    return NextResponse.json(
      { error: "Failed to remove document" },
      { status: 500 }
    );
  }
}
