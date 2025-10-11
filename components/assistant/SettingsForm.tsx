"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ColorPicker } from "@/components/assistant/ColorPicker";
import { useToast } from "@/hooks/useToast";

const settingsSchema = z.object({
  name: z.string().min(1, "Naam is verplicht"),
  welcomeMessage: z.string().min(1, "Welkomstbericht is verplicht"),
  placeholderText: z.string().min(1, "Placeholder is verplicht"),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Ongeldige kleur"),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Ongeldige kleur"),
  tone: z.enum(["professional", "friendly", "casual"]),
  temperature: z.number().min(0).max(1),
  maxResponseLength: z.number().min(100).max(2000),
  fallbackMessage: z.string().min(1),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export function SettingsForm({
  initialData,
}: {
  initialData: SettingsFormData;
}) {
  const { toast } = useToast();
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: SettingsFormData) => {
    try {
      const response = await fetch("/api/chatbot/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save");

      toast({
        title: "Success",
        description: "Instellingen opgeslagen",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Opslaan mislukt",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basis instellingen */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basis instellingen</h3>

        <div>
          <label className="text-sm font-medium">Bot naam</label>
          <Input {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Welkomstbericht</label>
          <Textarea {...form.register("welcomeMessage")} rows={3} />
        </div>

        <div>
          <label className="text-sm font-medium">Placeholder tekst</label>
          <Input {...form.register("placeholderText")} />
        </div>
      </div>

      {/* Kleuren */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Kleuren</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Primaire kleur</label>
            <ColorPicker
              color={form.watch("primaryColor")}
              onChange={(color) => form.setValue("primaryColor", color)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Secundaire kleur</label>
            <ColorPicker
              color={form.watch("secondaryColor")}
              onChange={(color) => form.setValue("secondaryColor", color)}
            />
          </div>
        </div>
      </div>

      {/* Gedrag */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Gedrag</h3>

        <div>
          <label className="text-sm font-medium">Toon</label>
          <Select {...form.register("tone")}>
            <option value="professional">Professioneel</option>
            <option value="friendly">Vriendelijk</option>
            <option value="casual">Casual</option>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">
            Temperature ({form.watch("temperature")})
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            {...form.register("temperature", { valueAsNumber: true })}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Lagere waarde = meer deterministisch, hogere waarde = meer creatief
          </p>
        </div>

        <div>
          <label className="text-sm font-medium">
            Max response lengte ({form.watch("maxResponseLength")})
          </label>
          <input
            type="range"
            min="100"
            max="2000"
            step="50"
            {...form.register("maxResponseLength", { valueAsNumber: true })}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum aantal karakters in een antwoord
          </p>
        </div>

        <div>
          <label className="text-sm font-medium">Fallback bericht</label>
          <Textarea
            {...form.register("fallbackMessage")}
            rows={2}
            placeholder="Bericht wanneer de bot geen antwoord kan geven"
          />
        </div>
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Opslaan..." : "Instellingen opslaan"}
      </Button>
    </form>
  );
}
