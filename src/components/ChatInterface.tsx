import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  RotateCcw, 
  HelpCircle, 
  ExternalLink, 
  BookMarked, 
  Clock, 
  Zap, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Building2,
  PhoneCall,
  Mail,
  Compass
} from 'lucide-react';
import { ChatMessage, ChatResponse } from '../types';
import { QUICK_REPLIES } from '../data/sampleFaqs';

interface ChatInterfaceProps {
  selectedModel: 'gemma-4-31b-it' | 'gemma-4-26b-a4b-it' | 'gemini-3.8-flash';
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ selectedModel }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hello! I am **CampusQuery**, your 24/7 college services assistant powered by **Gemma 4**.\n\nI answer questions about:\n• **Admissions & Semester Fees**\n• **Academic Calendar & Minimum Attendance (75%)**\n• **Exams, Revaluation & Supplementary Rules**\n• **Hostel Curfew, Mess & Night Outpass**\n• **Library Timings, Borrowing & Knimbus Access**\n• **Placements, Eligibility & Dream Offer Rules**\n• **Campus Bus Routes, Transport & Sports Facilities**\n\nYou can ask in **English, Hindi, or Hinglish** (e.g., *"fees kab tak bharni hai?"* or *"hostel outpass process kya h"*). How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedQuestions: [
        'What is the minimum attendance requirement for exams?',
        'Semester fee payment deadline & late fine',
        'Hostel curfew timing and night outpass procedure'
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [expandedSourceMsgId, setExpandedSourceMsgId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Speech synthesis
  const toggleSpeech = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown before speaking
    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/\[CHUNK \d+\]/g, '')
      .replace(/\[.*?\]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Copy answer to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Send message
  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || isLoading) return;

    setErrorMessage(null);
    const userMsgId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const historyPayload = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-6)
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          model: selectedModel
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const data: ChatResponse = await res.json();

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources,
        suggestedQuestions: data.suggestedQuestions,
        isFallback: data.isFallback,
        cached: data.cached,
        latencyMs: data.latencyMs,
        modelUsed: data.modelUsed
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(
        err.message || 'The college services server is busy right now. Please try again in a few moments.'
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleClearChat = () => {
    if (speakingId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }
    setMessages([
      {
        id: 'welcome-msg-reset',
        role: 'assistant',
        content: `Conversation reset. I am ready to answer your questions regarding Apex Institute of Technology services, exams, fees, library, hostel, or placements.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: [
          'What is the minimum attendance requirement for exams?',
          'Semester fee payment deadline & late fine',
          'Hostel curfew timing and night outpass procedure'
        ]
      }
    ]);
  };

  // Helper to format text with bold, citations, and bullet points
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');

    return (
      <div className="space-y-1.5 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />;

          // Process bullet points
          const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
          const cleanLine = isBullet ? line.replace(/^[\s•-]+/, '').trim() : line;

          // Replace bold markdown
          const parts = cleanLine.split(/(\*\*.*?\*\*|\[.*?\])/g);

          return (
            <div key={idx} className={isBullet ? 'flex items-start gap-2 pl-2' : ''}>
              {isBullet && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
              )}
              <div className="flex-1">
                {parts.map((part, pIdx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                      <strong key={pIdx} className="font-semibold text-slate-900">
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  // Highlight citations in badges
                  if (part.startsWith('[') && part.endsWith(']')) {
                    return (
                      <span
                        key={pIdx}
                        className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200/80 font-mono tracking-tight"
                      >
                        <BookMarked className="w-3 h-3 text-amber-700" />
                        {part.slice(1, -1)}
                      </span>
                    );
                  }
                  return <span key={pIdx}>{part}</span>;
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 flex flex-col h-[calc(100vh-120px)]">
      {/* Quick Navigation & Presets Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            <span>Frequent Student Topics:</span>
          </div>
          <button
            onClick={handleClearChat}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-slate-100"
            title="Reset conversation"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear Chat</span>
          </button>
        </div>

        {/* Scrollable Quick Action Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {QUICK_REPLIES.map((qr, index) => (
            <button
              key={index}
              onClick={() => handleSend(qr)}
              disabled={isLoading}
              className="text-xs shrink-0 px-3 py-1.5 rounded-full bg-white hover:bg-indigo-50/70 border border-slate-200 text-slate-700 hover:text-indigo-700 hover:border-indigo-300 font-medium transition-all shadow-2xs hover:shadow-xs disabled:opacity-50"
            >
              {qr}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Box Container */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((message) => {
            const isUser = message.role === 'user';

            return (
              <div
                key={message.id}
                className={`flex gap-3 max-w-4xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-xs ${
                    isUser
                      ? 'bg-slate-800 text-white'
                      : message.isFallback
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-gradient-to-tr from-indigo-600 to-blue-600 text-white'
                  }`}
                >
                  {isUser ? 'YOU' : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div className={`space-y-2 max-w-[85%] sm:max-w-[78%]`}>
                  <div
                    className={`p-4 rounded-2xl ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                        : message.isFallback
                        ? 'bg-amber-50/70 border border-amber-200/90 text-slate-800 rounded-tl-xs'
                        : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      renderFormattedContent(message.content)
                    )}
                  </div>

                  {/* Assistant Footer: Meta, Sources, Audio & Copy */}
                  {!isUser && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pl-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {message.timestamp}
                        </span>

                        {message.latencyMs !== undefined && (
                          <span className="flex items-center gap-1 font-mono">
                            <Zap className="w-3 h-3 text-amber-500" />
                            {message.latencyMs}ms
                          </span>
                        )}

                        {message.cached && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium">
                            Cached (0 API cost)
                          </span>
                        )}

                        {message.modelUsed && (
                          <span className="font-mono text-slate-500">
                            • {message.modelUsed}
                          </span>
                        )}

                        <div className="ml-auto flex items-center gap-1">
                          {/* Speech Readout */}
                          <button
                            onClick={() => toggleSpeech(message.content, message.id)}
                            className="p-1 rounded hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 transition-colors"
                            title={speakingId === message.id ? 'Stop reading' : 'Read answer aloud'}
                          >
                            {speakingId === message.id ? (
                              <VolumeX className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Copy Button */}
                          <button
                            onClick={() => handleCopy(message.content, message.id)}
                            className="p-1 rounded hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 transition-colors"
                            title="Copy answer"
                          >
                            {copiedId === message.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Verified RAG Sources Accordion */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden text-xs">
                          <button
                            onClick={() =>
                              setExpandedSourceMsgId(
                                expandedSourceMsgId === message.id ? null : message.id
                              )
                            }
                            className="w-full px-3 py-2 flex items-center justify-between text-slate-600 hover:bg-slate-50 transition-colors font-medium"
                          >
                            <span className="flex items-center gap-1.5 text-indigo-700">
                              <BookMarked className="w-3.5 h-3.5" />
                              <span>
                                {message.sources.length} Verified Sources Grounding this Answer
                              </span>
                            </span>
                            {expandedSourceMsgId === message.id ? (
                              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>

                          {expandedSourceMsgId === message.id && (
                            <div className="p-3 bg-slate-50/70 border-t border-slate-200 space-y-2">
                              {message.sources.map((src, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs"
                                >
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="font-semibold text-slate-900 truncate">
                                      {src.title}
                                    </span>
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                                      {Math.round(src.similarity * 100)}% match
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 font-mono mb-1">
                                    Source: {src.doc}
                                  </p>
                                  <p className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100 italic">
                                    "{src.snippet}"
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Suggested Follow-up Questions */}
                      {message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
                        <div className="pt-1">
                          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                            Suggested Follow-up:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {message.suggestedQuestions.map((sq, sqIdx) => (
                              <button
                                key={sqIdx}
                                onClick={() => handleSend(sq)}
                                disabled={isLoading}
                                className="text-xs text-left px-2.5 py-1 rounded-lg bg-indigo-50/80 hover:bg-indigo-100 text-indigo-800 border border-indigo-200/60 font-medium transition-all hover:shadow-2xs disabled:opacity-50"
                              >
                                → {sq}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-4xl mr-auto">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-xs p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <span>Searching vector database & retrieving official chunks...</span>
                </div>
                <div className="flex gap-1.5 py-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="px-4 py-2.5 bg-rose-50 border-t border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => handleSend(messages[messages.length - 1]?.content)}
              className="font-semibold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-50/80 border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about fees, hostel curfew, exams, library, placements, or bus routes (Hinglish supported)..."
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 text-sm shadow-2xs transition-all disabled:bg-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow flex items-center gap-1.5 shrink-0 disabled:opacity-40 disabled:hover:bg-indigo-600 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Ask</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Hinglish Example Suggestions */}
          <div className="mt-2.5 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-500 no-scrollbar">
            <span className="font-semibold text-slate-600 shrink-0">Try asking:</span>
            <button
              onClick={() => handleSend('fees kab tak bharni hai aur late fine kitna hai?')}
              className="shrink-0 px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
            >
              "fees kab tak bharni hai?"
            </button>
            <button
              onClick={() => handleSend('hostel me warden se permission outpass kaise le?')}
              className="shrink-0 px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
            >
              "hostel me night outpass kaise le?"
            </button>
            <button
              onClick={() => handleSend('placement me dream offer ke rules kya hai?')}
              className="shrink-0 px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
            >
              "placement dream offer rules"
            </button>
            <button
              onClick={() => handleSend('library se kitni books issue ho sakti hai?')}
              className="shrink-0 px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
            >
              "library issue limit & fine"
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
