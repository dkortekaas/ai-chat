"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send, X, Minimize2 } from "lucide-react";

interface ChatbotPreviewProps {
  fontFamily: string;
  assistantName: string;
  assistantSubtitle: string;
  selectedAvatar: string;
  primaryColor: string;
  secondaryColor: string;
  welcomeMessage: string;
  placeholderText: string;
}

export function ChatbotPreview({
  fontFamily,
  assistantName,
  assistantSubtitle,
  selectedAvatar,
  primaryColor,
  secondaryColor,
  welcomeMessage,
  placeholderText,
}: ChatbotPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Voorbeeld</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-4">
            Zo ziet je chatbot eruit op je website:
          </p>

          {/* Chatbot Widget Preview */}
          <div className="relative bg-white rounded-lg shadow-lg max-w-sm ml-auto">
            {/* Header */}
            <div className="bg-indigo-500 text-white p-3 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-blue-500 text-white text-xs">
                    <Bot className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">AI Assistant</span>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-blue-500"
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white hover:bg-blue-500"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="p-3 h-48 overflow-y-auto space-y-3">
              <div className="flex items-start space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-gray-200 text-xs">
                    <Bot className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-xs">
                  <p className="text-xs">
                    Hallo! Hoe kan ik je vandaag helpen?
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 justify-end">
                <div className="bg-indigo-500 text-white rounded-lg px-3 py-2 max-w-xs">
                  <p className="text-xs">
                    Ik heb een vraag over jullie product
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-gray-200 text-xs">
                    <Bot className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-xs">
                  <p className="text-xs">
                    Natuurlijk! Wat zou je graag willen weten?
                  </p>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-3 border-t">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Typ je vraag hier..."
                  className="text-xs h-8"
                  disabled
                />
                <Button
                  size="icon"
                  className="h-8 w-8 bg-indigo-500 hover:bg-blue-700"
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Floating Button Preview */}
          <div className="mt-4 flex justify-end">
            <Button
              size="icon"
              className="h-12 w-12 rounded-full bg-indigo-500 hover:bg-blue-700 shadow-lg"
            >
              <Bot className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
