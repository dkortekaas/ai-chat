"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import SaveButton from "@/components/ui/save-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/useToast";
import { useAssistant } from "@/contexts/assistant-context";

interface Website {
  id: string;
  url: string;
  name?: string;
  description?: string;
  pages: number;
  syncSpeed?: number;
  syncInterval: string;
  lastSync?: string;
  status: "PENDING" | "SYNCING" | "COMPLETED" | "ERROR";
  errorMessage?: string;
}

interface WebsiteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  website?: Website | null;
}

export function WebsiteForm({
  isOpen,
  onClose,
  onSuccess,
  website,
}: WebsiteFormProps) {
  const { currentAssistant } = useAssistant();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    url: website?.url || "",
    name: website?.name || "",
    description: website?.description || "",
    syncInterval: website?.syncInterval || "never",
  });
  const { toast } = useToast();

  const isEditing = !!website;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentAssistant) {
      toast({
        title: "Error",
        description: "No assistant selected",
        variant: "destructive",
      });
      return;
    }

    // Normalize URL for comparison (lowercase, remove trailing slash)
    const normalizeUrl = (u: string) =>
      u.trim().toLowerCase().replace(/\/$/, "");
    const normalizedInputUrl = normalizeUrl(formData.url);

    // Preflight duplicate check against existing websites for this assistant
    try {
      const existingResp = await fetch(
        `/api/websites?assistantId=${currentAssistant.id}`
      );
      if (existingResp.ok) {
        const existingList: Array<{ url: string }> = await existingResp.json();
        const alreadyExists = existingList.some(
          (w) => normalizeUrl(w.url) === normalizedInputUrl
        );
        if (alreadyExists) {
          toast({
            title: "URL bestaat al",
            description:
              "Deze website URL is al toegevoegd voor deze assistant. Kies een andere URL of bewerk de bestaande.",
            variant: "destructive",
          });
          return;
        }
      }
    } catch {
      // If the preflight check fails, continue to submit; server will still validate
    }

    setIsLoading(true);

    try {
      const url = isEditing ? `/api/websites/${website.id}` : "/api/websites";
      const method = isEditing ? "PUT" : "POST";

      const requestData = isEditing
        ? formData
        : { ...formData, assistantId: currentAssistant.id };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        let errorData: { error?: string; message?: string } | null = null;
        try {
          errorData = (await response.json()) as {
            error?: string;
            message?: string;
          };
        } catch {
          // ignore parse errors
        }

        // Handle duplicate URL explicitly with toast
        if (response.status === 409) {
          toast({
            title: "URL bestaat al",
            description:
              "Deze website URL is al toegevoegd voor deze assistant. Kies een andere URL of bewerk de bestaande.",
            variant: "destructive",
          });
          return;
        }

        // Fallback for server 500 with unique constraint (no structured code)
        if (
          response.status === 500 &&
          errorData &&
          typeof errorData.error === "string" &&
          errorData.error.toLowerCase().includes("failed to create website")
        ) {
          toast({
            title: "Fout bij opslaan",
            description:
              "Deze website URL lijkt al te bestaan. Kies een andere URL of bewerk de bestaande.",
            variant: "destructive",
          });
          return;
        }

        // Generic error toast
        toast({
          title: "Fout bij opslaan",
          description:
            (errorData && (errorData.error || errorData.message)) ||
            "Er is iets misgegaan bij het opslaan.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: isEditing ? "Website updated" : "Website added",
        description: isEditing
          ? "The website has been updated successfully."
          : "The website has been added successfully.",
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        url: website?.url || "",
        name: website?.name || "",
        description: website?.description || "",
        syncInterval: website?.syncInterval || "never",
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Website" : "Add Website"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the website information below."
              : "Add a new website URL to your knowledge base."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, url: e.target.value }))
              }
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name (optional)</Label>
            <Input
              id="name"
              placeholder="Website name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the website"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="syncInterval">Sync Interval</Label>
            <Select
              value={formData.syncInterval}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, syncInterval: value }))
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sync interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <SaveButton type="submit" isLoading={isLoading}>
              {isEditing ? "Update" : "Add"}
            </SaveButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
