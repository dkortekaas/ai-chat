interface TypingIndicatorProps {
  primaryColor: string;
}

export function TypingIndicator({ primaryColor }: TypingIndicatorProps) {
  return (
    <div className="chatbot-typing-indicator">
      <div className="chatbot-typing-dots">
        <span style={{ backgroundColor: primaryColor }} />
        <span style={{ backgroundColor: primaryColor }} />
        <span style={{ backgroundColor: primaryColor }} />
      </div>
    </div>
  );
}
