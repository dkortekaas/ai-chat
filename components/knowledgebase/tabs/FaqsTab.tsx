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

export function FaqsTab() {
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
        throw new Error("Failed to fetch FAQs");
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load FAQs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentAssistant, toast]);

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
          title: "FAQ duplicated",
          description: "The FAQ has been duplicated successfully.",
        });
        fetchFAQs();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to duplicate FAQ");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to duplicate FAQ",
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
          title: "FAQ deleted",
          description: "The FAQ has been deleted successfully.",
        });
        fetchFAQs();
        setIsDeleteModalOpen(false);
        setFaqToDelete(null);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete FAQ");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete FAQ",
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
          title: "FAQ updated",
          description: `FAQ has been ${!faq.enabled ? "enabled" : "disabled"}.`,
        });
        fetchFAQs();
      } else {
        throw new Error("Failed to update FAQ");
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update FAQ",
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

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  if (!currentAssistant) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Assistant Selected
            </h3>
            <p className="text-sm text-gray-500">
              Please select an assistant from the dropdown above to manage FAQs.
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
          <h2 className="text-lg font-semibold text-gray-900">FAQs</h2>
          <p className="text-sm text-gray-500">
            Create and edit frequently asked questions to guide{" "}
            <strong>{currentAssistant.name}</strong>&apos;s responses.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            ↑ No changes
          </Button>
          <Button variant="outline" size="sm">
            ► Test
          </Button>
          <Button
            className="bg-indigo-500 hover:bg-indigo-600"
            onClick={handleAddFAQ}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add FAQ
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
                    Question
                    <ChevronUp className="w-4 h-4 ml-1" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enabled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
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
                    Loading FAQs...
                  </td>
                </tr>
              ) : faqs.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No FAQs added yet. Click &quot;Add FAQ&quot; to get started.
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
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicateFAQ(faq)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteFAQ(faq)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
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
        title="Delete FAQ"
        description="Are you sure you want to delete this FAQ? This action cannot be undone."
        itemName={faqToDelete?.question || ""}
        isLoading={isDeleting}
      />
    </div>
  );
}
