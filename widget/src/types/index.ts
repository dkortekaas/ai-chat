export interface ActionButton {
  id: string;
  buttonText: string;
  question: string;
  priority: number;
}

export interface WidgetConfig {
  apiKey: string;
  apiUrl: string;
  name: string;
  welcomeMessage: string;
  placeholderText: string;
  primaryColor: string;
  secondaryColor: string;
  avatar?: string;
  fontFamily?: string;
  position: "bottom-right" | "bottom-left";
  showBranding: boolean;
  actionButtons?: ActionButton[];
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  relevantUrl?: string;
}

export interface ChatResponse {
  success: boolean;
  data: {
    conversationId: string;
    answer: string;
    relevantUrl?: string;
    responseTime: number;
    sessionId: string;
  };
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}
