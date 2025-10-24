"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  MoreVertical,
  ChevronUp,
  Edit,
  Trash2,
  Copy,
  Bot,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FAQForm } from "@/components/knowledgebase/FaqForm";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { useToast } from "@/components/ui/use-toast";
import { useAssistant } from "@/contexts/assistant-context";
import { useTranslations } from "next-intl";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  enabled: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export function FaqsTab() {
  const t = useTranslations();
  const { currentAssistant } = useAssistant();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchFAQs = useCallback(async () => {
    if (!currentAssistant) return;

    try {
      const response = await fetch(
        `/api/faqs?assistantId=${currentAssistant.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setFaqs(data);
      } else {
        throw new Error(t("error.failedToFetchFAQs"));
      }
    } catch {
      toast({
        title: t("error.saveFailed"),
        description: t("error.failedToLoadFAQs"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentAssistant, toast, t]);

  // Fetch FAQs on component mount and when assistant changes
  useEffect(() => {
    if (currentAssistant) {
      fetchFAQs();
    }
  }, [currentAssistant, fetchFAQs]);

  const handleAddFAQ = () => {
    setEditingFAQ(null);
    setIsFormOpen(true);
  };

  const handleEditFAQ = (faq: FAQ) => {
    setEditingFAQ(faq);
    setIsFormOpen(true);
  };

  const handleDuplicateFAQ = async (faq: FAQ) => {
    try {
      const response = await fetch("/api/faqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: `${faq.question} (Copy)`,
          answer: faq.answer,
          enabled: faq.enabled,
          order: faq.order + 1,
        }),
      });

      if (response.ok) {
        toast({
          title: t("success.faqDuplicated"),
          description: t("success.faqDuplicatedSuccessfully"),
          variant: "success",
        });
        fetchFAQs();
      } else {
        const error = await response.json();
        throw new Error(error.error || t("error.failedToDuplicateFAQ"));
      }
    } catch (error) {
      toast({
        title: t("error.saveFailed"),
        description:
          error instanceof Error
            ? error.message
            : t("error.failedToDuplicateFAQ"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteFAQ = (faq: FAQ) => {
    setFaqToDelete(faq);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteFAQ = async () => {
    if (!faqToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/faqs/${faqToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: t("success.faqDeleted"),
          description: t("success.faqDeletedSuccessfully"),
          variant: "success",
        });
        fetchFAQs();
        setIsDeleteModalOpen(false);
        setFaqToDelete(null);
      } else {
        const error = await response.json();
        throw new Error(error.error || t("error.failedToDeleteFAQ"));
      }
    } catch (error) {
      toast({
        title: t("error.saveFailed"),
        description:
          error instanceof Error ? error.message : t("error.failedToDeleteFAQ"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteModalClose = () => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
      setFaqToDelete(null);
    }
  };

  const toggleEnabled = async (faq: FAQ) => {
    try {
      const response = await fetch(`/api/faqs/${faq.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: faq.question,
          answer: faq.answer,
          enabled: !faq.enabled,
          order: faq.order,
        }),
      });

      if (response.ok) {
        toast({
          title: t("success.faqUpdated"),
          description: t("success.faqUpdatedSuccessfully"),
          variant: "success",
        });
        fetchFAQs();
      } else {
        throw new Error(t("error.failedToUpdateFAQ"));
      }
    } catch {
      toast({
        title: t("error.saveFailed"),
        description: t("error.failedToUpdateFAQ"),
        variant: "destructive",
      });
    }
  };

  const handleFormSuccess = () => {
    fetchFAQs();
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingFAQ(null);
  };

  const formatModifiedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return t("knowledgebase.today");
    if (diffInDays === 1) return t("knowledgebase.yesterday");
    if (diffInDays < 7) return `${diffInDays} ${t("knowledgebase.daysAgo")}`;
    if (diffInDays < 30)
      return `${Math.floor(diffInDays / 7)} ${t("knowledgebase.weeksAgo")}`;
    if (diffInDays < 365)
      return `${Math.floor(diffInDays / 30)} ${t("knowledgebase.monthsAgo")}`;
    return `${Math.floor(diffInDays / 365)} ${t("knowledgebase.yearsAgo")}`;
  };

  if (!currentAssistant) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("knowledgebase.noAssistantSelected")}
            </h3>
            <p className="text-sm text-gray-500">
              {t("knowledgebase.noAssistantSelectedDescription")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {t("knowledgebase.faqs")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("knowledgebase.faqsDescription")}{" "}
            <strong>{currentAssistant.name}</strong>.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            ↑ {t("common.noChanges")}
          </Button>
          <Button variant="outline" size="sm">
            ► {t("common.test")}
          </Button>
          <Button
            className="bg-indigo-500 hover:bg-indigo-600"
            onClick={handleAddFAQ}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("common.add")}
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    {t("knowledgebase.question")}
                    <ChevronUp className="w-4 h-4 ml-1" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("knowledgebase.enabled")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("knowledgebase.modified")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {t("knowledgebase.loadingFAQs")}
                  </td>
                </tr>
              ) : faqs.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {t("knowledgebase.noFAQsAdded")}
                  </td>
                </tr>
              ) : (
                faqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-md">
                        {faq.question}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Switch
                        checked={faq.enabled}
                        onCheckedChange={() => toggleEnabled(faq)}
                        className="data-[state=checked]:bg-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatModifiedDate(faq.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditFAQ(faq)}>
                            <Edit className="w-4 h-4 mr-2" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicateFAQ(faq)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            {t("common.duplicate")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteFAQ(faq)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* FAQ Form Dialog */}
      <FAQForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        faq={editingFAQ}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={confirmDeleteFAQ}
        title={t("knowledgebase.deleteFAQ")}
        description={t("knowledgebase.deleteFAQDescription")}
        itemName={faqToDelete?.question || ""}
        isLoading={isDeleting}
      />
    </div>
  );
}
