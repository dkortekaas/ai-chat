import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema for updating a project
const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
});

/**
 * GET /api/projects/[id]
 * Get a single project by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

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

    // Get project with documents and assistants
    const project = await db.project.findFirst({
      where: {
        id,
        companyId: currentUser.companyId,
      },
      include: {
        documents: {
          include: {
            document: {
              select: {
                id: true,
                name: true,
                originalName: true,
                type: true,
                fileSize: true,
                status: true,
                createdAt: true,
              },
            },
          },
          orderBy: { addedAt: "desc" },
        },
        assistants: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
        _count: {
          select: { documents: true, assistants: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[id]
 * Update a project
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

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
    const existingProject = await db.project.findFirst({
      where: {
        id,
        companyId: currentUser.companyId,
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateProjectSchema.parse(body);

    // Update the project
    const project = await db.project.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: { documents: true, assistants: true },
        },
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete a project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

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
    const existingProject = await db.project.findFirst({
      where: {
        id,
        companyId: currentUser.companyId,
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Delete the project (will cascade to project_documents)
    await db.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
