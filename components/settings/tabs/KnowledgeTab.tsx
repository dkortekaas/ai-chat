"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  SaveButton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Info, FolderOpen, ExternalLink } from "lucide-react";
import { useAssistant } from "@/contexts/assistant-context";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface KnowledgeTabProps {
  onChanges: (hasChanges: boolean) => void;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  documentCount: number;
  _count: {
    documents: number;
    assistants: number;
  };
}

export function KnowledgeTab({ onChanges }: KnowledgeTabProps) {
  const { currentAssistant, refreshAssistants } = useAssistant();
  const { toast } = useToast();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects");
        if (response.ok) {
          const result = await response.json();
          setProjects(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  // Load current assistant's project
  useEffect(() => {
    if (currentAssistant) {
      setSelectedProjectId(currentAssistant.projectId || "");
      setHasChanges(false);
    }
  }, [currentAssistant]);

  const handleProjectChange = (value: string) => {
    setSelectedProjectId(value);
    setHasChanges(true);
    onChanges(true);
  };

  const handleSave = async () => {
    if (!currentAssistant) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/assistants/${currentAssistant.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: selectedProjectId || null,
        }),
      });

      if (response.ok) {
        toast({
          description: "Project instellingen opgeslagen",
        });
        setHasChanges(false);
        onChanges(false);
        await refreshAssistants();
      } else {
        throw new Error("Failed to save project settings");
      }
    } catch (error) {
      console.error("Error saving project settings:", error);
      toast({
        description: "Kon instellingen niet opslaan",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Koppeling</CardTitle>
          <CardDescription>
            Koppel een project aan deze assistant voor snellere en betere responses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Wat zijn Projects?</p>
              <p>
                Projects groeperen documenten voor betere performance. In plaats
                van bij elk bericht de hele knowledge base te doorzoeken, wordt
                de project context 1x per gesprek geladen en gecached. Dit
                resulteert in <strong>10-50x snellere responses</strong> en veel
                lagere database load.
              </p>
            </div>
          </div>

          {/* Project Selector */}
          <div className="space-y-2">
            <Label>Selecteer Project</Label>
            <Select value={selectedProjectId} onValueChange={handleProjectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Kies een project of gebruik legacy knowledge base" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  Geen project (gebruik legacy knowledge base)
                </SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      <span>{project.name}</span>
                      <span className="text-xs text-gray-500">
                        ({project._count.documents} docs)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Geen project selecteren betekent dat de oude methode wordt gebruikt
              (langzamer, meer database queries)
            </p>
          </div>

          {/* Selected Project Info */}
          {selectedProject && (
            <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">
                  {selectedProject.name}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/knowledgebase?tab=projects")}
                  className="gap-1 text-xs"
                >
                  Details bekijken
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
              {selectedProject.description && (
                <p className="text-sm text-gray-600">
                  {selectedProject.description}
                </p>
              )}
              <div className="flex gap-4 text-xs text-gray-500">
                <span>{selectedProject._count.documents} documenten</span>
                <span>•</span>
                <span>
                  {selectedProject._count.assistants} assistant(s) gebruiken dit
                  project
                </span>
              </div>
            </div>
          )}

          {/* Manage Projects Link */}
          {projects.length === 0 && (
            <div className="text-center p-6 border-2 border-dashed rounded-lg">
              <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-3">
                Je hebt nog geen projects aangemaakt
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/knowledgebase?tab=projects")}
                className="gap-2"
              >
                <FolderOpen className="h-4 w-4" />
                Naar Projects
              </Button>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <SaveButton
              onClick={handleSave}
              disabled={!hasChanges}
              isLoading={isSaving}
              hasChanges={hasChanges}
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance Voordelen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-semibold text-green-900 mb-1">
                10-50x Sneller
              </div>
              <div className="text-green-700 text-xs">
                Context wordt 1x per sessie geladen in plaats van per bericht
              </div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-semibold text-blue-900 mb-1">
                ~98% Minder Queries
              </div>
              <div className="text-blue-700 text-xs">
                Dramatisch lagere database load door caching
              </div>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="font-semibold text-purple-900 mb-1">
                Lagere Kosten
              </div>
              <div className="text-purple-700 text-xs">
                Minder OpenAI API calls door intelligente cache
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
