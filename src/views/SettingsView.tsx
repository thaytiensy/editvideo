import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBrand } from '../context/BrandContext';
import { useGemini } from '../context/GeminiContext';
import { 
  User, Lock, UploadCloud, CheckCircle2, AlertCircle, Shield, 
  Building2, Key, ExternalLink, Eye, EyeOff 
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentUser, updateProfile, updatePassword } = useAuth();
  const { currentShop } = useBrand();

  const [name, setName] = useState(currentUser?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    updateProfile({ name, avatarUrl });
    setProfileMsg('Đã cập nhật thông tin hồ sơ và ảnh đại diện thành công!');
    setTimeout(() => setProfileMsg(null), 3000);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải từ 6 ký tự trở lên.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Xác nhận mật khẩu không khớp.');
      return;
    }

    const res = await updatePassword(newPassword);
    if (res.success) {
      setPasswordMsg('Đã đổi mật khẩu thành công!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(null), 3000);
    } else {
      setErrorMsg(res.error || 'Đổi mật khẩu thất bại.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7 pb-16 text-left">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-white">Cài Đặt Tài Khoản & Bảo Mật</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Cập nhật thông tin cá nhân, ảnh đại diện và quản lý mật khẩu truy cập an toàn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-[#10131d] border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span>Hồ Sơ & Ảnh Đại Diện</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {currentUser?.role}
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Avatar Preview */}
            <div className="flex items-center gap-4">
              <img
                src={avatarUrl || currentUser?.avatarUrl}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-neutral-700"
              />
              <div className="flex-1 space-y-1">
                <label className="text-[11px] text-neutral-400 block">Link ảnh đại diện (URL)</label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#151928] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Tên hiển thị</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#151928] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Email đăng nhập</label>
              <input
                type="text"
                disabled
                value={currentUser?.email}
                className="w-full bg-[#12141f] border border-neutral-800/80 rounded-xl px-3 py-2 text-xs text-neutral-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Số điện thoại</label>
              <input
                type="text"
                disabled
                value={currentUser?.phone}
                className="w-full bg-[#12141f] border border-neutral-800/80 rounded-xl px-3 py-2 text-xs text-neutral-400 cursor-not-allowed font-mono"
              />
            </div>

            {profileMsg && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{profileMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              Lưu Thay Đổi Hồ Sơ
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-[#10131d] border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>Đổi Mật Khẩu Truy Cập</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">Mật khẩu mới tối thiểu 6 ký tự bảo mật</p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Mật khẩu mới</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#151928] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#151928] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {passwordMsg && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{passwordMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-2.5 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              Cập Nhật Mật Khẩu
            </button>
          </form>

          {/* Shop information preview */}
          <div className="mt-6 pt-5 border-t border-neutral-800 space-y-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Thông Tin Shop Trực Thuộc
            </span>
            <div className="p-3 bg-[#151928] rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-neutral-400" />
                <span className="text-white font-medium">{currentShop?.name}</span>
              </div>
              <span className="text-indigo-400 font-mono text-[11px]">{currentUser?.plan}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gemini AI & Model Settings Card */}
      <GeminiSettingsInlineCard />
    </div>
  );
};

const GeminiSettingsInlineCard: React.FC = () => {
  const { apiKey, selectedModel, models, saveSettings, testConnection } = useGemini();
  const [keyInput, setKeyInput] = useState(apiKey);
  const [modelInput, setModelInput] = useState(selectedModel);
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; rawError?: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleTest = async () => {
    if (!keyInput.trim()) return;
    setIsTesting(true);
    setTestResult(null);
    const res = await testConnection(keyInput.trim(), modelInput);
    setIsTesting(false);
    setTestResult(res);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(keyInput.trim(), modelInput);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-[#10131d] border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="border-b border-neutral-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-400" />
            <span>Cấu Hình Google Gemini AI & Model Dự Phòng</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Áp dụng cho tính năng sinh kịch bản video AI thương mại 4 ngành hàng và tối ưu hóa xử lý prompt
          </p>
        </div>

        <a
          href="https://aistudio.google.com/api-keys"
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <span>Lấy Key Tại Google AI Studio</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[11px] text-neutral-400 block font-medium">Gemini API Key</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-[#151928] border border-neutral-800 rounded-xl pl-3 pr-24 py-2.5 text-xs text-white font-mono outline-none focus:border-indigo-500"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="p-1 text-neutral-400 hover:text-white rounded"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleTest}
                disabled={isTesting || !keyInput.trim()}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 text-[11px] rounded-lg font-medium"
              >
                {isTesting ? 'Đang test...' : 'Kiểm tra'}
              </button>
            </div>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/40 text-red-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div>{testResult.message}</div>
                {testResult.rawError && (
                  <div className="font-mono text-[10px] mt-1 text-red-300 bg-black/40 p-1.5 rounded">
                    Lỗi API: {testResult.rawError}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Model Selection Cards */}
        <div className="space-y-2">
          <label className="text-[11px] text-neutral-400 block font-medium">
            Chọn Mô Hình AI Khởi Đầu (Model Cards)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {models.map((m) => {
              const isSelected = modelInput === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setModelInput(m.id)}
                  className={`cursor-pointer rounded-xl border p-3 flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500/30'
                      : 'border-neutral-800 bg-[#141829] hover:border-neutral-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono text-indigo-400 font-bold">{m.badge}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <div className="text-xs font-bold text-white mb-0.5">{m.name}</div>
                    <p className="text-[10px] text-neutral-400 line-clamp-2">{m.description}</p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-neutral-800/80 text-[10px] font-mono text-neutral-400 flex justify-between">
                    <span>{m.tag}</span>
                    {m.isDefault && <span className="text-emerald-400 font-bold">Default</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {savedSuccess && (
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Đã lưu thành công cấu hình Gemini API Key và Mô hình AI!</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
        >
          Lưu Cài Đặt Gemini AI
        </button>
      </form>
    </div>
  );
};
