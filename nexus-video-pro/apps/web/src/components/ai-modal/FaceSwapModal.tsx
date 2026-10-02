import React, { useState } from 'react';
import { Sparkles, Upload, RefreshCw, CheckCircle2 } from 'lucide-react';

interface FaceSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FaceSwapModal: React.FC<FaceSwapModalProps> = ({ isOpen, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [featherBlur, setFeatherBlur] = useState(25);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#101424] border border-[#2B3250] rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl text-xs select-none">
        <div className="flex items-center justify-between border-b border-[#202742] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">InsightFace & LivePortrait Swap Hub</h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-lg">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border border-dashed border-[#2D334D] rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 bg-[#141829]">
            <Upload className="w-8 h-8 text-amber-400" />
            <span className="font-bold text-neutral-300">Tải Ảnh Khuôn Mặt Nguồn</span>
            <span className="text-[10px] text-neutral-500">Chân dung rõ nét, độ phân giải cao</span>
          </div>

          <div className="border border-[#232840] rounded-2xl p-4 bg-[#141829] space-y-3">
            <div>
              <div className="flex justify-between text-neutral-300 mb-1">
                <span>Feather Mask Blur</span>
                <span className="font-mono text-amber-400">{featherBlur}px</span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                value={featherBlur}
                onChange={(e) => setFeatherBlur(parseInt(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>
            <p className="text-[10px] text-neutral-400">
              Bộ lọc làm mờ viền cạnh 25px kết hợp EMA tracking giúp khuôn mặt ghép tự nhiên không lộ mép ghép.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-[#202742]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300">Đóng</button>
          <button
            onClick={() => {
              setIsProcessing(true);
              setTimeout(() => {
                setIsProcessing(false);
                alert('Đã xử lý ghép khuôn mặt thành công!');
                onClose();
              }, 1500);
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold shadow-lg shadow-amber-500/20"
          >
            {isProcessing ? 'Đang phân tích...' : 'Bắt Đầu Ghép Mặt'}
          </button>
        </div>
      </div>
    </div>
  );
};
