"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, FileText, Trash2, Plus, Users } from "lucide-react";
import { AddDocumentsModal } from "./AddDocumentsModal";

interface Project {
  id: string;
  name: string;
  description?: string;
  _count?: {
    assistants: number;
  };
}

interface ProjectDocument {
  document: {
    id: string;
    name: string;
    originalName: string;
    type: string;
    fileSize: number;
    status: string;
    createdAt: string;
  };
  addedAt: string;
}

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdate: () => void;
}

export function ProjectDetailModal({
  isOpen,
  onClose,
  project,
  onUpdate,
}: ProjectDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [removingDocId, setRemovingDocId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProjectDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`);

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else {
        throw new Error("Failed to fetch project details");
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
      toast({
        description: "Kon project details niet laden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [project.id, toast]);

  useEffect(() => {
    if (isOpen) {
      fetchProjectDetails();
    }
  }, [isOpen, project.id, fetchProjectDetails]);

  const handleRemoveDocument = async (documentId: string) => {
    setRemovingDocId(documentId);
    try {
      const response = await fetch(`/api/projects/${project.id}/documents`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentId }),
      });

      if (response.ok) {
        toast({
          description: "Document verwijderd uit project",
        });
        fetchProjectDetails();
        onUpdate();
      } else {
        throw new Error("Failed to remove document");
      }
    } catch (error) {
      console.error("Error removing document:", error);
      toast({
        description: "Kon document niet verwijderen",
        variant: "destructive",
      });
    } finally {
      setRemovingDocId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {project.name}
            </DialogTitle>
            <DialogDescription>
              {project.description || "Geen beschrijving"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{documents.length}</span>
                <span className="text-gray-600">documenten</span>
              </div>
              {project._count && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">
                    {project._count.assistants}
                  </span>
                  <span className="text-gray-600">assistants</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="mb-4">
              <Button
                onClick={() => setIsAddModalOpen(true)}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Documenten toevoegen
              </Button>
            </div>

            {/* Documents List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  Nog geen documenten in dit project
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.document.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-sm truncate">
                          {doc.document.name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {doc.document.type}
                        </Badge>
                        {doc.document.status === "COMPLETED" && (
                          <Badge
                            variant="default"
                            className="text-xs bg-green-100 text-green-800"
                          >
                            ✓
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{formatFileSize(doc.document.fileSize)}</span>
                        <span>•</span>
                        <span>Toegevoegd {formatDate(doc.addedAt)}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(doc.document.id)}
                      disabled={removingDocId === doc.document.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {removingDocId === doc.document.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AddDocumentsModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        projectId={project.id}
        existingDocumentIds={documents.map((d) => d.document.id)}
        onSuccess={() => {
          fetchProjectDetails();
          onUpdate();
        }}
      />
    </>
  );
}
