"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  MoreVertical,
  FolderOpen,
  Edit,
  Trash2,
  FileText,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useTranslations } from "next-intl";
import { CreateProjectModal } from "./CreateProjectModal";
import { EditProjectModal } from "./EditProjectModal";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { ProjectDetailModal } from "./ProjectDetailModal";

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  documentCount: number;
  _count: {
    documents: number;
    assistants: number;
  };
}

export function ProjectsTab() {
  const t = useTranslations();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/projects");

      if (response.ok) {
        const result = await response.json();
        setProjects(result.data || []);
      } else {
        throw new Error("Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        description: "Kon projecten niet laden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setIsDetailModalOpen(true);
  };

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          description: "Project succesvol verwijderd",
        });
        fetchProjects();
      } else {
        throw new Error("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        description: "Kon project niet verwijderen",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Projecten laden...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">
            Groepeer documenten in projecten voor snellere en betere responses
          </p>
        </div>
        <Button onClick={handleCreateProject} className="gap-2">
          <Plus className="h-4 w-4" />
          Nieuw Project
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nog geen projecten
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Maak je eerste project aan om documenten te groeperen en de
            performance te verbeteren.
          </p>
          <Button onClick={handleCreateProject} className="gap-2">
            <Plus className="h-4 w-4" />
            Nieuw Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewDetails(project)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">
                    {project.name}
                  </h3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(project);
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Details bekijken
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProject(project);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Bewerken
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Verwijderen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {project.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {project.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{project._count.documents} documenten</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{project._count.assistants} assistants</span>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                Aangemaakt op {formatDate(project.createdAt)}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchProjects}
      />

      {selectedProject && (
        <>
          <EditProjectModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedProject(null);
            }}
            project={selectedProject}
            onSuccess={fetchProjects}
          />

          <ProjectDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedProject(null);
            }}
            project={selectedProject}
            onUpdate={fetchProjects}
          />
        </>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Project verwijderen"
        description={`Weet je zeker dat je het project "${projectToDelete?.name}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
