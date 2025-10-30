import type { Message } from "../types";
import { formatTime } from "../utils/helpers";

interface MessageBubbleProps {
  message: Message;
  primaryColor: string;
}

export function MessageBubble({ message, primaryColor }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`chatbot-message ${isUser ? "chatbot-message-user" : "chatbot-message-assistant"}`}
    >
      <div
        className="chatbot-message-bubble"
        style={isUser ? { backgroundColor: primaryColor } : {}}
      >
        <p className="chatbot-message-content">{message.content}</p>

        {/* Relevant URL */}
        {message.relevantUrl && (
          <div className="chatbot-message-link" style={{ marginTop: "8px" }}>
            <a
              href={message.relevantUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: primaryColor,
                textDecoration: "none",
                fontSize: "0.9em",
                fontWeight: 500,
              }}
            >
              → Lees meer
            </a>
          </div>
        )}
      </div>

      {/* Timestamp */}
      <span className="chatbot-message-time">
        {formatTime(message.timestamp)}
      </span>
    </div>
  );
}
