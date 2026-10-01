import { FAQItem, DocumentItem, RAGChunk } from '../types';

export class RAGRetriever {
  private chunks: RAGChunk[] = [];
  private idCounter = 1;

  constructor() {
    this.chunks = [];
  }

  // Tokenize and normalize query or passage, supporting English & Hinglish
  public static tokenize(text: string): string[] {
    if (!text) return [];
    const normalized = text
      .toLowerCase()
      .replace(/[^\w\s\u0900-\u097F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const rawTokens = normalized.split(' ');
    // Filter stop words, common English & Hinglish fillers
    const stopWords = new Set([
      'a', 'an', 'the', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'and', 'or', 'by', 'it', 'this', 'that', 'what', 'where', 'when', 'how', 'who', 'which',
      'can', 'i', 'my', 'me', 'you', 'your', 'please', 'tell', 'about',
      // Hinglish common words
      'kya', 'hai', 'hain', 'ka', 'ki', 'ke', 'ko', 'se', 'me', 'mein', 'par', 'bhi', 'kare',
      'karna', 'karein', 'karta', 'karti', 'hoga', 'hogi', 'batao', 'bataiye', 'sir', 'maam'
    ]);

    return rawTokens.filter(t => t.length > 1 && !stopWords.has(t));
  }

  // Compute a simple hash-based pseudo-semantic vector representation
  // for robust in-memory vector similarity calculations
  private computeVector(tokens: string[]): number[] {
    const dim = 128;
    const vec = new Array(dim).fill(0);
    for (const token of tokens) {
      let hash = 0;
      for (let i = 0; i < token.length; i++) {
        hash = (hash << 5) - hash + token.charCodeAt(i);
        hash |= 0;
      }
      const index = Math.abs(hash) % dim;
      vec[index] += 1;
    }

    // Normalize
    const mag = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    if (mag > 0) {
      for (let i = 0; i < dim; i++) {
        vec[i] /= mag;
      }
    }
    return vec;
  }

  // Cosine similarity
  public static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      magA += vecA[i] * vecA[i];
      magB += vecB[i] * vecB[i];
    }
    if (magA === 0 || magB === 0) return 0;
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }

  // Ingest FAQs as chunks
  public ingestFaqs(faqs: FAQItem[]) {
    for (const faq of faqs) {
      const fullText = `Q: ${faq.question}\nVariants: ${faq.questionVariants.join(' | ')}\nCategory: ${faq.category}\nAnswer: ${faq.answer}\nSource: ${faq.sourceDoc} (${faq.sectionOrRule || ''})\nTags: ${faq.tags.join(', ')}`;
      const tokens = RAGRetriever.tokenize(fullText);
      const vector = this.computeVector(tokens);

      this.chunks.push({
        id: `chunk-faq-${faq.id}`,
        docId: faq.id,
        title: faq.question,
        category: faq.category,
        text: `[Category: ${faq.category}]\nQuestion: ${faq.question}\nOfficial Answer: ${faq.answer}\nVerified Source: ${faq.sourceDoc} [${faq.sectionOrRule || 'General'}]`,
        sourceDoc: `${faq.sourceDoc} [${faq.sectionOrRule || 'General'}]`,
        vector,
        keywords: tokens
      });
    }
  }

  // Ingest raw document / notices by splitting into section chunks
  public ingestDocuments(docs: DocumentItem[]) {
    for (const doc of docs) {
      // Split by section or paragraphs
      const sections = doc.content.split(/\n\s*\n/).filter(s => s.trim().length > 30);
      let secIndex = 1;
      for (const sec of sections) {
        const fullText = `Doc Title: ${doc.title}\nDepartment: ${doc.department}\nType: ${doc.type}\nContent: ${sec}`;
        const tokens = RAGRetriever.tokenize(fullText);
        const vector = this.computeVector(tokens);

        this.chunks.push({
          id: `chunk-doc-${doc.id}-${secIndex}`,
          docId: doc.id,
          title: `${doc.title} (Part ${secIndex})`,
          category: 'Official Circular / Notice',
          text: `[Document: ${doc.title} | Department: ${doc.department} | Date: ${doc.date}]\n${sec.trim()}`,
          sourceDoc: `${doc.title} (${doc.department})`,
          vector,
          keywords: tokens
        });
        secIndex++;
      }
    }
  }

