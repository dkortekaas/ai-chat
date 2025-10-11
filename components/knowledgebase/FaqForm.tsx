"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Label,
  Textarea,
  Switch,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { useAssistant } from "@/contexts/assistant-context";
import { useTranslations } from "next-intl";
import { FAQ } from "@/types/knowledgebase";

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
  const t = useTranslations();
  const { toast } = useToast();

  const isEditing = !!faq;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentAssistant) {
      toast({
        title: t("common.error"),
        description: t("error.knowledgebase.noAssistantSelected"),
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
        throw new Error(error.error || t("knowledgebase.faq.failedToSaveFAQ"));
      }

      toast({
        title: isEditing
          ? t("knowledgebase.faq.updated")
          : t("knowledgebase.faq.added"),
        description: isEditing
          ? t("success.knowledgebase.updatedSuccessfully")
          : t("success.knowledgebase.addedSuccessfully"),
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error ? error.message : t("error.unknownError"),
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
          <DialogTitle>
            {isEditing
              ? t("knowledgebase.faq.edit")
              : t("knowledgebase.faq.add")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("knowledgebase.faq.updateInformation")
              : t("knowledgebase.faq.addInformation")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">
              {t("knowledgebase.faq.question")} *
            </Label>
            <Input
              id="question"
              placeholder={t("knowledgebase.faq.questionPlaceholder")}
              value={formData.question}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, question: e.target.value }))
              }
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">{t("knowledgebase.faq.answer")} *</Label>
            <Textarea
              id="answer"
              placeholder={t("knowledgebase.faq.answerPlaceholder")}
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
            <Label htmlFor="order">{t("knowledgebase.faq.order")}</Label>
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
              {t("knowledgebase.faq.orderDescription")}
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
            <Label htmlFor="enabled">{t("common.enabled")}</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-500 text-white hover:bg-indigo-600"
            >
              {isLoading
                ? t("common.saving")
                : isEditing
                  ? t("common.update")
                  : t("common.add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
