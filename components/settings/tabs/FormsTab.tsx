"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { useAssistant } from "@/contexts/assistant-context";
import { useToast } from "@/hooks/useToast";

interface FormsTabProps {
  onChanges: (hasChanges: boolean) => void;
}

interface ContactForm {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  enabled: boolean;
  redirectUrl?: string;
}

interface FormField {
  id: string;
  name: string;
  type: "text" | "email" | "phone" | "textarea" | "select";
  required: boolean;
  placeholder?: string;
  options?: string[];
}

// Loaded from API

export function FormsTab({ onChanges }: FormsTabProps) {
  const router = useRouter();
  const { currentAssistant } = useAssistant();
  const { toast } = useToast();
  const [forms, setForms] = useState<ContactForm[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<ContactForm | null>(null);
  // const [isLoading, setIsLoading] = useState(false)

  const fetchForms = async () => {
    if (!currentAssistant?.id) return;
    try {
      // setIsLoading(true)
      const res = await fetch(`/api/forms?assistantId=${currentAssistant.id}`);
      if (res.ok) {
        const data = await res.json();
        setForms(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load forms",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("Failed to fetch forms", e);
      toast({
        title: "Error",
        description: "Failed to load forms",
        variant: "destructive",
      });
    } finally {
      // setIsLoading(false)
    }
  };

  useEffect(() => {
    fetchForms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAssistant?.id]);

  const handleToggleForm = async (id: string) => {
    const target = forms.find((f) => f.id === id);
    if (!target) return;
    const updated = { ...target, enabled: !target.enabled };
    setForms(forms.map((f) => (f.id === id ? updated : f)));
    try {
      await fetch(`/api/forms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: updated.enabled }),
      });
      onChanges(true);
      toast({ title: "Saved", description: "Form updated" });
    } catch (e) {
      console.error("Failed to toggle form", e);
      // revert
      setForms(forms);
      toast({
        title: "Error",
        description: "Failed to update form",
        variant: "destructive",
      });
    }
  };

  const handleDeleteForm = (form: ContactForm) => {
    setFormToDelete(form);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!formToDelete) return;
    try {
      await fetch(`/api/forms/${formToDelete.id}`, { method: "DELETE" });
      setForms(forms.filter((form) => form.id !== formToDelete.id));
      onChanges(true);
      toast({ title: "Deleted", description: "Form verwijderd" });
    } catch (e) {
      console.error("Failed to delete form", e);
      toast({
        title: "Error",
        description: "Verwijderen mislukt",
        variant: "destructive",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setFormToDelete(null);
    }
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setFormToDelete(null);
  };

  const handleEditForm = (form: ContactForm) => {
    router.push(`/settings/forms/${form.id}/edit`);
  };

  // Inline editor handlers removed; editing happens on dedicated pages

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Contact Forms</h3>
          <p className="text-sm text-gray-600">
            Configure contact forms and data collection
          </p>
        </div>
        <Button
          onClick={() => router.push("/settings/forms/new")}
          className="bg-indigo-500 hover:bg-indigo-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Form
        </Button>
      </div>

      {/* Forms List */}
      <div className="grid gap-4">
        {forms.map((form) => (
          <Card key={form.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{form.name}</CardTitle>
                  <CardDescription>{form.description}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={form.enabled}
                    onCheckedChange={() => handleToggleForm(form.id)}
                    className="data-[state=checked]:bg-indigo-500"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditForm(form)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteForm(form)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">
                  Form Fields:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {form.fields.map((field) => (
                    <span
                      key={field.id}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                    >
                      {field.name} ({field.type})
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Editor moved to dedicated pages */}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleConfirmDelete}
        title="Delete Form"
        description="Are you sure you want to delete this form? This action cannot be undone and will remove all form data and configurations."
        itemName={formToDelete?.name || ""}
        isLoading={false}
      />
    </div>
  );
}
