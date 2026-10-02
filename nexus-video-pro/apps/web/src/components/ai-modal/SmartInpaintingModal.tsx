import React, { useState } from 'react';
import { Wand2, Eraser, Sparkles } from 'lucide-react';

interface SmartInpaintingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartInpaintingModal: React.FC<SmartInpaintingModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'sam2_box' | 'point_click'>('sam2_box');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#101424] border border-[#2B3250] rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-xs select-none">
        <div className="flex items-center justify-between border-b border-[#202742] pb-3">
          <div className="flex items-center gap-2">
            <Eraser className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">SAM 2 & ProPainter Smart Video Inpainting</h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-lg">✕</button>
        </div>

        <p className="text-neutral-300">
          Xóa vật thể, người đi ngang qua hoặc watermark khỏi video bằng mô hình Segment Anything Model 2 và ProPainter temporal flow.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode('sam2_box')}
            className={`p-3 rounded-2xl border text-left space-y-1 transition-all ${
              mode === 'sam2_box' ? 'border-amber-400 bg-amber-500/10' : 'border-[#232840] bg-[#141829]'
            }`}
          >
            <span className="font-bold text-neutral-200 block">SAM 2 Box Tracking</span>
            <span className="text-[10px] text-neutral-400">Vẽ khung bao quanh vật thể cần xóa</span>
          </button>

          <button
            onClick={() => setMode('point_click')}
            className={`p-3 rounded-2xl border text-left space-y-1 transition-all ${
              mode === 'point_click' ? 'border-amber-400 bg-amber-500/10' : 'border-[#232840] bg-[#141829]'
            }`}
          >
            <span className="font-bold text-neutral-200 block">Point-and-Click Mask</span>
            <span className="text-[10px] text-neutral-400">Chấm 1 điểm để AI tự bám đuổi phân đoạn</span>
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-[#202742]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300">Đóng</button>
          <button
            onClick={() => {
              alert('Đã bắt đầu bám đuổi và xóa vật thể qua SAM 2!');
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold shadow-lg shadow-amber-500/20"
          >
            Bắt Đầu Xóa Vật Thể
          </button>
        </div>
      </div>
    </div>
  );
};
