"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

interface FAQ {
  id: string;
  question: string;
  answer: string;
  enabled: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface FAQFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  faq?: FAQ | null;
}

export function FAQForm({ isOpen, onClose, onSuccess, faq }: FAQFormProps) {
  const { currentAssistant } = useAssistant();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    question: faq?.question || "",
    answer: faq?.answer || "",
    enabled: faq?.enabled ?? true,
    order: faq?.order || 0,
  });
  const { toast } = useToast();

  const isEditing = !!faq;

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

    setIsLoading(true);

    try {
      const url = isEditing ? `/api/faqs/${faq.id}` : "/api/faqs";
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
        const error = await response.json();
        throw new Error(error.error || "Failed to save FAQ");
      }

      toast({
        title: isEditing ? "FAQ updated" : "FAQ added",
        description: isEditing
          ? "The FAQ has been updated successfully."
          : "The FAQ has been added successfully.",
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
        question: faq?.question || "",
        answer: faq?.answer || "",
        enabled: faq?.enabled ?? true,
        order: faq?.order || 0,
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the FAQ information below."
              : "Add a new frequently asked question and answer."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question *</Label>
            <Input
              id="question"
              placeholder="Enter the question"
              value={formData.question}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, question: e.target.value }))
              }
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Answer *</Label>
            <Textarea
              id="answer"
              placeholder="Enter the answer"
              value={formData.answer}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, answer: e.target.value }))
              }
              required
              disabled={isLoading}
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              type="number"
              placeholder="0"
              value={formData.order}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  order: parseInt(e.target.value) || 0,
                }))
              }
              disabled={isLoading}
              min="0"
            />
            <p className="text-sm text-gray-500">
              Lower numbers appear first in the list
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, enabled: checked }))
              }
              disabled={isLoading}
              className="data-[state=checked]:bg-indigo-500"
            />
            <Label htmlFor="enabled">Enabled</Label>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
