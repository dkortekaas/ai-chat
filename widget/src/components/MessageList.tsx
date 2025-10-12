import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import type { Message } from "../types";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  primaryColor: string;
}

export function MessageList({
  messages,
  isLoading,
  primaryColor,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="chatbot-messages">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          primaryColor={primaryColor}
        />
      ))}

      {isLoading && <TypingIndicator primaryColor={primaryColor} />}

      <div ref={messagesEndRef} />
    </div>
  );
}
