"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSuccess: () => void;
}

export function EditProjectModal({
  isOpen,
  onClose,
  project,
  onSuccess,
}: EditProjectModalProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setName(project.name);
    setDescription(project.description || "");
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        description: "Project naam is verplicht",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      if (response.ok) {
        toast({
          description: "Project succesvol bijgewerkt",
        });
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        description: "Kon project niet bijwerken",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project Bewerken</DialogTitle>
          <DialogDescription>
            Pas de naam en beschrijving van het project aan
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Project naam *</Label>
              <Input
                id="edit-name"
                placeholder="Bijv. Product Documentatie"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Beschrijving</Label>
              <Textarea
                id="edit-description"
                placeholder="Optionele beschrijving van dit project"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                maxLength={500}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuleren
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Opslaan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
