"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  SaveButton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Info } from "lucide-react";
import { useAssistant } from "@/contexts/assistant-context";
import { useToast } from "@/hooks/useToast";
import { ChatbotPreview } from "@/components/assistant/ChatbotPreview";
import { useTranslations } from "next-intl";

interface LookAndFeelTabProps {
  onChanges: (hasChanges: boolean) => void;
}

const fontOptions = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Source Sans Pro",
  "Nunito",
];

export function LookAndFeelTab({ onChanges }: LookAndFeelTabProps) {
  const { currentAssistant, refreshAssistants } = useAssistant();
  const { toast } = useToast();
  const t = useTranslations();

  const [fontFamily, setFontFamily] = useState("Inter");
  const [assistantName, setAssistantName] = useState(
    t("settings.assistantName")
  );
  const [assistantSubtitle, setAssistantSubtitle] = useState(
    t("settings.assistantSubtitle")
  );
  const [selectedAvatar, setSelectedAvatar] = useState("chat-bubble");
  const [isLoading, setIsLoading] = useState(false);

  const avatarOptions = [
    { id: "chat-bubble", icon: "💬", name: t("settings.chatBubble") },
    { id: "robot", icon: "🤖", name: t("settings.robot") },
    { id: "assistant", icon: "👤", name: t("settings.assistant") },
    { id: "support", icon: "🎧", name: t("settings.support") },
    { id: "help", icon: "❓", name: t("settings.help") },
  ];

  // Load data from current assistant
  useEffect(() => {
    if (currentAssistant) {
      setFontFamily("Inter"); // Default font family
      setAssistantName(currentAssistant.name || t("settings.assistantName"));
      setAssistantSubtitle(t("settings.assistantSubtitle")); // Default subtitle
      setSelectedAvatar("chat-bubble"); // Default avatar
    }
  }, [currentAssistant]);

  const handleSave = async (section: string) => {
    if (!currentAssistant) {
      toast({
        title: t("settings.error"),
        description: t("settings.noAssistantSelected"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/assistants/${currentAssistant.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...currentAssistant,
          fontFamily,
          assistantName,
          assistantSubtitle,
          selectedAvatar,
        }),
      });

      if (response.ok) {
        await refreshAssistants();
        onChanges(false);
        toast({
          title: t("settings.success"),
          description: `${section} ${t("settings.settingsSavedSuccessfully")}`,
        });
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: t("settings.error"),
        description: t("settings.failedToSaveSettings"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Settings Column */}
      <div className="space-y-6">
        {/* Font Family Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>{t("settings.fontFamily")}</span>
              <Info className="w-4 h-4 text-gray-400" />
            </CardTitle>
            <CardDescription>
              {t("settings.fontFamilyDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="font-family">{t("settings.fontFamily")}</Label>
              <Select
                value={fontFamily}
                onValueChange={(value) => {
                  setFontFamily(value);
                  onChanges(true);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.selectFontFamily")}>
                    <span style={{ fontFamily: `"${fontFamily}", sans-serif` }}>
                      {fontFamily}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font} value={font}>
                      <div className="flex items-center space-x-2">
                        <span style={{ fontFamily: `"${font}", sans-serif` }}>
                          {font}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font Preview */}
            <div className="space-y-2">
              <Label>{t("settings.preview")}</Label>
              <div
                className="p-3 border rounded-lg bg-gray-50"
                style={{ fontFamily: `"${fontFamily}", sans-serif` }}
              >
                <p className="text-sm font-medium">
                  {t("settings.assistantName")}
                </p>
                <p className="text-xs text-gray-600">
                  {t("settings.fontPreviewDescription", { fontFamily })}
                </p>
              </div>
            </div>

            <SaveButton
              onClick={() => handleSave("font")}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Assistant Name & Subtitle Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>{t("settings.assistantNameAndSubtitle")}</span>
              <Info className="w-4 h-4 text-gray-400" />
            </CardTitle>
            <CardDescription>
              {t("settings.assistantNameAndSubtitleDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assistant-name">{t("settings.name")}</Label>
                <Input
                  id="assistant-name"
                  value={assistantName}
                  onChange={(e) => {
                    setAssistantName(e.target.value);
                    onChanges(true);
                  }}
                  placeholder={t("settings.enterAssistantName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assistant-subtitle">
                  {t("settings.subtitle")}
                </Label>
                <Input
                  id="assistant-subtitle"
                  value={assistantSubtitle}
                  onChange={(e) => {
                    setAssistantSubtitle(e.target.value);
                    onChanges(true);
                  }}
                  placeholder={t("settings.enterAssistantSubtitle")}
                />
              </div>
            </div>
            <SaveButton
              onClick={() => handleSave("name-subtitle")}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Avatar & Assistant Icons Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>{t("settings.avatarAndAssistantIcons")}</span>
              <Info className="w-4 h-4 text-gray-400" />
            </CardTitle>
            <CardDescription>
              {t("settings.avatarAndAssistantIconsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("settings.avatar")}</Label>
              <div className="flex space-x-3">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => {
                      setSelectedAvatar(avatar.id);
                      onChanges(true);
                    }}
                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl transition-colors ${
                      selectedAvatar === avatar.id
                        ? "border-indigo-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {avatar.icon}
                  </button>
                ))}
              </div>
            </div>
            <SaveButton
              onClick={() => handleSave("avatar")}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Preview Column */}
      <div className="space-y-6">
        <ChatbotPreview
          fontFamily={fontFamily}
          assistantName={assistantName}
          assistantSubtitle={assistantSubtitle}
          selectedAvatar={selectedAvatar}
          primaryColor={currentAssistant?.primaryColor || "#3B82F6"}
          secondaryColor={currentAssistant?.secondaryColor || "#1E40AF"}
          welcomeMessage={
            currentAssistant?.welcomeMessage || t("settings.welcomeMessage")
          }
          placeholderText={
            currentAssistant?.placeholderText || t("settings.placeholderText")
          }
        />
      </div>
    </div>
  );
}