  // Add a single custom FAQ chunk
  public addFaqChunk(faq: FAQItem) {
    const fullText = `Q: ${faq.question}\nVariants: ${faq.questionVariants.join(' | ')}\nCategory: ${faq.category}\nAnswer: ${faq.answer}\nSource: ${faq.sourceDoc} (${faq.sectionOrRule || ''})\nTags: ${faq.tags.join(', ')}`;
    const tokens = RAGRetriever.tokenize(fullText);
    const vector = this.computeVector(tokens);

    this.chunks.push({
      id: `chunk-faq-${faq.id}`,
      docId: faq.id,
      title: faq.question,
      category: faq.category,
      text: `[Category: ${faq.category}]\nQuestion: ${faq.question}\nOfficial Answer: ${faq.answer}\nVerified Source: ${faq.sourceDoc} [${faq.sectionOrRule || 'General'}]`,
      sourceDoc: `${faq.sourceDoc} [${faq.sectionOrRule || 'General'}]`,
      vector,
      keywords: tokens
    });
  }

  // Remove chunks for deleted FAQ
  public removeFaqChunk(faqId: string) {
    this.chunks = this.chunks.filter(c => c.docId !== faqId);
  }

  // Remove chunks for deleted doc
  public removeDocChunk(docId: string) {
    this.chunks = this.chunks.filter(c => c.docId !== docId);
  }

  public getChunkCount(): number {
    return this.chunks.length;
  }

  public getAllChunks(): RAGChunk[] {
    return this.chunks;
  }

  // Hybrid search: Token overlap + Vector similarity + exact substring bonus
  public retrieve(query: string, topK: number = 4): { chunk: RAGChunk; score: number }[] {
    const queryTokens = RAGRetriever.tokenize(query);
    if (queryTokens.length === 0 && query.trim().length === 0) {
      return [];
    }

    const queryVec = this.computeVector(queryTokens);
    const queryLower = query.toLowerCase();

    // Map common Hinglish vocabulary to domain concepts
    const hinglishConceptBoost: Record<string, string[]> = {
      'fees': ['fee', 'tuition', 'fine', 'penalty', 'payment', 'sbi', 'receipt', 'scholarship', 'paisa', 'bharni'],
      'hostel': ['room', 'warden', 'curfew', 'outpass', 'mess', 'timing', 'leave', 'iron', 'kettle', 'heater'],
      'exam': ['marks', 'result', 'revaluation', 'backlog', 'supplementary', 'see', 'cgpa', 'percentage', 'grade', 'copy'],
      'attendance': ['absent', 'percent', 'percentage', '75', 'shortage', 'medical', 'condonation', 'leave'],
      'library': ['books', 'issue', 'fine', 'knimbus', 'ieee', 'reading', 'timing', 'curfew'],
      'placement': ['job', 'tpo', 'package', 'ctc', 'company', 'internship', 'noc', 'dream', 'backlog'],
      'bus': ['transport', 'route', 'shuttle', 'pass', 'timing', 'metro', 'pickup', 'parking'],
      'doctor': ['medical', 'health', 'ambulance', 'dispensary', 'hospital', 'emergency', 'medicine'],
      'wifi': ['internet', 'lan', 'mac', 'speed', 'password', 'portal', 'connect']
    };

    const scored = this.chunks.map(chunk => {
      // 1. Vector cosine similarity
      const vectorScore = chunk.vector ? RAGRetriever.cosineSimilarity(queryVec, chunk.vector) : 0;

      // 2. Token overlap (Jaccard / TF style)
      let matchedTokens = 0;
      const chunkTokensSet = new Set(chunk.keywords);
      for (const qToken of queryTokens) {
        if (chunkTokensSet.has(qToken)) {
          matchedTokens++;
        } else {
          // Check substring / stem match
          for (const cToken of chunk.keywords) {
            if (cToken.includes(qToken) || qToken.includes(cToken)) {
              matchedTokens += 0.6;
              break;
            }
          }
        }
      }
      const tokenScore = queryTokens.length > 0 ? matchedTokens / Math.max(queryTokens.length, 3) : 0;

      // 3. Exact phrase match bonus
      let phraseBonus = 0;
      const lowerChunkText = chunk.text.toLowerCase();
      if (lowerChunkText.includes(queryLower)) {
        phraseBonus = 0.4;
      }

      // 4. Hinglish domain concept matching
      let domainBonus = 0;
      for (const [key, words] of Object.entries(hinglishConceptBoost)) {
        if (queryLower.includes(key) || words.some(w => queryLower.includes(w))) {
          if (lowerChunkText.includes(key) || words.some(w => lowerChunkText.includes(w))) {
            domainBonus += 0.15;
            break;
          }
        }
      }

      // Hybrid composite score (0 to 1+)
      const compositeScore = (vectorScore * 0.45) + (tokenScore * 0.4) + phraseBonus + domainBonus;

      return {
        chunk,
        score: Math.min(1.0, Math.round(compositeScore * 100) / 100)
      };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, topK);
  }
}
