'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Film, 
  Video, 
  Wand2, 
  Layers, 
  ArrowRight, 
  Play, 
  Flame, 
  UserCheck 
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#07080C] text-[#F3F4F6] flex flex-col p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#1E2338] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/30">
            N
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>NEXUS VIDEO PRO</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                ENTERPRISE
              </span>
            </h1>
            <p className="text-xs text-neutral-400">Elite Non-Linear Video Editor & Generative AI Studio</p>
          </div>
        </div>

        <Link
          href="/editor/nexus-proj-01"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-400 transition-all"
        >
          <Film className="w-4 h-4" />
          <span>Mở NLE Studio</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Featured AI Engines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0D101C] border border-[#1E2338] space-y-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white">InsightFace & LivePortrait Reenactment</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Ghép mặt tự động qua InsightFace buffalo_l, inswapper_128 kết hợp bộ lọc làm mờ viền 25px và EMA smoothing.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D101C] border border-[#1E2338] space-y-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white">Wan 2.1 & Kling Image-to-Video</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Sinh chuyển động camera 3D chuẩn điện ảnh (Pan, Zoom, Orbit) cho các phân cảnh review sản phẩm.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D101C] border border-[#1E2338] space-y-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white">IP-Adapter FaceID Character Lock</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Giữ đồng nhất danh tính nhân vật review và giọng nói đạt tỉ lệ 95-100% xuyên suốt toàn bộ phân cảnh.
          </p>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-neutral-200">Dự Án Gần Đây</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link
            href="/editor/nexus-proj-01"
            className="group rounded-2xl overflow-hidden border border-[#232840] bg-[#0E111E] hover:border-amber-400 transition-all flex flex-col"
          >
            <div className="aspect-video relative overflow-hidden bg-black">
              <img
                src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80"
                alt="Project Thumbnail"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-amber-400">
                1080p 30fps
              </span>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                Review Bình Siêu Tốc Gốm Sứ (Viral TikTok)
              </h3>
              <p className="text-[10px] text-neutral-500 mt-1">Cập nhật 5 phút trước · 4 phân cảnh</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
