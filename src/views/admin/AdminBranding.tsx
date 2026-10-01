import React, { useState } from 'react';
import { useBrand } from '../../context/BrandContext';
import { Palette, CheckCircle2, Video, Sparkles, Building, Type, Image } from 'lucide-react';

const COLOR_PALETTES = [
  { name: 'Indigo Sleek', hex: '#6366f1' },
  { name: 'Emerald Neo', hex: '#10b981' },
  { name: 'Violet Cyber', hex: '#8b5cf6' },
  { name: 'Rose Luxury', hex: '#f43f5e' },
  { name: 'Amber Glow', hex: '#f59e0b' },
  { name: 'Sky Electric', hex: '#0ea5e9' },
];

export const AdminBranding: React.FC = () => {
  const { appName, logoUrl, primaryColor, watermarkText, updateBranding } = useBrand();

  const [formAppName, setFormAppName] = useState(appName);
  const [formLogoUrl, setFormLogoUrl] = useState(logoUrl);
  const [formColor, setFormColor] = useState(primaryColor);
  const [formWatermark, setFormWatermark] = useState(watermarkText);

  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranding({
      appName: formAppName,
      logoUrl: formLogoUrl,
      primaryColor: formColor,
      watermarkText: formWatermark,
    });
    setSavedMsg('Đã cập nhật Branding toàn hệ thống! Hiệu ứng màu và watermark thay đổi ngay lập tức không cần build lại.');
    setTimeout(() => setSavedMsg(null), 4000);
  };

  return (
    <div className="space-y-6 text-left max-w-4xl">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-400" />
          <span>Tùy Chỉnh Thương Hiệu Toàn Hệ Thống (Global Branding)</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Đổi Logo, Tên App, Màu Primary và Watermark bản quyền · Cập nhật ngay trong Context Provider không cần redeploy
        </p>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Form (7 cols) */}
        <div className="md:col-span-7 bg-[#10131d] border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="text-[11px] text-neutral-400 flex items-center gap-1.5 mb-1">
                <Type className="w-3.5 h-3.5 text-indigo-400" /> Tên ứng dụng SaaS (App Name)
              </label>
              <input
                type="text"
                required
                value={formAppName}
                onChange={(e) => setFormAppName(e.target.value)}
                placeholder="Art Video Maker PRO"
                className="w-full bg-[#151928] border border-neutral-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 flex items-center gap-1.5 mb-1">
                <Image className="w-3.5 h-3.5 text-indigo-400" /> Logo URL
              </label>
              <input
                type="text"
                required
                value={formLogoUrl}
                onChange={(e) => setFormLogoUrl(e.target.value)}
                className="w-full bg-[#151928] border border-neutral-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500 font-mono text-[11px]"
              />
            </div>

            {/* Primary Accent Color Selection */}
            <div>
              <label className="text-[11px] text-neutral-400 flex items-center gap-1.5 mb-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-400" /> Màu Chủ Đạo (Primary Accent Color)
              </label>
              
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="color"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  className="w-9 h-9 rounded-lg bg-transparent border border-neutral-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  className="w-28 bg-[#151928] border border-neutral-800 rounded-lg p-2 text-white font-mono text-xs"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {COLOR_PALETTES.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setFormColor(c.hex)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1.5 border transition-all ${
                      formColor.toLowerCase() === c.hex.toLowerCase()
                        ? 'border-white text-white font-semibold shadow-sm'
                        : 'border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.hex }} />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Nội Dung Watermark Đóng Dấu Video
              </label>
              <input
                type="text"
                required
                value={formWatermark}
                onChange={(e) => setFormWatermark(e.target.value)}
                placeholder="Art Video PRO • ZenStudio"
                className="w-full bg-[#151928] border border-neutral-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500 font-mono"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Watermark này sẽ được in lên góc trên bên phải của mọi video khi xuất bản
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/20"
            >
              Áp Dụng Thay Đổi Ngay Lập Tức
            </button>
          </form>
        </div>

        {/* Right Preview (5 cols) */}
        <div className="md:col-span-5 bg-[#10131d] border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="border-b border-neutral-800 pb-3">
            <h4 className="text-xs font-semibold text-white">Xem Thử Live Render Video</h4>
            <p className="text-[11px] text-neutral-400 mt-0.5">Watermark và màu chủ đạo hiển thị trực tiếp</p>
          </div>

          <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-neutral-800">
            {/* Mock video canvas */}
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-black flex items-center justify-center">
              <Video className="w-10 h-10 text-neutral-700" />
            </div>

            {/* Live Watermark Stamp */}
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[10px] font-mono text-white/95 border border-white/10 shadow-lg">
              {formWatermark || 'Art Video PRO'}
            </div>

            {/* Live Button Tint Preview */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px]">
              <div
                className="px-3 py-1 rounded text-white font-semibold shadow-md"
                style={{ backgroundColor: formColor }}
              >
                Nút Call-To-Action Mẫu
              </div>
              <span className="text-neutral-400 font-mono text-[10px]">1080p 60fps</span>
            </div>
          </div>

          <div className="p-3 bg-[#151928] rounded-xl border border-neutral-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Tên App:</span>
              <span className="text-white font-semibold">{formAppName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Mã màu:</span>
              <span className="font-mono text-indigo-300">{formColor}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
