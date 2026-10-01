import React, { useState } from 'react';
import { db } from '../services/db';
import { PricingConfig, UserPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import { PaymentModal } from '../components/payment/PaymentModal';
import { Check, Sparkles, Zap, Shield, HelpCircle } from 'lucide-react';

export const BillingView: React.FC = () => {
  const { currentUser, refreshUserData } = useAuth();
  const pricingPlans = db.getPricing();

  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<PricingConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectPlan = (plan: PricingConfig) => {
    if (plan.plan === currentUser?.plan) return;
    if (plan.plan === 'FREE') {
      // Downgrade to free directly
      if (currentUser) {
        db.updateUser(currentUser.id, { plan: 'FREE', monthlyQuota: 5 });
        refreshUserData();
      }
      return;
    }
    setSelectedPlanForPayment(plan);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 border-b border-neutral-800 pb-7">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/25 rounded-full text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Bảng Giá Minh Bạch · Kích Hoạt Tức Thì
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Chọn Gói Dịch Vụ Phù Hợp Với Quy Mô Shop
        </h1>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Tối ưu chi phí sản xuất video quảng cáo thời trang, mỹ phẩm, nội thất với công nghệ AI Face-swap tự động.
        </p>
      </div>

      {/* PRO Activated Banner */}
      <div className="max-w-4xl mx-auto p-4 bg-gradient-to-r from-indigo-950/60 via-[#161a2e] to-purple-950/50 border border-indigo-500/40 rounded-2xl flex items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/40 rounded-xl text-indigo-400 shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Toàn Bộ Ứng Dụng Đã Nâng Cấp Lên Gói PRO UNLIMITED</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Hạn mức 9,999 video/tháng · Ghép tối đa 5 khuôn mặt · Đổi mặt video tự động bằng AI Tracker · Tạo video nghệ thuật từ ảnh
            </p>
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end shrink-0">
          <span className="text-xs font-mono text-indigo-300 font-semibold">{currentUser?.email}</span>
          <span className="text-[11px] text-neutral-400 font-mono">Gói: PRO UNLIMITED</span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
        {pricingPlans.map((plan) => {
          const isCurrent = currentUser?.plan === plan.plan;
          const isPro = plan.plan === 'PRO';

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all relative ${
                isPro
                  ? 'bg-[#121629] border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl shadow-indigo-600/10'
                  : 'bg-[#10131e] border-neutral-800'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-600 text-white font-semibold text-[10px] rounded-full uppercase tracking-wider shadow-sm">
                  Khuyên Dùng Cho Shop
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white">{plan.name}</h3>
                </div>

                {/* Price */}
                <div className="mt-3 mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                      {plan.priceVND === 0 ? 'Miễn Phí' : `${plan.priceVND.toLocaleString('vi-VN')} đ`}
                    </span>
                    {plan.priceVND > 0 && <span className="text-xs text-neutral-400">/tháng</span>}
                  </div>
                  {plan.priceUSD > 0 && (
                    <span className="text-[11px] text-neutral-400 font-mono">
                      (khoảng ${plan.priceUSD}/tháng thanh toán Stripe quốc tế)
                    </span>
                  )}
                </div>

                {/* Core limits */}
                <div className="p-3 bg-[#151928] rounded-xl border border-neutral-800/80 mb-5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Hạn mức video:</span>
                    <strong className="text-white font-mono">{plan.videoLimitPerMonth} video/tháng</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Khuôn mặt đồng thời:</span>
                    <strong className="text-white font-mono">Tối đa {plan.maxFacesPerVideo} mặt/video</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Số thành viên Shop:</span>
                    <strong className="text-white font-mono">{plan.teamSeats} nhân viên</strong>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 text-xs text-neutral-300">
                  <span className="text-[11px] text-neutral-400 font-semibold block mb-2 uppercase tracking-wider">
                    Tính năng bao gồm:
                  </span>
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4 border-t border-neutral-800/80">
                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrent}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    isCurrent
                      ? 'bg-neutral-800 text-neutral-400 cursor-default'
                      : isPro
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                  }`}
                >
                  {isCurrent ? (
                    'Gói Đang Sử Dụng'
                  ) : plan.plan === 'FREE' ? (
                    'Hạ về Gói Miễn Phí'
                  ) : (
                    <>
                      <Zap className="w-4 h-4" /> Nâng Cấp Qua MoMo / Stripe
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        plan={selectedPlanForPayment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          refreshUserData();
        }}
      />
    </div>
  );
};
