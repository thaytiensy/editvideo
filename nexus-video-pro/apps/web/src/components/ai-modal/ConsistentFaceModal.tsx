import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

interface ConsistentFaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsistentFaceModal: React.FC<ConsistentFaceModalProps> = ({ isOpen, onClose }) => {
  const [consistencyWeight, setConsistencyWeight] = useState(0.85);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#101424] border border-[#2B3250] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs select-none">
        <div className="flex items-center justify-between border-b border-[#202742] pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">IP-Adapter FaceID Plus v2 Character Lock</h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-lg">✕</button>
        </div>

        <p className="text-neutral-300">
          Khóa nhận diện nhân vật đạt độ chính xác 95-100% xuyên suốt các phân cảnh kịch bản và góc quay khác nhau.
        </p>

        <div>
          <div className="flex justify-between text-neutral-400 mb-1">
            <span>Độ khóa tương đồng khuôn mặt ({Math.round(consistencyWeight * 100)}%)</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={1.0}
            step={0.05}
            value={consistencyWeight}
            onChange={(e) => setConsistencyWeight(parseFloat(e.target.value))}
            className="w-full accent-amber-400"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-[#202742]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300">Đóng</button>
          <button
            onClick={() => {
              alert('Đã kích hoạt khóa nhân vật đồng nhất 95-100%!');
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold shadow-lg shadow-amber-500/20"
          >
            Kích Hoạt Khóa
          </button>
        </div>
      </div>
    </div>
  );
};
