import React from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  ShieldCheck, 
  MessageSquare, 
  Database, 
  Layers, 
  BookOpen, 
  Cpu, 
  Zap 
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'chat' | 'admin' | 'architecture' | 'dataset';
  setActiveTab: (tab: 'chat' | 'admin' | 'architecture' | 'dataset') => void;
  selectedModel: 'gemma-4-31b-it' | 'gemma-4-26b-a4b-it' | 'gemini-3.8-flash';
  setSelectedModel: (model: 'gemma-4-31b-it' | 'gemma-4-26b-a4b-it' | 'gemini-3.8-flash') => void;
  isAdminLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedModel,
  setSelectedModel,
  isAdminLoggedIn
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner: University Brand & Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* College & App Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 flex items-center justify-center text-white shadow-sm ring-2 ring-indigo-100">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                CampusQuery
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center gap-1">
                <Sparkles className="w-2.5 h.2.5" /> Gemma 4 RAG
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Apex Institute of Technology • 24/7 Verified Student Services Assistant
            </p>
          </div>
        </div>

        {/* System Controls & Model Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Rate Guard Active Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Free-Tier Rate Guard Active</span>
          </div>

          {/* Model Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-lg border border-slate-200 text-xs">
            <Cpu className="w-3.5 h-3.5 text-slate-500 ml-1.5 hidden sm:inline" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as any)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none text-xs cursor-pointer py-0.5 pr-2"
              title="Select LLM Engine"
            >
              <option value="gemma-4-31b-it">Gemma 4 (31B-IT)</option>
              <option value="gemma-4-26b-a4b-it">Gemma 4 Fast (26B-A4B)</option>
              <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-4 border-t border-slate-100 pt-1 -mb-px overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-2.5 px-3.5 text-xs sm:text-sm font-semibold rounded-t-lg border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'chat'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Student Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`py-2.5 px-3.5 text-xs sm:text-sm font-semibold rounded-t-lg border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'admin'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Admin Knowledge Base</span>
            {isAdminLoggedIn && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-2.5 px-3.5 text-xs sm:text-sm font-semibold rounded-t-lg border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'architecture'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Architecture & System Docs</span>
          </button>

          <button
            onClick={() => setActiveTab('dataset')}
            className={`py-2.5 px-3.5 text-xs sm:text-sm font-semibold rounded-t-lg border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'dataset'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Verified FAQ Dataset</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
