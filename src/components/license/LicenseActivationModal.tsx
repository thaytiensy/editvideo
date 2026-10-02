import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Sparkles, 
  X,
  Clock,
  PhoneCall,
  Mail,
  Zap
} from 'lucide-react';
import { db } from '../../services/db';

interface LicenseActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivated?: () => void;
  lockReason?: string;
}

export const LicenseActivationModal: React.FC<LicenseActivationModalProps> = ({
  isOpen,
  onClose,
  onActivated,
  lockReason
}) => {
  const [keyInput, setKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentLic, setCurrentLic] = useState<{ isLicensed: boolean; plan?: string; expiresAt?: string; message?: string; key?: string }>({ isLicensed: false });

  const loadStatus = () => {
    const status = db.checkAppLicense();
    setCurrentLic(status);
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyChange = (val: string) => {
    // Tự động định dạng SY-XXXX-XXXX
    let clean = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!clean.startsWith('SY') && clean.length > 0) {
      clean = 'SY' + clean;
    }
    if (clean.length > 2 && clean.length <= 6) {
      clean = clean.slice(0, 2) + '-' + clean.slice(2);
    } else if (clean.length > 6) {
      clean = clean.slice(0, 2) + '-' + clean.slice(2, 6) + '-' + clean.slice(6, 10);
    }
    setKeyInput(clean.slice(0, 12));
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const formattedKey = keyInput.trim().toUpperCase();
    if (!formattedKey) {
      setErrorMsg('Vui lòng nhập mã bản quyền (License Key)!');
      return;
    }

    setLoading(true);

    try {
      // 1. Thử kích hoạt qua Local Database
      const result = db.activateLicense(formattedKey);

      // 2. Đồng thời gọi backend nếu server đang chạy
      try {
        await fetch('http://127.0.0.1:8000/auth/activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ license_key: formattedKey })
        });
      } catch (beErr) {
        // Backend offline không ảnh hưởng local
      }

      if (result.success && result.license) {
        setSuccessMsg(`Kích hoạt thành công gói ${result.license.plan}!`);
        loadStatus();
        setTimeout(() => {
          if (onActivated) onActivated();
          onClose();
        }, 1200);
      } else {
        setErrorMsg(result.error || 'Mã bản quyền không hợp lệ hoặc đã bị vô hiệu hóa.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi xử lý kích hoạt.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString || isoString === 'NEVER') return 'Vĩnh Viễn (Lifetime)';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-lg bg-[#11131a] border border-[#2b2d3d] rounded-2xl shadow-2xl overflow-hidden text-left">
        {/* Top Header Glow */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-indigo-500 to-pink-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 space-y-5">
          {/* Header Title */}
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg ${
              currentLic.isLicensed 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {currentLic.isLicensed ? <ShieldCheck className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Kích Hoạt Bản Quyền Ứng Dụng</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PRO
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Nhập License Key bản quyền dạng <code className="text-indigo-300 font-mono">SY-XXXX-XXXX</code> để mở khóa tính năng Xuất Video.
              </p>
            </div>
          </div>

          {/* Reason Alert if Locked */}
          {lockReason && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-red-300">Tính năng Export đang bị khóa:</span>
                <span>{lockReason}</span>
              </div>
            </div>
          )}

          {/* Current License Status Box */}
          <div className="p-3.5 bg-[#171924] border border-[#272a3a] rounded-xl text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Trạng thái bản quyền:</span>
              {currentLic.isLicensed ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã Kích Hoạt ({currentLic.plan})
                </span>
              ) : (
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Chưa có bản quyền hoặc đã hết hạn
                </span>
              )}
            </div>

            {currentLic.key && (
              <div className="flex items-center justify-between text-neutral-300 font-mono">
                <span className="text-neutral-400">Mã kích hoạt hiện tại:</span>
                <span className="text-indigo-300 font-semibold">{currentLic.key}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-neutral-300">
              <span className="text-neutral-400">Thời hạn sử dụng:</span>
              <span className="text-neutral-200 font-medium">{formatDate(currentLic.expiresAt)}</span>
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleActivate} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5 flex items-center justify-between">
                <span>Nhập Mã License Mới</span>
                <span className="text-[11px] text-neutral-500 font-mono">Format: SY-XXXX-XXXX</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={keyInput}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  placeholder="Ví dụ: SY-VIP9-9999"
                  className="w-full bg-[#181a26] border border-[#313548] focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white font-mono tracking-wider outline-none placeholder:text-neutral-600 transition-all uppercase"
                  maxLength={12}
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-neutral-500">
                  <KeyRound className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Error / Success Feedback */}
            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Để Sau
              </button>
              <button
                type="submit"
                disabled={loading || keyInput.length < 5}
                className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Kích Hoạt Ngay</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Contact Support & Buy License */}
          <div className="pt-4 border-t border-[#232532] text-center text-xs text-neutral-400 space-y-2">
            <p className="text-[11px]">
              Chưa có mã bản quyền hoặc cần gia hạn giấy phép ứng dụng?
            </p>
            <div className="flex items-center justify-center gap-4 text-xs font-medium">
              <a
                href="mailto:thaytiensy@gmail.com?subject=Mua%20Ban%20Quyen%20FaceSwap%20PRO"
                className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>thaytiensy@gmail.com</span>
              </a>
              <span className="text-neutral-600">|</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Hotline/Zalo Admin: 0900.000.000</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
