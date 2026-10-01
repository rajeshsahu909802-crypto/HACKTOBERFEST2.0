import React, { useState } from 'react';
import { BookOpen, Search, Filter, BookMarked, Tag, CheckCircle2, ChevronRight } from 'lucide-react';
import { FAQItem } from '../types';
import { INITIAL_FAQS, CATEGORIES } from '../data/sampleFaqs';

export const DatasetViewer: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = INITIAL_FAQS.filter((faq) => {
    const matchesCat = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      faq.questionVariants.some(v => v.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Verified Knowledge Base
            </span>
            <span className="text-xs text-slate-500 font-medium">
              25+ Official College Q&A Pairs
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Curated College FAQ & Services Dataset
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            This dataset grounds CampusQuery's RAG pipeline. Every single answer is indexed from verified college regulations, fee ordinances, and residential manuals.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs, keywords, or Hinglish phrases..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white font-medium text-slate-700"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* FAQs Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFaqs.map((faq) => (
          <div
            key={faq.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  {faq.category}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {faq.id}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                {faq.question}
              </h3>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                {faq.answer}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              {/* Citation */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <BookMarked className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="font-semibold text-slate-800">Source:</span>
                <span className="font-mono text-indigo-900 truncate">{faq.sourceDoc}</span>
                {faq.sectionOrRule && (
                  <span className="text-slate-400">({faq.sectionOrRule})</span>
                )}
              </div>

              {/* Variants */}
              {faq.questionVariants.length > 0 && (
                <div className="text-[11px] text-slate-400 leading-tight">
                  <span className="font-medium text-slate-600">Hinglish / Variants:</span>{' '}
                  {faq.questionVariants.join(' • ')}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {faq.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
