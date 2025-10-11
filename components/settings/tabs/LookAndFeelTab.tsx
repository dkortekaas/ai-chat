"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SaveButton from "@/components/ui/save-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info } from "lucide-react";
import { useAssistant } from "@/contexts/assistant-context";
import { useToast } from "@/hooks/useToast";
import { ChatbotPreview } from "@/components/assistant/ChatbotPreview";

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

const avatarOptions = [
  { id: "chat-bubble", icon: "💬", name: "Chat Bubble" },
  { id: "robot", icon: "🤖", name: "Robot" },
  { id: "assistant", icon: "👤", name: "Assistant" },
  { id: "support", icon: "🎧", name: "Support" },
  { id: "help", icon: "❓", name: "Help" },
];

export function LookAndFeelTab({ onChanges }: LookAndFeelTabProps) {
  const { currentAssistant, refreshAssistants } = useAssistant();
  const { toast } = useToast();

  const [fontFamily, setFontFamily] = useState("Inter");
  const [assistantName, setAssistantName] = useState("PS in foodservice");
  const [assistantSubtitle, setAssistantSubtitle] = useState(
    "We helpen je graag verder!"
  );
  const [selectedAvatar, setSelectedAvatar] = useState("chat-bubble");
  const [isLoading, setIsLoading] = useState(false);

  // Load data from current assistant
  useEffect(() => {
    if (currentAssistant) {
      setFontFamily("Inter"); // Default font family
      setAssistantName(currentAssistant.name || "PS in foodservice");
      setAssistantSubtitle("We helpen je graag verder!"); // Default subtitle
      setSelectedAvatar("chat-bubble"); // Default avatar
    }
  }, [currentAssistant]);

  const handleSave = async (section: string) => {
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
          title: "Success",
          description: `${section} settings saved successfully`,
        });
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
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
              <span>Font Family</span>
              <Info className="w-4 h-4 text-gray-400" />
            </CardTitle>
            <CardDescription>
              It will be applied for all the fonts used in the assistant.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="font-family">Font Family</Label>
              <Select
                value={fontFamily}
                onValueChange={(value) => {
                  setFontFamily(value);
                  onChanges(true);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select font family">
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
              <Label>Preview</Label>
              <div
                className="p-3 border rounded-lg bg-gray-50"
                style={{ fontFamily: `"${fontFamily}", sans-serif` }}
              >
                <p className="text-sm font-medium">Assistant Name</p>
                <p className="text-xs text-gray-600">
                  This is how your text will look with {fontFamily} font.
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
              <span>Assistant Name & Subtitle</span>
              <Info className="w-4 h-4 text-gray-400" />
            </CardTitle>
            <CardDescription>
              Set a display name and subtitle for your assistant.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assistant-name">Name</Label>
                <Input
                  id="assistant-name"
                  value={assistantName}
                  onChange={(e) => {
                    setAssistantName(e.target.value);
                    onChanges(true);
                  }}
                  placeholder="Enter assistant name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assistant-subtitle">Subtitle</Label>
                <Input
                  id="assistant-subtitle"
                  value={assistantSubtitle}
                  onChange={(e) => {
                    setAssistantSubtitle(e.target.value);
                    onChanges(true);
                  }}
                  placeholder="Enter assistant subtitle"
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
              <span>Avatar & Assistant Icons</span>
              <Info className="w-4 h-4 text-gray-400" />
            </CardTitle>
            <CardDescription>
              Select an avatar and a chat icon for your assistant, so they can
              nicely present your brand.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Avatar (displayed inside the chat window)</Label>
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
            currentAssistant?.welcomeMessage || "Hallo! Hoe kan ik je helpen?"
          }
          placeholderText={
            currentAssistant?.placeholderText || "Stel een vraag..."
          }
        />
      </div>
    </div>
  );
}
