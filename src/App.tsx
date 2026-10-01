/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import { AdminPanel } from './components/AdminPanel';
import { ArchitectureDocs } from './components/ArchitectureDocs';
import { DatasetViewer } from './components/DatasetViewer';
import { Phone, Mail, Building, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'admin' | 'architecture' | 'dataset'>('chat');
  const [selectedModel, setSelectedModel] = useState<'gemma-4-31b-it' | 'gemma-4-26b-a4b-it' | 'gemini-3.8-flash'>('gemma-4-31b-it');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header with Navigation & Engine Selector */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'chat' && (
          <ChatInterface selectedModel={selectedModel} />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            isAdminLoggedIn={isAdminLoggedIn}
            setIsAdminLoggedIn={setIsAdminLoggedIn}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureDocs />
        )}

        {activeTab === 'dataset' && (
          <DatasetViewer />
        )}
      </main>

      {/* Compact Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Apex Institute of Technology</span>
            <span>•</span>
            <span>Central Student Services Knowledge Core</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-600">
              <Mail className="w-3 h-3 text-indigo-600" /> helpdesk@college.edu
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <Phone className="w-3 h-3 text-indigo-600" /> +91-11-2766-7000
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <Building className="w-3 h-3 text-indigo-600" /> Room 104, Admin Block (9 AM - 5 PM)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
