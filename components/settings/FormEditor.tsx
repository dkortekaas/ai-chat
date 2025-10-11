"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SaveButton from "@/components/ui/save-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Save, Trash2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useAssistant } from "@/contexts/assistant-context";
import { useToast } from "@/hooks/useToast";

export interface FormField {
  id: string;
  name: string;
  type: "text" | "email" | "phone" | "textarea" | "select";
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface ContactForm {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  enabled: boolean;
  redirectUrl?: string;
}

interface FormEditorProps {
  mode: "create" | "edit";
  initialForm?: ContactForm;
}

export function FormEditor({ mode, initialForm }: FormEditorProps) {
  const router = useRouter();
  const params = useParams();
  const { currentAssistant } = useAssistant();
  const { toast } = useToast();
  const [form, setForm] = useState<ContactForm>(
    initialForm ?? {
      id: Date.now().toString(),
      name: mode === "create" ? "New Form" : "Edit Form",
      description: "",
      fields: [],
      enabled: true,
      redirectUrl: "",
    }
  );

  useEffect(() => {
    if (mode === "edit" && !initialForm) {
      const id = params?.id as string | undefined;
      if (!id) return;
      (async () => {
        try {
          const res = await fetch(`/api/forms/${id}`);
          if (res.ok) {
            const data = await res.json();
            setForm(data);
          } else {
            toast({
              title: "Error",
              description: "Form niet gevonden",
              variant: "destructive",
            });
          }
        } catch (e) {
          console.error("Failed to load form", e);
          toast({
            title: "Error",
            description: "Laden mislukt",
            variant: "destructive",
          });
        }
      })();
    }
  }, [mode, initialForm, params, toast]);

  const handleAddField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      name: "New Field",
      type: "text",
      required: false,
      placeholder: "Enter value...",
    };
    setForm({
      ...form,
      fields: [...form.fields, newField],
    });
  };

  const handleRemoveField = (fieldId: string) => {
    setForm({
      ...form,
      fields: form.fields.filter((f) => f.id !== fieldId),
    });
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FormField>) => {
    setForm({
      ...form,
      fields: form.fields.map((f) =>
        f.id === fieldId ? { ...f, ...updates } : f
      ),
    });
  };

  const handleSave = async () => {
    if (!currentAssistant?.id) return;
    try {
      const normalizedRedirect =
        form.redirectUrl && form.redirectUrl.trim().length > 0
          ? form.redirectUrl.trim()
          : undefined;
      if (mode === "create") {
        await fetch("/api/forms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assistantId: currentAssistant.id,
            name: form.name,
            description: form.description,
            enabled: form.enabled,
            ...(normalizedRedirect ? { redirectUrl: normalizedRedirect } : {}),
            fields: form.fields,
          }),
        });
        toast({ title: "Aangemaakt", description: "Form is aangemaakt" });
      } else {
        await fetch(`/api/forms/${form.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            description: form.description,
            enabled: form.enabled,
            ...(normalizedRedirect !== undefined
              ? { redirectUrl: normalizedRedirect }
              : {}),
            fields: form.fields,
          }),
        });
        toast({ title: "Opgeslagen", description: "Form is bijgewerkt" });
      }
      router.push("/settings?tab=forms");
    } catch (e) {
      console.error("Failed to save form", e);
      toast({
        title: "Error",
        description: "Opslaan mislukt",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    router.push("/settings?tab=forms");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Create Form" : `Edit Form: ${form.name}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="form-name">Form Name</Label>
              <Input
                id="form-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="redirect-url">Redirect URL (optional)</Label>
              <Input
                id="redirect-url"
                value={form.redirectUrl || ""}
                onChange={(e) =>
                  setForm({ ...form, redirectUrl: e.target.value })
                }
                placeholder="https://example.com/thank-you"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-description">Description</Label>
            <Textarea
              id="form-description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe the purpose of this form"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Form Fields</h4>
              <Button onClick={handleAddField} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>

            <div className="space-y-3">
              {form.fields.map((field) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Field Name</Label>
                      <Input
                        value={field.name}
                        onChange={(e) =>
                          handleUpdateField(field.id, { name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Field Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value: FormField["type"]) =>
                          handleUpdateField(field.id, { type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="textarea">Textarea</SelectItem>
                          <SelectItem value="select">Select</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Placeholder</Label>
                      <Input
                        value={field.placeholder || ""}
                        onChange={(e) =>
                          handleUpdateField(field.id, {
                            placeholder: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={field.required}
                        onCheckedChange={(checked) =>
                          handleUpdateField(field.id, { required: checked })
                        }
                        className="data-[state=checked]:bg-indigo-500"
                      />
                      <Label>Required field</Label>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveField(field.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <SaveButton
              onClick={handleSave}
              icon={<Save className="w-4 h-4 mr-2" />}
            >
              {mode === "create" ? "Create Form" : "Save Form"}
            </SaveButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
