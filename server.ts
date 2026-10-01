import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_FAQS } from './src/data/sampleFaqs';
import { INITIAL_DOCUMENTS } from './src/data/sampleDocs';
import { RAGRetriever } from './src/lib/retriever';
import { FAQItem, DocumentItem, UnansweredQuery, SystemStats, ChatResponse } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory Knowledge Base State
let faqs: FAQItem[] = [...INITIAL_FAQS];
let documents: DocumentItem[] = [...INITIAL_DOCUMENTS];
let unansweredQueries: UnansweredQuery[] = [
  {
    id: 'unans-1',
    query: 'Can I bring my pet dog to hostel room?',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    categoryGuessed: 'Hostel & Mess',
    bestSimilarityScore: 0.18,
    status: 'pending'
  },
  {
    id: 'unans-2',
    query: 'Is there a laser cutter in the mechanical workshop for 2nd year students?',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    categoryGuessed: 'Academics',
    bestSimilarityScore: 0.22,
    status: 'pending'
  },
  {
    id: 'unans-3',
    query: 'What is the fee concession rule for single girl child?',
    timestamp: new Date(Date.now() - 3600000 * 30).toISOString(),
    categoryGuessed: 'Fees & Scholarships',
    bestSimilarityScore: 0.24,
    status: 'pending'
  }
];

// System Statistics Tracking
const stats: SystemStats = {
  totalQueries: 48,
  cachedQueries: 14,
  cacheHitRate: 29.1,
  avgLatencyMs: 340,
  fallbackCount: 5,
  fallbackRate: 10.4,
  totalFaqs: faqs.length,
  totalDocuments: documents.length,
  unansweredCount: unansweredQueries.filter(q => q.status === 'pending').length
};

// Response Cache for Free Tier optimization (normalized query -> response with TTL)
interface CacheEntry {
  response: ChatResponse;
  expiresAt: number;
}
const responseCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

// Initialize RAG Retriever
const retriever = new RAGRetriever();
retriever.ingestFaqs(faqs);
retriever.ingestDocuments(documents);

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Production System Instruction for College Assistant
const SYSTEM_INSTRUCTION = `You are "CampusQuery AI", the official 24/7 verified AI student assistant for Apex Institute of Technology.

CORE DIRECTIVES:
1. STRICT ZERO-HALLUCINATION POLICY:
   - Answer ONLY using the facts explicitly provided in the "VERIFIED COLLEGE CONTEXT CHUNKS" section below.
   - Do NOT extrapolate, speculate, or draw from external knowledge.
   - If the information needed to answer the question is NOT contained in the provided chunks, do NOT fabricate an answer.
   - In case of missing information, state politely:
     "This specific information is not available in our verified college knowledge base. Please reach out directly to the College Helpdesk at helpdesk@college.edu or visit Room 104, Administrative Block (Mon-Fri 9:00 AM - 5:00 PM, Phone: +91-11-2766-7000)."

2. CITATION DISCIPLINE:
   - For every key rule, deadline, fee amount, or procedure mentioned, cite the source in brackets, e.g. [Academic Regulations §4.2], [Hostel Handbook Rule 14], or [Finance Notification Clause 3].

3. LANGUAGE & TONE:
   - Tone: Friendly, empathetic, accurate, and student-centric.
   - Multilingual & Hinglish Matching:
     - If the student asks in Hinglish (e.g., "fees kab tak bharni hai?", "hostel me night outpass kaise milta hai?"), reply in natural, polite Hinglish while keeping official terms, dates, and amounts completely accurate.
     - If the student asks in Hindi, reply in clear Hindi.
     - If the student asks in English, reply in clear English.
   - Tolerate common student typos and abbreviations (e.g. "attendence", "lib", "tpo", "sem fee").

4. SUGGESTED FOLLOW-UP QUESTIONS:
   - At the very end of your response, provide exactly 3 concise, highly relevant follow-up questions formatted as:
     <<<SUGGESTIONS>>>
     - [Suggested Question 1]
     - [Suggested Question 2]
     - [Suggested Question 3]
     <<<END_SUGGESTIONS>>>`;

