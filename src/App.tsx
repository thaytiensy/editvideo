import React, { useState } from 'react';
import { BrandProvider } from './context/BrandContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GeminiProvider, useGemini } from './context/GeminiContext';
import { Navbar } from './components/layout/Navbar';
import { JobsHistoryView } from './views/JobsHistoryView';
import { TeamView } from './views/TeamView';
import { BillingView } from './views/BillingView';
import { SettingsView } from './views/SettingsView';
import { AdminLayout } from './views/admin/AdminLayout';
import { AuthView } from './views/AuthView';
import { GeminiSettingsModal } from './components/gemini/GeminiSettingsModal';
import { SmartVlogStudioView } from './views/SmartVlogStudioView';
import { ShieldCheck, Sparkles, Zap } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isSettingsModalOpen, closeSettingsModal } = useGemini();
  const [currentTab, setCurrentTab] = useState<string>('smartvlog');

  if (!isAuthenticated) {
    return <AuthView onSuccess={() => setCurrentTab('smartvlog')} />;
  }

  // Tool Đa Năng AI - Smart Vlog Review Đa Ngành (Dedicated Studio)
  if (currentTab === 'smartvlog' || currentTab === 'create' || currentTab === 'capcut') {
    return (
      <div className="min-h-screen bg-[#07080C] text-[#F3F4F6] flex flex-col">
        <Navbar currentTab={currentTab} onTabChange={setCurrentTab} />
        <SmartVlogStudioView />
        <GeminiSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={closeSettingsModal}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F3F4F6] flex flex-col">
      {/* Top Navbar */}
      <Navbar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentTab === 'jobs' && <JobsHistoryView onNavigateCreate={() => setCurrentTab('smartvlog')} />}
        {currentTab === 'team' && <TeamView />}
        {currentTab === 'billing' && <BillingView />}
        {currentTab === 'settings' && <SettingsView />}
        {currentTab.startsWith('admin') && (
          <AdminLayout onBackToStudio={() => setCurrentTab('smartvlog')} />
        )}
      </main>

      {/* Global Gemini API Key & Model Settings Modal */}
      <GeminiSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={closeSettingsModal}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-[#090A0F] py-6 px-6 mt-auto text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-400">TOOL ĐA NĂNG AI</span>
            <span>·</span>
            <span>Review Đa Ngành Nghề (1 Tool Làm Tất Cả)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] flex-wrap justify-center">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Anti-Abuse & Liveness Verified</span>
            </span>
            <span>·</span>
            <span className="text-indigo-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Admin: thaytiensy@gmail.com</span>
            </span>
            <span>·</span>
            <span>Client-Side Real 30fps Canvas Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <BrandProvider>
      <AuthProvider>
        <GeminiProvider>
          <AppContent />
        </GeminiProvider>
      </AuthProvider>
    </BrandProvider>
  );
}
