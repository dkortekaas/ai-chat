interface ToggleButtonProps {
  onClick: () => void;
  primaryColor: string;
  unreadCount?: number;
}

export function ToggleButton({
  onClick,
  primaryColor,
  unreadCount,
}: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className="chatbot-toggle-button"
      style={{ backgroundColor: primaryColor }}
      aria-label="Open chatbot"
    >
      {unreadCount && unreadCount > 0 ? (
        <span className="chatbot-unread-badge">{unreadCount}</span>
      ) : null}

      {/* Chat bubble icon */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
