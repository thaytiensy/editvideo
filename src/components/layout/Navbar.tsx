import React from 'react';
import { useBrand } from '../../context/BrandContext';
import { useAuth } from '../../context/AuthContext';
import { useGemini } from '../../context/GeminiContext';
import { 
  Shield, Sparkles, User, Video, Users, CreditCard, Settings, 
  ChevronDown, Check, Key, Cpu, Zap, Flame 
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const { appName } = useBrand();
  const { currentUser, allUsers, switchUser, isAdmin } = useAuth();
  const { openSettingsModal } = useGemini();
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-[#090a0f]/95 backdrop-blur-md px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onTabChange('create')}
            className="text-lg font-bold tracking-tight text-white hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-2"
          >
            <span>{appName}</span>
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono font-bold tracking-wider">
              PRO UNLIMITED
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4 text-xs font-medium text-neutral-400">
          <button
            onClick={() => onTabChange('smartvlog')}
            className={`transition-all whitespace-nowrap flex items-center gap-1.5 px-3 py-1 rounded-lg ${
              currentTab === 'smartvlog'
                ? 'bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-600/25 text-amber-300 font-extrabold border border-amber-500/50 shadow-sm shadow-amber-500/20'
                : 'text-amber-300/90 hover:text-amber-200 bg-[#171B2B] border border-amber-500/30 hover:border-amber-400'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Tool Đa Năng AI (Review Đa Ngành)</span>
            <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-black tracking-wider animate-pulse">BIG UPDATE</span>
          </button>
          <button
            onClick={() => onTabChange('capcut')}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 px-3 py-1 rounded-lg ${
              currentTab === 'capcut'
                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 font-bold border border-indigo-500/30'
                : 'text-neutral-300 hover:text-white bg-[#151722] border border-[#232532]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>CapCut Studio PRO (3 Vùng)</span>
          </button>
          <button
            onClick={() => onTabChange('create')}
            className={`transition-colors whitespace-nowrap ${
              currentTab === 'create' ? 'text-white font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            Studio Ghép Mặt Web
          </button>
          <button
            onClick={() => onTabChange('jobs')}
            className={`transition-colors whitespace-nowrap ${
              currentTab === 'jobs' ? 'text-white font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            Video Đã Xuất
          </button>
          <button
            onClick={() => onTabChange('team')}
            className={`transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === 'team' ? 'text-white font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Phân Quyền Gmail</span>
          </button>
          <button
            onClick={() => onTabChange('billing')}
            className={`transition-colors whitespace-nowrap ${
              currentTab === 'billing' ? 'text-white font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            Bảng Giá (PRO)
          </button>
          <button
            onClick={() => onTabChange('settings')}
            className={`transition-colors whitespace-nowrap ${
              currentTab === 'settings' ? 'text-white font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            Cài Đặt
          </button>
          {isAdmin && (
            <button
              onClick={() => onTabChange('admin')}
              className={`transition-colors whitespace-nowrap flex items-center gap-1 ${
                currentTab.startsWith('admin') ? 'text-indigo-400 font-semibold' : 'text-neutral-400 hover:text-indigo-300'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Actions & Unlocked Settings Button */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Optional AI Settings Button - No Lock */}
          <button
            type="button"
            onClick={openSettingsModal}
            className="group px-2.5 py-1.5 bg-[#141829] hover:bg-[#1a2035] border border-neutral-800 hover:border-indigo-500/50 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
            title="Tùy chọn cấu hình Gemini AI & Model"
          >
            <div className="flex items-center gap-1.5 text-neutral-300 group-hover:text-white">
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-xs whitespace-nowrap">Cấu Hình AI</span>
            </div>
            <span className="text-emerald-400 text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              Không Khóa Key
            </span>
          </button>

          {/* Quick User Switcher */}
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="px-2.5 py-1.5 bg-[#141724] hover:bg-[#1a1f30] border border-neutral-800 rounded-lg text-xs text-neutral-300 flex items-center gap-1.5 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-white truncate max-w-[130px]">{currentUser?.name.split(' ')[0]} ({currentUser?.role})</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#111420] border border-neutral-800 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                <div className="px-2 py-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-800/80 mb-1 flex items-center justify-between">
                  <span>Chuyển đổi tài khoản:</span>
                  <span className="text-indigo-400">PRO Mode</span>
                </div>
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentUser?.id === u.id
                        ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                        : 'text-neutral-300 hover:bg-[#1a1f30]'
                    }`}
                  >
                    <div>
                      <div className="text-white font-medium flex items-center gap-1.5">
                        <span>{u.name}</span>
                        {u.role === 'ADMIN' && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-mono">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">{u.email}</div>
                    </div>
                    {currentUser?.id === u.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CTA Create Button */}
          <button
            onClick={() => onTabChange('create')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors whitespace-nowrap shadow-sm shadow-indigo-600/20 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tạo Video</span>
          </button>
        </div>
      </div>

      {/* Mobile Submenu for tabs */}
      <div className="flex lg:hidden items-center gap-2 overflow-x-auto pt-2.5 border-t border-neutral-800/60 mt-2 text-xs">
        <button
          onClick={() => onTabChange('create')}
          className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${currentTab === 'create' ? 'bg-indigo-600 text-white font-semibold' : 'text-neutral-400'}`}
        >
          Studio Ghép Mặt
        </button>
        <button
          onClick={() => onTabChange('jobs')}
          className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${currentTab === 'jobs' ? 'bg-indigo-600 text-white font-semibold' : 'text-neutral-400'}`}
        >
          Video Đã Xuất
        </button>
        <button
          onClick={() => onTabChange('team')}
          className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${currentTab === 'team' ? 'bg-indigo-600 text-white font-semibold' : 'text-neutral-400'}`}
        >
          Chia Sẻ Gmail
        </button>
        <button
          onClick={() => onTabChange('billing')}
          className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${currentTab === 'billing' ? 'bg-indigo-600 text-white font-semibold' : 'text-neutral-400'}`}
        >
          Bảng Giá PRO
        </button>
        <button
          onClick={() => onTabChange('settings')}
          className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${currentTab === 'settings' ? 'bg-indigo-600 text-white font-semibold' : 'text-neutral-400'}`}
        >
          Cài Đặt
        </button>
      </div>
    </header>
  );
};
