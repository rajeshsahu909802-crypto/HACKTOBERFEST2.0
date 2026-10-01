export interface FAQItem {
  id: string;
  category: string;
  question: string;
  questionVariants: string[];
  answer: string;
  sourceDoc: string;
  sectionOrRule?: string;
  updatedAt: string;
  tags: string[];
}

export interface DocumentItem {
  id: string;
  title: string;
  type: 'notice' | 'handbook' | 'circular' | 'pdf';
  date: string;
  department: string;
  content: string;
  chunkCount: number;
}

export interface RAGChunk {
  id: string;
  docId: string;
  title: string;
  category: string;
  text: string;
  sourceDoc: string;
  vector?: number[];
  keywords: string[];
}

export interface UnansweredQuery {
  id: string;
  query: string;
  timestamp: string;
  categoryGuessed?: string;
  bestSimilarityScore: number;
  status: 'pending' | 'resolved' | 'dismissed';
  suggestedAnswer?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: {
    title: string;
    doc: string;
    similarity: number;
    snippet: string;
  }[];
  suggestedQuestions?: string[];
  isFallback?: boolean;
  cached?: boolean;
  latencyMs?: number;
  modelUsed?: string;
}

export interface ChatRequest {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  model?: 'gemma-4-31b-it' | 'gemma-4-26b-a4b-it' | 'gemini-3.8-flash';
}

export interface ChatResponse {
  answer: string;
  sources: {
    title: string;
    doc: string;
    similarity: number;
    snippet: string;
  }[];
  suggestedQuestions: string[];
  isFallback: boolean;
  cached: boolean;
  latencyMs: number;
  modelUsed: string;
}

export interface SystemStats {
  totalQueries: number;
  cachedQueries: number;
  cacheHitRate: number;
  avgLatencyMs: number;
  fallbackCount: number;
  fallbackRate: number;
  totalFaqs: number;
  totalDocuments: number;
  unansweredCount: number;
}
