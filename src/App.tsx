import React, { useState } from 'react';
import { BrandProvider } from './context/BrandContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GeminiProvider, useGemini } from './context/GeminiContext';
import { Navbar } from './components/layout/Navbar';
import { CapcutStudioView } from './views/CapcutStudioView';
import { CreateStudioView } from './views/CreateStudioView';
import { JobsHistoryView } from './views/JobsHistoryView';
import { TeamView } from './views/TeamView';
import { BillingView } from './views/BillingView';
import { SettingsView } from './views/SettingsView';
import { AdminLayout } from './views/admin/AdminLayout';
import { AuthView } from './views/AuthView';
import { GeminiSettingsModal } from './components/gemini/GeminiSettingsModal';
import { ShieldCheck, Sparkles, Zap } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const { isSettingsModalOpen, closeSettingsModal } = useGemini();
  const [currentTab, setCurrentTab] = useState<string>('capcut');

  if (!isAuthenticated) {
    return <AuthView onSuccess={() => setCurrentTab('capcut')} />;
  }

  // CapCut Pro Desktop Studio View (Full viewport mode)
  if (currentTab === 'capcut') {
    return <CapcutStudioView onSwitchView={() => setCurrentTab('create')} />;
  }

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F3F4F6] flex flex-col">
      {/* Top Navbar adhering to 3-zone contract */}
      <Navbar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentTab === 'create' && <CreateStudioView />}
        {currentTab === 'jobs' && <JobsHistoryView onNavigateCreate={() => setCurrentTab('capcut')} />}
        {currentTab === 'team' && <TeamView />}
        {currentTab === 'billing' && <BillingView />}
        {currentTab === 'settings' && <SettingsView />}
        {currentTab.startsWith('admin') && (
          <AdminLayout onBackToStudio={() => setCurrentTab('capcut')} />
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
            <span className="font-semibold text-neutral-400">Art Video Maker PRO</span>
            <span>·</span>
            <span>Multi-Industry AI Face-Swap SaaS (PRO UNLIMITED)</span>
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
            <span>Real AI Video & Image Engine</span>
            <span>·</span>
            <span>Auto Face Tracking 100% Client-Side</span>
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
