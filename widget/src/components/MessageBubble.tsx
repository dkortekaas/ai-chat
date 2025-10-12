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

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="chatbot-message-sources">
            <p className="chatbot-sources-label">Bronnen:</p>
            <ul className="chatbot-sources-list">
              {message.sources.map((source, idx) => (
                <li key={idx} className="chatbot-source-item">
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "underline" }}
                    >
                      {source.documentName}
                    </a>
                  ) : (
                    source.documentName
                  )}
                  <span
                    style={{
                      fontSize: "0.8em",
                      opacity: 0.7,
                      marginLeft: "8px",
                    }}
                  >
                    ({source.documentType})
                  </span>
                </li>
              ))}
            </ul>
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
