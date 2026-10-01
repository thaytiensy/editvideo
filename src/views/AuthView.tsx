import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBrand } from '../context/BrandContext';
import { Mail, Phone, Lock, User, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

export const AuthView: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { loginWithGoogle, loginWithEmailOrPhone, register, sendPasswordResetOtp, verifyOtpAndResetPassword } = useAuth();
  const { appName } = useBrand();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('thaytiensy@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot password OTP modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [mockReceivedOtp, setMockReceivedOtp] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle('thaytiensy@gmail.com');
      onSuccess();
    } catch (e: any) {
      setError(e.message || 'Lỗi đăng nhập Google');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'login') {
      const res = await loginWithEmailOrPhone(identifier, password);
      setLoading(false);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Đăng nhập thất bại.');
      }
    } else {
      if (!email.includes('@')) {
        setLoading(false);
        setError('Vui lòng nhập email hợp lệ.');
        return;
      }
      const res = await register({ email, phone: phone || '0988000000', name: name || 'Shop Owner PRO', password });
      setLoading(false);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Đăng ký thất bại.');
      }
    }
  };

  const handleSendOtp = async () => {
    setError(null);
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setError('Vui lòng nhập Gmail nhận mã OTP.');
      return;
    }
    const res = await sendPasswordResetOtp(forgotEmail);
    if (res.success && res.otp) {
      setOtpSent(true);
      setMockReceivedOtp(res.otp);
    } else {
      setError(res.error || 'Không thể gửi OTP.');
    }
  };

  const handleVerifyOtpAndReset = async () => {
    setError(null);
    if (newPassword.length < 6) {
      setError('Mật khẩu mới tối thiểu 6 ký tự.');
      return;
    }
    const res = await verifyOtpAndResetPassword(forgotEmail, otpCode, newPassword);
    if (res.success) {
      setForgotSuccess('Đã cập nhật mật khẩu mới thành công! Bạn có thể đăng nhập ngay.');
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotSuccess(null);
        setOtpSent(false);
      }, 2000);
    } else {
      setError(res.error || 'Xác thực OTP thất bại.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-[#10131d] border border-neutral-800 rounded-2xl w-full max-w-md p-7 shadow-2xl space-y-5 text-left relative">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-600/15 border border-indigo-500/30 rounded-2xl mx-auto flex items-center justify-center text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">{appName}</h2>
          <p className="text-xs text-neutral-400">
            Hệ Thống SaaS AI Video Ghép Mặt Đa Ngành Chuẩn Doanh Nghiệp (PRO)
          </p>
        </div>

        {/* Admin Account Helper Card */}
        <div className="p-3 bg-gradient-to-r from-indigo-950/50 to-purple-950/40 border border-indigo-500/30 rounded-xl text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Tài Khoản Admin Hệ Thống:</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              PRO UNLIMITED
            </span>
          </div>
          <div className="text-[11px] text-neutral-300 font-mono flex items-center justify-between">
            <span>Email: <strong className="text-white">thaytiensy@gmail.com</strong></span>
            <span>Pass: <strong className="text-white">12345678</strong></span>
          </div>
          <div className="text-[10px] text-neutral-400 italic">
            * Sau khi đăng nhập, Admin có thể đổi mật khẩu mới trong mục Cài Đặt.
          </div>
        </div>

        {/* 1-Tap Google OAuth */}
        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 bg-white hover:bg-neutral-100 text-neutral-900 rounded-xl font-semibold text-xs flex items-center justify-center gap-3 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Đăng Nhập 1 Chạm Bằng Google (thaytiensy@gmail.com)</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-neutral-800" />
          <span className="text-[11px] text-neutral-500 uppercase tracking-wider">hoặc Đăng Nhập Email / Phone</span>
          <div className="flex-1 h-px bg-neutral-800" />
        </div>

        {/* Form Login / Register */}
        <form onSubmit={handleFormSubmit} className="space-y-3.5">
          {mode === 'register' ? (
            <>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Họ và Tên</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-[#151928] border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tenban@gmail.com"
                    className="w-full bg-[#151928] border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Số điện thoại</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0909xxxxxx"
                    className="w-full bg-[#151928] border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Email hoặc Số điện thoại</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="thaytiensy@gmail.com hoặc 0909xxxxxx"
                  className="w-full bg-[#151928] border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 outline-none font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-neutral-400">Mật khẩu</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300"
                >
                  Quên mật khẩu?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#151928] border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 outline-none font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
          >
            <span>{mode === 'login' ? 'Đăng Nhập Hệ Thống' : 'Tạo Tài Khoản Mới'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle mode */}
        <div className="text-center text-xs text-neutral-400">
          {mode === 'login' ? (
            <span>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Đăng ký thành viên PRO
              </button>
            </span>
          ) : (
            <span>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Quay lại Đăng nhập
              </button>
            </span>
          )}
        </div>

        {/* Security badge footer */}
        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-center gap-2 text-[11px] text-neutral-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Bảo mật 2 lớp Liveness & Chống giả mạo Deepfake</span>
        </div>
      </div>

      {/* Forgot Password OTP Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#121524] border border-neutral-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
              <KeyRound className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Khôi Phục Mật Khẩu Qua Gmail</h3>
            </div>

            {!otpSent ? (
              <div className="space-y-3">
                <p className="text-xs text-neutral-400">
                  Nhập địa chỉ Gmail của bạn để nhận mã OTP xác thực (6 chữ số).
                </p>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Gmail đăng ký</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="thaytiensy@gmail.com"
                    className="w-full bg-[#181d32] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 bg-neutral-800 text-neutral-300 rounded-xl text-xs"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                  >
                    Gửi Mã OTP
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300">
                  Đã gửi OTP đến <strong>{forgotEmail}</strong>.
                  {mockReceivedOtp && (
                    <div className="mt-1 font-mono text-[11px] text-emerald-400">
                      (Mã OTP thử nghiệm: <strong>{mockReceivedOtp}</strong>)
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Mã xác thực (6 số)</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-[#181d32] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono text-center tracking-widest text-base outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full bg-[#181d32] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-indigo-500"
                  />
                </div>

                {forgotSuccess && (
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{forgotSuccess}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="flex-1 py-2 bg-neutral-800 text-neutral-300 rounded-xl text-xs"
                  >
                    Gửi lại OTP
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOtpAndReset}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                  >
                    Xác Nhận Đổi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
