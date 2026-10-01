import React, { useState } from 'react';
import { CreditCard, QrCode, CheckCircle2, ShieldCheck, X, RefreshCw, Zap } from 'lucide-react';
import { PricingConfig } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  plan: PricingConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  plan,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, refreshUserData } = useAuth();
  const [method, setMethod] = useState<'momo' | 'stripe'>('momo');
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  // Form states for Stripe
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  if (!isOpen || !plan) return null;

  const handleSimulateWebhookPayment = () => {
    if (!currentUser) return;
    setLoading(true);

    setTimeout(() => {
      // Simulate /api/webhook/payment execution
      db.updateUser(currentUser.id, {
        plan: plan.plan,
        monthlyQuota: plan.videoLimitPerMonth,
      });

      db.logAudit({
        actorId: currentUser.id,
        actorEmail: currentUser.email,
        action: 'FACE_SWAP',
        meta: {
          webhook: '/api/webhook/payment',
          event: 'PAYMENT_SUCCESS',
          provider: method.toUpperCase(),
          plan: plan.plan,
          amountVND: plan.priceVND,
          currency: 'VND',
        },
      });

      refreshUserData();
      setLoading(false);
      setPaid(true);

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      setTimeout(() => {
        onSuccess();
        onClose();
        setPaid(false);
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#10131d] border border-neutral-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Nâng Cấp {plan.name}</h3>
            <p className="text-xs text-neutral-400">
              {plan.priceVND.toLocaleString('vi-VN')} đ/tháng · Kích hoạt tức thì qua Webhook
            </p>
          </div>
        </div>

        {paid ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-semibold text-white">Thanh toán thành công!</h4>
            <p className="text-xs text-neutral-400">
              Đã nhận webhook /api/webhook/payment. Tài khoản của bạn đã được nâng cấp lên gói {plan.name}.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Payment Gateway Toggle */}
            <div className="flex items-center gap-2 p-1 bg-[#151927] rounded-xl border border-neutral-800 text-xs font-medium">
              <button
                type="button"
                onClick={() => setMethod('momo')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  method === 'momo'
                    ? 'bg-[#a50064] text-white shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4" /> Ví MoMo (QR Code)
              </button>
              <button
                type="button"
                onClick={() => setMethod('stripe')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  method === 'stripe'
                    ? 'bg-[#635bff] text-white shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Thẻ Quốc Tế (Stripe)
              </button>
            </div>

            {/* Method Content */}
            {method === 'momo' ? (
              <div className="p-4 bg-[#141724] border border-neutral-800 rounded-xl flex flex-col items-center justify-center space-y-3 text-center">
                {/* Simulated MoMo QR */}
                <div className="p-3 bg-white rounded-xl shadow-md">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=MOMO_PAY_ARTVIDEO_PRO_MOCK"
                    alt="MoMo QR"
                    className="w-36 h-36"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-white">
                    Quét mã QR bằng ứng dụng MoMo
                  </span>
                  <p className="text-[11px] text-neutral-400">
                    Số tiền: <strong className="text-pink-400 font-mono">{plan.priceVND.toLocaleString('vi-VN')} đ</strong> · Nội dung: AVM_{currentUser?.id.slice(-6)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#141724] border border-neutral-800 rounded-xl space-y-3 text-xs">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Số thẻ tín dụng / ghi nợ</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-[#0d0f17] border border-neutral-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Hết hạn (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      className="w-full bg-[#0d0f17] border border-neutral-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Mã bảo mật CVC</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full bg-[#0d0f17] border border-neutral-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security note */}
            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Bảo mật 256-bit SSL · Tự động kích hoạt sau khi webhook xác nhận</span>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleSimulateWebhookPayment}
              className={`w-full py-3 px-4 font-semibold text-xs rounded-xl text-white flex items-center justify-center gap-2 transition-colors shadow-lg ${
                method === 'momo'
                  ? 'bg-[#a50064] hover:bg-[#8e0056] shadow-pink-600/20'
                  : 'bg-[#635bff] hover:bg-[#5249ea] shadow-indigo-600/20'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Đang chờ Webhook /api/webhook/payment...
                </>
              ) : (
                <>
                  Xác nhận thanh toán ({plan.priceVND.toLocaleString('vi-VN')} đ)
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
