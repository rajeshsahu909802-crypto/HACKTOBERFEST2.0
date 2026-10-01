import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  FileText, 
  HelpCircle, 
  Search, 
  RefreshCw, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Database
} from 'lucide-react';
import { FAQItem, DocumentItem, UnansweredQuery, SystemStats } from '../types';
import { CATEGORIES } from '../data/sampleFaqs';

interface AdminPanelProps {
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isAdminLoggedIn,
  setIsAdminLoggedIn
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'faqs' | 'docs' | 'unanswered' | 'system'>('faqs');

  // Data states
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [unanswered, setUnanswered] = useState<UnansweredQuery[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // FAQ Modal state
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [faqForm, setFaqForm] = useState({
    category: 'Academics',
    question: '',
    questionVariants: '',
    answer: '',
    sourceDoc: '',
    sectionOrRule: '',
    tags: ''
  });

  // Doc Modal state
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docForm, setDocForm] = useState({
    title: '',
    type: 'circular' as const,
    department: '',
    content: ''
  });

  // Resolve Modal state
  const [resolvingQuery, setResolvingQuery] = useState<UnansweredQuery | null>(null);
  const [resolveAnswer, setResolveAnswer] = useState('');
  const [resolveCategory, setResolveCategory] = useState('Academics');
  const [resolveSource, setResolveSource] = useState('Central Academic Council 2025');

  // Notification state
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [faqsRes, docsRes, unansRes, statsRes] = await Promise.all([
        fetch('/api/faqs'),
        fetch('/api/documents'),
        fetch('/api/unanswered'),
        fetch('/api/stats')
      ]);

