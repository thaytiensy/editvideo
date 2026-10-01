import React, { useState, useEffect } from 'react';
import { useGemini } from '../../context/GeminiContext';
import { GeminiModelId } from '../../types';
import { 
  Key, Cpu, ExternalLink, CheckCircle2, AlertCircle, Eye, EyeOff, 
  X, Sparkles, ShieldCheck, RefreshCw, Zap, Award, ShieldAlert
} from 'lucide-react';

interface GeminiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mandatory?: boolean;
}

export const GeminiSettingsModal: React.FC<GeminiSettingsModalProps> = ({
  isOpen,
  onClose,
  mandatory = false,
}) => {
  const { apiKey, selectedModel, models, saveSettings, testConnection } = useGemini();

  const [inputKey, setInputKey] = useState(apiKey);
  const [modelChoice, setModelChoice] = useState<GeminiModelId>(selectedModel);
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; rawError?: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInputKey(apiKey);
      setModelChoice(selectedModel);
      setTestResult(null);
      setSavedSuccess(false);
    }
  }, [isOpen, apiKey, selectedModel]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!inputKey.trim()) {
      setTestResult({
        success: false,
        message: 'Vui lòng nhập API Key trước khi kiểm tra.',
      });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const res = await testConnection(inputKey.trim(), modelChoice);
    setIsTesting(false);
    setTestResult(res);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(inputKey.trim(), modelChoice);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#10131e] border border-neutral-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-neutral-800/80 pb-4">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Thiết Lập Model AI & Gemini API Key</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                AI Studio
              </span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Tự nhập Gemini API Key cá nhân để chạy tính năng sinh kịch bản video AI thương mại 4 ngành hàng và tối ưu hóa xử lý prompt
            </p>
          </div>
        </div>

        {/* AI Studio Key Guidance Notice */}
        <div className="mb-5 p-3.5 bg-gradient-to-r from-indigo-950/40 via-[#15192d] to-purple-950/30 border border-indigo-500/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Chưa có Google Gemini API Key?</span>
            </div>
            <p className="text-neutral-400 text-[11px]">
              Tạo tài khoản và lấy mã API key miễn phí tại Google AI Studio trong 30 giây.
            </p>
          </div>
          <a
            href="https://aistudio.google.com/api-keys"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-[11px] flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 whitespace-nowrap"
          >
            <span>Lấy Key Tại AI Studio</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* API Key Input Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>Google Gemini API Key</span>
                <span className="text-red-400">*</span>
              </label>
              {apiKey && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Đã lưu trong localStorage
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#141829] border border-neutral-800 rounded-xl pl-3.5 pr-24 py-2.5 text-xs text-white placeholder-neutral-500 font-mono outline-none focus:border-indigo-500 transition-colors"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded transition-colors"
                  title={showKey ? 'Ẩn key' : 'Hiện key'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={isTesting || !inputKey.trim()}
                  className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 text-[11px] rounded-lg font-medium transition-colors flex items-center gap-1"
                >
                  {isTesting ? (
                    <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
                  ) : (
                    <span>Test</span>
                  )}
                </button>
              </div>
            </div>

            {/* Test result messages */}
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
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-medium">{testResult.message}</div>
                  {testResult.rawError && (
                    <div className="font-mono text-[11px] mt-1 text-red-200/90 bg-black/40 p-1.5 rounded">
                      Nguyên văn lỗi: {testResult.rawError}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Model AI Selection Cards */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Chọn Mô Hình AI Khởi Đầu (Model AI Cards)</span>
              </label>
              <span className="text-[11px] text-neutral-400">Tự động Fallback khi lỗi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {models.map((m) => {
                const isSelected = modelChoice === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setModelChoice(m.id)}
                    className={`cursor-pointer rounded-xl border p-3.5 flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/25 ring-2 ring-indigo-500/30 shadow-lg'
                        : 'border-neutral-800 bg-[#121524] hover:border-neutral-700 hover:bg-[#15192c]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 font-semibold">
                          {m.badge}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1">{m.name}</h4>
                      <p className="text-[11px] text-neutral-400 leading-snug line-clamp-3">
                        {m.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                      <span>{m.tag}</span>
                      {m.isDefault && (
                        <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Automatic Fallback Notice as mandated in AI_INSTRUCTIONS */}
          <div className="p-3 bg-[#131625] border border-neutral-800 rounded-xl space-y-1.5 text-xs text-neutral-300">
            <div className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Cơ chế Tự Động Retry & Fallback (Quy tắc hệ thống)</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Nếu mô hình được chọn gặp lỗi giới hạn hạn mức (VD: <code className="text-amber-300">429 RESOURCE_EXHAUSTED</code>), hệ thống sẽ <strong>tự động chuyển tiếp</strong> sang mô hình kế tiếp theo chuỗi: 
              <span className="text-indigo-300 font-mono font-medium ml-1">gemini-3-flash-preview &rarr; gemini-3-pro-preview &rarr; gemini-2.5-flash</span>. 
              Kết quả các bước trước đó luôn được bảo toàn nguyên vẹn.
            </p>
          </div>

          {/* Saved notification */}
          {savedSuccess && (
            <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Đã lưu thành công Gemini API Key & Mô hình vào trình duyệt!</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            {(!mandatory || apiKey) && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Đóng
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/25 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Lưu Cài Đặt Model & Key</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
