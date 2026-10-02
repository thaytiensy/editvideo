import React, { useState } from 'react';
import { Video, Camera, Sparkles } from 'lucide-react';

interface ImageToVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImageToVideoModal: React.FC<ImageToVideoModalProps> = ({ isOpen, onClose }) => {
  const [model, setModel] = useState('wan2.1');
  const [motion, setMotion] = useState('pan_right');
  const [strength, setStrength] = useState(50);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#101424] border border-[#2B3250] rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-xs select-none">
        <div className="flex items-center justify-between border-b border-[#202742] pb-3">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">Image-To-Video Generator (Wan 2.1 / Kling / Luma)</h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-lg">✕</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-neutral-400 block mb-1">Mô Hình Sinh Video:</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-[#161B2E] border border-[#2C3352] rounded-xl px-3 py-2 text-neutral-200"
            >
              <option value="wan2.1">Wan 2.1 (Ultra High Fidelity Motion)</option>
              <option value="kling">Kling AI 1.5 (Pro Camera Control)</option>
              <option value="luma">Luma Dream Machine (Cinematic 3D)</option>
            </select>
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Chuyển Động Camera:</label>
            <select
              value={motion}
              onChange={(e) => setMotion(e.target.value)}
              className="w-full bg-[#161B2E] border border-[#2C3352] rounded-xl px-3 py-2 text-neutral-200"
            >
              <option value="pan_right">Pan Right (Quét ngang sang phải)</option>
              <option value="zoom_in">Zoom In (Tiến dần vào chủ thể)</option>
              <option value="orbit">Orbit 3D (Xoay tròn góc nhìn)</option>
              <option value="crane_up">Crane Up (Cẩu máy quay lên cao)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-neutral-400 mb-1">
              <span>Cường độ chuyển động ({strength}/100)</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={strength}
              onChange={(e) => setStrength(parseInt(e.target.value))}
              className="w-full accent-amber-400"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-[#202742]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300">Đóng</button>
          <button
            onClick={() => {
              alert('Đã gửi yêu cầu sinh video AI sang hàng đợi!');
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold shadow-lg shadow-amber-500/20"
          >
            Tạo Video Ngay
          </button>
        </div>
      </div>
    </div>
  );
};