      if (faqsRes.ok) setFaqs(await faqsRes.json());
      if (docsRes.ok) setDocs(await docsRes.json());
      if (unansRes.ok) setUnanswered(await unansRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchData();
    }
  }, [isAdminLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdminLoggedIn(true);
        setPasswordInput('');
      } else {
        setAuthError(data.message || 'Invalid credentials');
      }
    } catch {
      setAuthError('Connection failed. Please retry.');
    }
  };

  // FAQ Operations
  const handleOpenFaqModal = (faq?: FAQItem) => {
    if (faq) {
      setEditingFaq(faq);
      setFaqForm({
        category: faq.category,
        question: faq.question,
        questionVariants: faq.questionVariants.join(', '),
        answer: faq.answer,
        sourceDoc: faq.sourceDoc,
        sectionOrRule: faq.sectionOrRule || '',
        tags: faq.tags.join(', ')
      });
    } else {
      setEditingFaq(null);
      setFaqForm({
        category: 'Academics',
        question: '',
        questionVariants: '',
        answer: '',
        sourceDoc: '',
        sectionOrRule: '',
        tags: ''
      });
    }
    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      category: faqForm.category,
      question: faqForm.question,
      questionVariants: faqForm.questionVariants.split(',').map(s => s.trim()).filter(Boolean),
      answer: faqForm.answer,
      sourceDoc: faqForm.sourceDoc,
      sectionOrRule: faqForm.sectionOrRule,
      tags: faqForm.tags.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      const url = editingFaq ? `/api/faqs/${editingFaq.id}` : '/api/faqs';
      const method = editingFaq ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsFaqModalOpen(false);
        showNotification(editingFaq ? 'FAQ updated & re-indexed' : 'New FAQ added & indexed into RAG');
        fetchData();
      } else {
        showNotification('Failed to save FAQ', 'error');
      }
    } catch {
      showNotification('Server communication error', 'error');
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Are you sure you want to remove this FAQ from the knowledge base?')) return;
    try {
      const res = await fetch(`/api/faqs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('FAQ removed from vector index');
        fetchData();
      }
    } catch {
      showNotification('Failed to delete FAQ', 'error');
    }
  };

  // Doc Operations
  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docForm)
      });

      if (res.ok) {
        setIsDocModalOpen(false);
        setDocForm({ title: '', type: 'circular', department: '', content: '' });
        showNotification('Document chunked and indexed into vector store');
        fetchData();
      } else {
        showNotification('Failed to ingest document', 'error');
      }
    } catch {
      showNotification('Server communication error', 'error');
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document and its vector chunks?')) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('Document deleted from index');
        fetchData();
      }
    } catch {
      showNotification('Failed to delete document', 'error');
    }
  };

  // Unanswered Query Operations
  const handleResolveQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingQuery) return;

    try {
      const res = await fetch(`/api/unanswered/${resolvingQuery.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: resolveAnswer,
          category: resolveCategory,
          sourceDoc: resolveSource
        })
      });

      if (res.ok) {
        setResolvingQuery(null);
        setResolveAnswer('');
        showNotification('Query resolved and automatically promoted to official FAQ!');
        fetchData();
      }
    } catch {
      showNotification('Failed to resolve query', 'error');
    }
  };

  const handleDismissQuery = async (id: string) => {
    try {
      const res = await fetch(`/api/unanswered/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('Query dismissed');
        fetchData();
      }
    } catch {
      showNotification('Failed to dismiss query', 'error');
    }
  };

  // Cache Operations
  const handleClearCache = async () => {
    try {
      const res = await fetch('/api/cache/clear', { method: 'POST' });
      if (res.ok) {
        showNotification('LLM response cache cleared successfully');
        fetchData();
      }
    } catch {
      showNotification('Failed to clear cache', 'error');
    }
  };

  const handleResetData = async () => {
    if (!confirm('Reset all FAQs and documents to original verified dataset? Custom edits will be restored.')) return;
    try {
      const res = await fetch('/api/reset-sample-data', { method: 'POST' });
      if (res.ok) {
        showNotification('Knowledge base reset to original verified state');
        fetchData();
      }
    } catch {
      showNotification('Failed to reset dataset', 'error');
    }
  };

  // Filtered FAQs
  const filteredFaqs = faqs.filter(f => {
    const matchesCat = selectedCategory === 'All' || f.category === selectedCategory;
    const matchesSearch = 
      f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // If not logged in, show Password Lock Gate
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Admin Knowledge Base Access</h2>
        <p className="text-xs text-slate-500 mb-6">
          Authorize to manage verified FAQs, upload college circulars, and review unanswered student queries.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter Admin Password (demo: admin123)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 text-sm"
              autoFocus
            />
            {authError && (
              <p className="text-xs text-rose-600 mt-2 font-medium text-left">{authError}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-xs"
          >
            Unlock Admin Panel
          </button>

          <p className="text-[11px] text-slate-400">
            Default credentials for reviewer: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">admin123</code>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Admin Header & Stats Highlights */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Knowledge Base Management Suite
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              Authenticated
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain college service rules, ingest circulars, and monitor real-time RAG retrieval performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
          <button
            onClick={() => setIsAdminLoggedIn(false)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* System Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total FAQs</span>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{stats.totalFaqs}</div>
            <span className="text-[10px] text-slate-500">Across 9 domains</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Documents</span>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{stats.totalDocuments}</div>
            <span className="text-[10px] text-slate-500">Indexed in vector DB</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cache Hit Rate</span>
            <div className="text-xl font-extrabold text-emerald-600 mt-1">{stats.cacheHitRate}%</div>
            <span className="text-[10px] text-emerald-700">{stats.cachedQueries} queries cached</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Latency</span>
            <div className="text-xl font-extrabold text-indigo-600 mt-1">{stats.avgLatencyMs}ms</div>
            <span className="text-[10px] text-indigo-600">Gemma 4 proxy</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Unanswered</span>
            <div className="text-xl font-extrabold text-amber-600 mt-1">{stats.unansweredCount}</div>
            <span className="text-[10px] text-amber-600">Action required</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Fallback Rate</span>
            <div className="text-xl font-extrabold text-slate-700 mt-1">{stats.fallbackRate}%</div>
            <span className="text-[10px] text-slate-400">Helpdesk referred</span>
          </div>
        </div>
      )}

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('faqs')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'faqs'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Verified FAQs ({faqs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('docs')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'docs'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Circulars & Documents ({docs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('unanswered')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'unanswered'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Unanswered Queries ({unanswered.filter(u => u.status === 'pending').length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('system')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'system'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>System & Cache</span>
        </button>
      </div>

      {/* 1. FAQS MANAGER TAB */}
      {activeSubTab === 'faqs' && (
        <div className="space-y-4">
          {/* Action & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search questions, keywords, or answers..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white font-medium text-slate-700"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Add New FAQ Button */}
            <button
              onClick={() => handleOpenFaqModal()}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New FAQ</span>
            </button>
          </div>

          {/* FAQs List Table/Cards */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
                No FAQs match your search criteria.
              </div>
            ) : (
              filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                          {faq.category}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Updated: {faq.updatedAt}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {faq.question}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenFaqModal(faq)}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors"
                        title="Edit FAQ"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="p-1.5 rounded-md hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {faq.answer}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <div>
                      <span className="font-medium text-slate-700">Source:</span>{' '}
                      <span className="font-mono text-indigo-900">{faq.sourceDoc}</span>{' '}
                      <span className="text-slate-400">({faq.sectionOrRule})</span>
                    </div>

                    {faq.questionVariants.length > 0 && (
                      <div className="text-slate-400 truncate max-w-sm">
                        <span className="font-medium text-slate-600">Variants / Hinglish:</span>{' '}
                        {faq.questionVariants.join(' • ')}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. DOCUMENTS & CIRCULARS TAB */}
      {activeSubTab === 'docs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Official College Notices, Circulars & Handbooks
              </h2>
              <p className="text-xs text-slate-500">
                Documents are automatically chunked into section blocks and vectorized into the RAG retriever.
              </p>
            </div>
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Ingest Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                      {doc.type}
                    </span>
                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{doc.title}</h3>
                  <p className="text-xs text-slate-500 font-medium mb-3">
                    Dept: {doc.department} • Date: {doc.date}
                  </p>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-4 font-mono text-[11px]">
                    {doc.content}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{doc.chunkCount} Vector Chunks Created</span>
                  <span className="text-emerald-700 font-medium">✓ Indexed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. UNANSWERED QUERIES TAB */}
      {activeSubTab === 'unanswered' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900">
              Unanswered & Low-Confidence Student Queries
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These queries triggered the Helpdesk fallback. You can write the official answer and immediately promote it into a permanent FAQ so all future students get answered automatically.
            </p>
          </div>

          <div className="space-y-3">
            {unanswered.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
                No pending unanswered queries! Great job maintaining the knowledge base.
              </div>
            ) : (
              unanswered.map((u) => (
                <div
                  key={u.id}
                  className={`bg-white p-4 rounded-xl border shadow-2xs transition-all ${
                    u.status === 'resolved'
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-amber-200/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            u.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {u.status}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(u.timestamp).toLocaleString()}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Confidence: {Math.round(u.bestSimilarityScore * 100)}%
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-900 text-sm">
                        "{u.query}"
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      {u.status === 'pending' && (
                        <button
                          onClick={() => {
                            setResolvingQuery(u);
                            setResolveAnswer('');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>Answer & Add to FAQs</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDismissQuery(u.id)}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                        title="Dismiss"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. SYSTEM & CACHE CONTROLS TAB */}
      {activeSubTab === 'system' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cache Control Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">In-Memory LLM Query Cache</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                CampusQuery caches repeated student questions for 1 hour. This ensures 0 latency, 0 API consumption, and prevents hitting Google AI Studio free-tier rate limits during peak exam weeks.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleClearCache}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors"
                >
                  Purge Response Cache
                </button>
                <span className="text-xs text-slate-500">
                  {stats?.cachedQueries || 0} cached queries currently active
                </span>
              </div>
            </div>

            {/* Knowledge Base Reset Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">Reset to Official Baseline Dataset</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Restore the 25+ verified College FAQs across all 9 domains and official college circulars. Useful for testing edge cases, RAG benchmarks, and demonstration.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleResetData}
                  className="px-3.5 py-2 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
                >
                  Restore Baseline Dataset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT FAQ */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">
              {editingFaq ? 'Edit Verified FAQ' : 'Add New Verified College FAQ'}
            </h3>

            <form onSubmit={handleSaveFaq} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={faqForm.category}
                  onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-sm"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Student Question</label>
                <input
                  type="text"
                  required
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  placeholder="e.g. What is the fee payment deadline?"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Question Variants & Hinglish / Slang (comma-separated)
                </label>
                <input
                  type="text"
                  value={faqForm.questionVariants}
                  onChange={(e) => setFaqForm({ ...faqForm, questionVariants: e.target.value })}
                  placeholder="e.g. fees kab tak bharni hai?, last date to pay fees, fee late fine"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Verified Official Answer</label>
                <textarea
                  required
                  rows={4}
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  placeholder="Enter precise answer with figures, dates, and instructions..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Source Document Citation</label>
                  <input
                    type="text"
                    required
                    value={faqForm.sourceDoc}
                    onChange={(e) => setFaqForm({ ...faqForm, sourceDoc: e.target.value })}
                    placeholder="e.g. Finance Notification 2025/FAO/12"
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section or Rule Clause</label>
                  <input
                    type="text"
                    value={faqForm.sectionOrRule}
                    onChange={(e) => setFaqForm({ ...faqForm, sectionOrRule: e.target.value })}
                    placeholder="e.g. Clause 3 - Fee Schedule"
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={faqForm.tags}
                  onChange={(e) => setFaqForm({ ...faqForm, tags: e.target.value })}
                  placeholder="fees, sbi, late fee, deadline"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  {editingFaq ? 'Save Changes' : 'Add to Knowledge Base'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INGEST DOCUMENT */}
      {isDocModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">
              Ingest College Document / Notice / PDF Text
            </h3>
            <p className="text-xs text-slate-500">
              Paste the text content of your circular or syllabus. The system splits it into section chunks and updates the vector database.
            </p>

            <form onSubmit={handleSaveDoc} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  placeholder="e.g. End Semester Examination Circular Nov 2025"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issuing Department</label>
                  <input
                    type="text"
                    required
                    value={docForm.department}
                    onChange={(e) => setDocForm({ ...docForm, department: e.target.value })}
                    placeholder="e.g. Office of Controller of Exams"
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Document Type</label>
                  <select
                    value={docForm.type}
                    onChange={(e) => setDocForm({ ...docForm, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-sm"
                  >
                    <option value="circular">Circular</option>
                    <option value="notice">Notice</option>
                    <option value="handbook">Handbook</option>
                    <option value="pdf">PDF Extract</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Content</label>
                <textarea
                  required
                  rows={8}
                  value={docForm.content}
                  onChange={(e) => setDocForm({ ...docForm, content: e.target.value })}
                  placeholder="Paste complete circular paragraphs or rules..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Chunk & Ingest into RAG
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESOLVE UNANSWERED QUERY */}
      {resolvingQuery && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Answer & Promote to Permanent FAQ
            </h3>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <span className="font-bold">Student Query:</span> "{resolvingQuery.query}"
            </div>

            <form onSubmit={handleResolveQuery} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={resolveCategory}
                  onChange={(e) => setResolveCategory(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-sm"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Verified Answer</label>
                <textarea
                  required
                  rows={4}
                  value={resolveAnswer}
                  onChange={(e) => setResolveAnswer(e.target.value)}
                  placeholder="Provide the verified answer to be returned to students..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Authority Citation / Source</label>
                <input
                  type="text"
                  required
                  value={resolveSource}
                  onChange={(e) => setResolveSource(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResolvingQuery(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Resolve & Add FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
