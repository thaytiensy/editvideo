import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminOverview } from './AdminOverview';
import { AdminTemplates } from './AdminTemplates';
import { AdminUsers } from './AdminUsers';
import { AdminPricing } from './AdminPricing';
import { AdminBranding } from './AdminBranding';
import { 
  BarChart3, Video, Users, DollarSign, Palette, 
  ShieldAlert, ShieldCheck, ArrowLeft 
} from 'lucide-react';

interface AdminLayoutProps {
  onBackToStudio: () => void;
}

type AdminSubTab = 'overview' | 'templates' | 'users' | 'pricing' | 'branding';

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToStudio }) => {
  const { currentUser, isAdmin, switchUser, allUsers } = useAuth();
  const [subTab, setSubTab] = useState<AdminSubTab>('overview');

  // Guard for role ADMIN
  if (!isAdmin) {
    const adminUser = allUsers.find((u) => u.role === 'ADMIN');
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-[#10131d] border border-red-500/30 rounded-2xl text-center space-y-4 shadow-2xl">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-base font-bold text-white">Yêu Cầu Quyền Quản Trị Viên (ADMIN)</h2>
        <p className="text-xs text-neutral-400">
          Tài khoản hiện tại ({currentUser?.email}) có vai trò <strong>{currentUser?.role}</strong>, không được phép truy cập Admin Panel.
        </p>

        {adminUser && (
          <button
            type="button"
            onClick={() => switchUser(adminUser.id)}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
          >
            Chuyển nhanh sang tài khoản Admin ({adminUser.name})
          </button>
        )}

        <button
          type="button"
          onClick={onBackToStudio}
          className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs transition-colors"
        >
          Quay lại Studio
        </button>
      </div>
    );
  }

  const NAV_ITEMS: { key: AdminSubTab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Tổng Quan & MRR', icon: BarChart3 },
    { key: 'templates', label: 'Video Đã Render', icon: Video },
    { key: 'users', label: 'Người Dùng & Log', icon: Users },
    { key: 'pricing', label: 'Bảng Giá & Quota', icon: DollarSign },
    { key: 'branding', label: 'Thương Hiệu & Màu', icon: Palette },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Admin Subnav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStudio}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            title="Quay lại Studio"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>Admin Console</span>
            </h1>
            <p className="text-[11px] text-neutral-400">Dành riêng cho Quản trị viên cấp cao</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#121522] rounded-xl border border-neutral-800 overflow-x-auto text-xs font-medium">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = subTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setSubTab(item.key)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subtab Contents */}
      {subTab === 'overview' && <AdminOverview />}
      {subTab === 'templates' && <AdminTemplates />}
      {subTab === 'users' && <AdminUsers />}
      {subTab === 'pricing' && <AdminPricing />}
      {subTab === 'branding' && <AdminBranding />}
    </div>
  );
};
