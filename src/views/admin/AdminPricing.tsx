import React, { useState } from 'react';
import { db } from '../../services/db';
import { PricingConfig } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { DollarSign, CheckCircle2, Save, Layers, Sparkles } from 'lucide-react';

export const AdminPricing: React.FC = () => {
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState<PricingConfig[]>(() => db.getPricing());
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleUpdateField = (planKey: string, field: keyof PricingConfig, value: any) => {
    setPlans((prev) =>
      prev.map((p) => (p.plan === planKey ? { ...p, [field]: value } : p))
    );
  };

  const handleSaveAll = () => {
    plans.forEach((p) => {
      db.updatePricing(p.plan, p);
    });

    db.logAudit({
      actorId: currentUser?.id || 'admin',
      actorEmail: currentUser?.email || 'thaytiensy@gmail.com',
      action: 'PRICING_UPDATE',
      meta: { plansCount: plans.length },
    });

    setSuccessMsg('Đã lưu cấu hình bảng giá và giới hạn gói vào cơ sở dữ liệu!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Cấu Hình Bảng Giá Dịch Vụ (PricingConfig)</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Điều chỉnh giá bán, hạn ngạch video hàng tháng và tính năng của 3 gói dịch vụ
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
        >
          <Save className="w-4 h-4" />
          <span>Lưu Toàn Bộ Cấu Hình</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 3 Plan Editors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className="bg-[#10131d] border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4"
          >
            <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{p.plan}</h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-indigo-300">
                {p.teamSeats} ghế team
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Tên gói hiển thị</label>
                <input
                  type="text"
                  value={p.name}
                  onChange={(e) => handleUpdateField(p.plan, 'name', e.target.value)}
                  className="w-full bg-[#151928] border border-neutral-800 rounded-xl p-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Giá (VNĐ/tháng)</label>
                  <input
                    type="number"
                    step="1000"
                    value={p.priceVND}
                    onChange={(e) => handleUpdateField(p.plan, 'priceVND', Number(e.target.value))}
                    className="w-full bg-[#151928] border border-neutral-800 rounded-xl p-2 text-white font-mono outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Giá USD ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={p.priceUSD}
                    onChange={(e) => handleUpdateField(p.plan, 'priceUSD', Number(e.target.value))}
                    className="w-full bg-[#151928] border border-neutral-800 rounded-xl p-2 text-white font-mono outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Giới hạn video/tháng</label>
                  <input
                    type="number"
                    value={p.videoLimitPerMonth}
                    onChange={(e) => handleUpdateField(p.plan, 'videoLimitPerMonth', Number(e.target.value))}
                    className="w-full bg-[#151928] border border-neutral-800 rounded-xl p-2 text-white font-mono outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Max mặt ghép/video</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={p.maxFacesPerVideo}
                    onChange={(e) => handleUpdateField(p.plan, 'maxFacesPerVideo', Number(e.target.value))}
                    className="w-full bg-[#151928] border border-neutral-800 rounded-xl p-2 text-white font-mono outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">
                  Danh sách tính năng (Mỗi dòng 1 tính năng)
                </label>
                <textarea
                  rows={5}
                  value={p.features.join('\n')}
                  onChange={(e) =>
                    handleUpdateField(
                      p.plan,
                      'features',
                      e.target.value.split('\n').filter((s) => s.trim().length > 0)
                    )
                  }
                  className="w-full bg-[#151928] border border-neutral-800 rounded-xl p-2 text-white font-mono text-[11px] outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
