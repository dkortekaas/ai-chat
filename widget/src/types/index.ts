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
  position: "bottom-right" | "bottom-left";
  showBranding: boolean;
  actionButtons?: ActionButton[];
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Source[];
}

export interface Source {
  documentName: string;
  documentType: string;
  relevanceScore: number;
  url?: string;
}

export interface ChatResponse {
  success: boolean;
  data: {
    conversationId: string;
    answer: string;
    sources: Source[];
    responseTime: number;
    sessionId: string;
  };
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}