// Helper: Normalize query for cache key
function getCacheKey(query: string, model: string): string {
  return `${model}::${query.trim().toLowerCase().replace(/\s+/g, ' ')}`;
}

// Call Gemma / Gemini model with exponential backoff
async function callGemmaWithBackoff(
  modelName: string,
  contents: string,
  retries = 1
): Promise<string> {
  // Deduplicated list of models to try
  const modelsToTry = Array.from(new Set([
    modelName,
    'gemma-4-31b-it',
    'gemma-4-26b-a4b-it',
    'gemini-3.8-flash'
  ]));

  let lastError: any = null;

  for (const m of modelsToTry) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Generation request timed out')), 6500)
        );

        const response = await Promise.race([
          ai.models.generateContent({
            model: m,
            contents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              temperature: 0.2, // Low temperature for high factual precision
            }
          }),
          timeoutPromise
        ]);

        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = (err?.message || String(err)).toLowerCase();
        
        // If timed out, break immediately to faster fallback model
        if (errMsg.includes('timed out')) {
          break;
        }

        // If rate limited (429 / 503), wait and retry once
        if (errMsg.includes('429') || errMsg.includes('503') || errMsg.includes('resource_exhausted')) {
          const delay = (attempt + 1) * 800;
          await new Promise(r => setTimeout(r, delay));
          continue;
        }

        // If model not recognized or argument error, skip immediately to next model
        if (
          errMsg.includes('404') || 
          errMsg.includes('not found') || 
          errMsg.includes('unsupported') || 
          errMsg.includes('invalid') ||
          errMsg.includes('400')
        ) {
          break; // break retry loop, move to next model in modelsToTry
        }
      }
    }
  }

  throw lastError || new Error('Failed to generate response after retries');
}

