export interface FAQ {
  id: string;
  question: string;
  answer: string;
  enabled: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Website {
  id: string;
  url: string;
  name?: string;
  description?: string;
  pages: number;
  syncSpeed?: number;
  syncInterval: string;
  lastSync?: string;
  status: "PENDING" | "SYNCING" | "COMPLETED" | "ERROR";
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Webpage {
  id: string;
  path: string;
  fullUrl: string;
  status: number;
  size: string;
  downloadedAt: string;
  contentType: string;
}

export interface SyncLog {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  url?: string;
}
