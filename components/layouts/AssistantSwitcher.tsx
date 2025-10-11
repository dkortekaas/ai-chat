"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, ChevronDown, Check, Plus, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAssistant } from "@/contexts/assistant-context";
import { useRouter } from "next/navigation";

export function AssistantSwitcher() {
  const { currentAssistant, assistants, setCurrentAssistant, isLoading } =
    useAssistant();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleAssistantSelect = (assistantId: string) => {
    const assistant = assistants.find((a) => a.id === assistantId);
    if (assistant) {
      setCurrentAssistant(assistant);
    }
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    router.push("/assistants/new");
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 animate-pulse">
        <Bot className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!currentAssistant) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleCreateNew}
        className="flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Create Assistant
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 min-w-0 max-w-xs"
        >
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: currentAssistant.primaryColor }}
          >
            <Bot className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="truncate">{currentAssistant.name}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
          AI Assistants
        </div>
        {assistants.map((assistant) => (
          <DropdownMenuItem
            key={assistant.id}
            onClick={() => handleAssistantSelect(assistant.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className="w-3 h-3 rounded-full flex items-center justify-center"
                style={{ backgroundColor: assistant.primaryColor }}
              >
                <Bot className="w-2 h-2 text-white" />
              </div>
              <span className="truncate">{assistant.name}</span>
            </div>
            {currentAssistant.id === assistant.id && (
              <Check className="w-4 h-4 text-indigo-500" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            router.push("/assistants");
            setIsOpen(false);
          }}
          className="cursor-pointer"
        >
          <Settings className="w-4 h-4 mr-2" />
          Manage Assistants
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCreateNew} className="cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          Create New Assistant
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