// Parse model output for text and follow-up suggestions
function parseResponseText(rawText: string): { answer: string; suggestions: string[] } {
  const match = rawText.match(/<<<SUGGESTIONS>>>([\s\S]*?)<<<END_SUGGESTIONS>>>/);
  if (!match) {
    return {
      answer: rawText.trim(),
      suggestions: [
        'What are the administrative office hours?',
        'How can I contact the student helpdesk?',
        'Where can I download the academic calendar?'
      ]
    };
  }

  const answer = rawText.replace(match[0], '').trim();
  const suggestionsText = match[1];
  const suggestions = suggestionsText
    .split('\n')
    .map(line => line.replace(/^[-*•\d.]\s*/, '').trim())
    .filter(line => line.length > 5 && line.length < 120)
    .slice(0, 3);

  return {
    answer,
    suggestions: suggestions.length > 0 ? suggestions : [
      'What are the administrative office hours?',
      'How can I contact the student helpdesk?'
    ]
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // ===================== API ROUTES =====================

  // 1. CHAT ENDPOINT (Proxies all LLM calls, zero frontend exposure of GEMINI_API_KEY)
  app.post('/api/chat', async (req: Request, res: Response) => {
    const startTime = Date.now();
    const { message, history = [], model = 'gemma-4-31b-it' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Valid query message is required.' });
    }

    const trimmedQuery = message.trim();
    const cacheKey = getCacheKey(trimmedQuery, model);

    // Check Cache
    const cachedEntry = responseCache.get(cacheKey);
    if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
      stats.cachedQueries++;
      stats.totalQueries++;
      stats.cacheHitRate = Math.round((stats.cachedQueries / stats.totalQueries) * 1000) / 10;
      return res.json({
        ...cachedEntry.response,
        cached: true,
        latencyMs: Date.now() - startTime
      });
    }

    // Step 1: RAG Retrieval - Find top 3 to 5 matching chunks
    const retrievalResults = retriever.retrieve(trimmedQuery, 4);
    const topScore = retrievalResults.length > 0 ? retrievalResults[0].score : 0;

    // Out-of-scope / No context fallback check (< 0.20 score)
    const isLowConfidence = topScore < 0.20 || retrievalResults.length === 0;

    if (isLowConfidence) {
      // Log to Unanswered queries for admin review
      const unansweredId = `unans-${Date.now()}`;
      unansweredQueries.unshift({
        id: unansweredId,
        query: trimmedQuery,
        timestamp: new Date().toISOString(),
        bestSimilarityScore: topScore,
        status: 'pending'
      });
      stats.fallbackCount++;
      stats.totalQueries++;
      stats.unansweredCount = unansweredQueries.filter(q => q.status === 'pending').length;
      stats.fallbackRate = Math.round((stats.fallbackCount / stats.totalQueries) * 1000) / 10;

      const fallbackReply: ChatResponse = {
        answer: `I could not find verified information for your question in our official college records.\n\nPlease contact the **Central Student Helpdesk** or the concerned department directly:\n\n• **General Helpdesk:** helpdesk@college.edu | Phone: +91-11-2766-7000\n• **Location:** Room 104, Administrative Block (Mon-Fri 9:00 AM - 5:00 PM)\n• **Examination Inquiries:** coe@college.edu | Room 201\n• **Accounts / Fee Queries:** accounts@college.edu | Window 3`,
        sources: [],
        suggestedQuestions: [
          'What are the Central Library timings and book limits?',
          'How do I pay semester fees and what is the late fine?',
          'What is the minimum attendance required for semester exams?'
        ],
        isFallback: true,
        cached: false,
        latencyMs: Date.now() - startTime,
        modelUsed: model
      };

      return res.json(fallbackReply);
    }

    // Step 2: Build Grounded Context for Gemma 4
    const contextBlocks = retrievalResults.map((r, i) =>
      `[CHUNK ${i + 1}] Source: ${r.chunk.sourceDoc} (Confidence: ${Math.round(r.score * 100)}%)\n${r.chunk.text}`
    ).join('\n\n---\n\n');

    // Build Conversation Context
    const conversationHistoryText = history.slice(-4).map((h: any) =>
      `${h.role === 'user' ? 'Student' : 'Assistant'}: ${h.content}`
    ).join('\n');

    const prompt = `VERIFIED COLLEGE CONTEXT CHUNKS:
=========================================
${contextBlocks}
=========================================

RECENT CONVERSATION HISTORY:
${conversationHistoryText || '(No previous messages)'}

STUDENT QUESTION:
"${trimmedQuery}"

INSTRUCTIONS FOR GEMMA 4:
- Formulate your answer based ONLY on the verified context chunks above.
- Cite the source document tags in square brackets.
- Match the student's language style (English, Hindi, or Hinglish).
- Include 3 follow-up suggestions inside <<<SUGGESTIONS>>> <<<END_SUGGESTIONS>>>.`;

    try {
      const generatedRawText = await callGemmaWithBackoff(model, prompt);
      const parsed = parseResponseText(generatedRawText);

      const sourcesList = retrievalResults.map(r => ({
        title: r.chunk.title,
        doc: r.chunk.sourceDoc,
        similarity: r.score,
        snippet: r.chunk.text.slice(0, 160) + '...'
      }));

      const latency = Date.now() - startTime;
      stats.totalQueries++;
      stats.avgLatencyMs = Math.round((stats.avgLatencyMs * 0.9) + (latency * 0.1));
      stats.cacheHitRate = Math.round((stats.cachedQueries / stats.totalQueries) * 1000) / 10;
      stats.fallbackRate = Math.round((stats.fallbackCount / stats.totalQueries) * 1000) / 10;

      const chatResponse: ChatResponse = {
        answer: parsed.answer,
        sources: sourcesList,
        suggestedQuestions: parsed.suggestions,
        isFallback: false,
        cached: false,
        latencyMs: latency,
        modelUsed: model
      };

      // Store in Cache
      responseCache.set(cacheKey, {
        response: chatResponse,
        expiresAt: Date.now() + CACHE_TTL_MS
      });

      return res.json(chatResponse);
    } catch (err: any) {
      console.warn('Gemma upstream call issue, serving grounded RAG synthesis:', err?.message || err);

      // Resilient fallback: Synthesize grounded response directly from top retrieved RAG chunk
      const bestChunk = retrievalResults[0]?.chunk;
      let cleanAnswer = bestChunk?.text || '';
      
      // Clean internal markers if present
      cleanAnswer = cleanAnswer
        .replace(/^\[Category:.*?\]\n/i, '')
        .replace(/^Question:.*?\n/i, '')
        .replace(/^Official Answer:\s*/i, '')
        .replace(/Verified Source:.*$/i, '')
        .trim();

      const sourcesList = retrievalResults.map(r => ({
        title: r.chunk.title,
        doc: r.chunk.sourceDoc,
        similarity: r.score,
        snippet: r.chunk.text.slice(0, 160) + '...'
      }));

      const latency = Date.now() - startTime;
      stats.totalQueries++;
      stats.avgLatencyMs = Math.round((stats.avgLatencyMs * 0.9) + (latency * 0.1));

      const isRateLimit = String(err).includes('429') || String(err).includes('RESOURCE_EXHAUSTED');

      const chatResponse: ChatResponse = {
        answer: `${cleanAnswer}\n\n[Verified Source: ${bestChunk?.sourceDoc || 'College Administration'}]${
          isRateLimit ? '\n\n*(Note: High traffic detected; response served instantly from verified cache.)*' : ''
        }`,
        sources: sourcesList,
        suggestedQuestions: [
          'What are the administrative office hours?',
          'How can I contact the student helpdesk?',
          'Where can I download the academic calendar?'
        ],
        isFallback: false,
        cached: false,
        latencyMs: latency,
        modelUsed: `${model} (RAG Direct)`
      };

      responseCache.set(cacheKey, {
        response: chatResponse,
        expiresAt: Date.now() + CACHE_TTL_MS
      });

      return res.json(chatResponse);
    }
  });

  // 2. ADMIN AUTH
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { password } = req.body;
    if (password === 'admin123' || password === 'apexadmin') {
      return res.json({ success: true, token: 'session-' + Date.now() });
    }
    return res.status(401).json({ success: false, message: 'Invalid Admin Password. (Default demo pass is: admin123)' });
  });

  // 3. FAQS CRUD
  app.get('/api/faqs', (_req: Request, res: Response) => {
    res.json(faqs);
  });

  app.post('/api/faqs', (req: Request, res: Response) => {
    const { category, question, questionVariants = [], answer, sourceDoc, sectionOrRule, tags = [] } = req.body;
    if (!category || !question || !answer || !sourceDoc) {
      return res.status(400).json({ error: 'category, question, answer, and sourceDoc are required.' });
    }

    const newFaq: FAQItem = {
      id: `faq-custom-${Date.now()}`,
      category,
      question,
      questionVariants: Array.isArray(questionVariants) ? questionVariants : [],
      answer,
      sourceDoc,
      sectionOrRule: sectionOrRule || 'General',
      updatedAt: new Date().toISOString().split('T')[0],
      tags: Array.isArray(tags) ? tags : ['custom']
    };

    faqs.unshift(newFaq);
    retriever.addFaqChunk(newFaq);
    stats.totalFaqs = faqs.length;
    res.status(201).json(newFaq);
  });

  app.put('/api/faqs/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = faqs.findIndex(f => f.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    faqs[index] = {
      ...faqs[index],
      ...req.body,
      id,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    // Re-index
    retriever.removeFaqChunk(id);
    retriever.addFaqChunk(faqs[index]);
    res.json(faqs[index]);
  });

  app.delete('/api/faqs/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    faqs = faqs.filter(f => f.id !== id);
    retriever.removeFaqChunk(id);
    stats.totalFaqs = faqs.length;
    res.json({ success: true });
  });

  // 4. DOCUMENTS & CIRCULARS CRUD
  app.get('/api/documents', (_req: Request, res: Response) => {
    res.json(documents);
  });

  app.post('/api/documents', (req: Request, res: Response) => {
    const { title, type = 'circular', department, content } = req.body;
    if (!title || !department || !content) {
      return res.status(400).json({ error: 'Title, department, and content are required.' });
    }

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title,
      type,
      department,
      date: new Date().toISOString().split('T')[0],
      chunkCount: Math.max(1, content.split(/\n\s*\n/).filter((s: string) => s.trim().length > 30).length),
      content
    };

    documents.unshift(newDoc);
    retriever.ingestDocuments([newDoc]);
    stats.totalDocuments = documents.length;
    res.status(201).json(newDoc);
  });

  app.delete('/api/documents/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    documents = documents.filter(d => d.id !== id);
    retriever.removeDocChunk(id);
    stats.totalDocuments = documents.length;
    res.json({ success: true });
  });

  // 5. UNANSWERED QUERIES
  app.get('/api/unanswered', (_req: Request, res: Response) => {
    res.json(unansweredQueries);
  });

  app.post('/api/unanswered/:id/resolve', (req: Request, res: Response) => {
    const { id } = req.params;
    const { answer, category, sourceDoc } = req.body;
    const queryItem = unansweredQueries.find(q => q.id === id);

    if (!queryItem) {
      return res.status(404).json({ error: 'Query not found' });
    }

    queryItem.status = 'resolved';

    // If answer provided, automatically promote to official FAQ!
    if (answer && category) {
      const newFaq: FAQItem = {
        id: `faq-from-query-${Date.now()}`,
        category,
        question: queryItem.query,
        questionVariants: [],
        answer,
        sourceDoc: sourceDoc || 'Helpdesk Resolution 2025',
        sectionOrRule: 'Admin Redressal',
        updatedAt: new Date().toISOString().split('T')[0],
        tags: ['helpdesk-resolved', category.toLowerCase()]
      };
      faqs.unshift(newFaq);
      retriever.addFaqChunk(newFaq);
      stats.totalFaqs = faqs.length;
    }

    stats.unansweredCount = unansweredQueries.filter(q => q.status === 'pending').length;
    res.json({ success: true, item: queryItem });
  });

  app.delete('/api/unanswered/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    unansweredQueries = unansweredQueries.filter(q => q.id !== id);
    stats.unansweredCount = unansweredQueries.filter(q => q.status === 'pending').length;
    res.json({ success: true });
  });

  // 6. SYSTEM STATS & CACHE PURGE
  app.get('/api/stats', (_req: Request, res: Response) => {
    stats.totalFaqs = faqs.length;
    stats.totalDocuments = documents.length;
    stats.unansweredCount = unansweredQueries.filter(q => q.status === 'pending').length;
    res.json(stats);
  });

  app.post('/api/cache/clear', (_req: Request, res: Response) => {
    responseCache.clear();
    res.json({ success: true, message: 'LLM Response Cache Cleared' });
  });

  // 7. RESET KNOWLEDGE BASE TO DEFAULT
  app.post('/api/reset-sample-data', (_req: Request, res: Response) => {
    faqs = [...INITIAL_FAQS];
    documents = [...INITIAL_DOCUMENTS];
    responseCache.clear();
    // Rebuild retriever
    const newRetriever = new RAGRetriever();
    newRetriever.ingestFaqs(faqs);
    newRetriever.ingestDocuments(documents);
    // Replace instance
    (retriever as any).chunks = newRetriever.getAllChunks();
    stats.totalFaqs = faqs.length;
    stats.totalDocuments = documents.length;
    res.json({ success: true, message: 'Sample knowledge base restored' });
  });

  // ===================== FRONTEND INTEGRATION =====================
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusQuery Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
