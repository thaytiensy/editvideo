import React, { useState } from 'react';
import { Download, Film, Sliders } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [resolution, setResolution] = useState('1080p');
  const [codec, setCodec] = useState('h264');
  const [fps, setFps] = useState('30');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#101424] border border-[#2B3250] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs select-none">
        <div className="flex items-center justify-between border-b border-[#202742] pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">High-Fidelity Video Export Panel</h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-lg">✕</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-neutral-400 block mb-1">Độ Phân Giải:</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full bg-[#161B2E] border border-[#2C3352] rounded-xl px-3 py-2 text-neutral-200"
            >
              <option value="720p">720p HD (1280x720)</option>
              <option value="1080p">1080p Full HD (1920x1080 - Khuyên Dùng)</option>
              <option value="2k">2K QHD (2560x1440)</option>
              <option value="4k">4K Ultra HD (3840x2160 Cinema)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-400 block mb-1">Codec:</label>
              <select
                value={codec}
                onChange={(e) => setCodec(e.target.value)}
                className="w-full bg-[#161B2E] border border-[#2C3352] rounded-xl px-3 py-2 text-neutral-200"
              >
                <option value="h264">H.264 / AVC (Phổ biến nhất)</option>
                <option value="hevc">H.265 / HEVC</option>
                <option value="prores">Apple ProRes 422</option>
                <option value="webm">WebM VP9</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">Frame Rate (FPS):</label>
              <select
                value={fps}
                onChange={(e) => setFps(e.target.value)}
                className="w-full bg-[#161B2E] border border-[#2C3352] rounded-xl px-3 py-2 text-neutral-200"
              >
                <option value="24">24 FPS (Cinematic)</option>
                <option value="30">30 FPS (Standard Video)</option>
                <option value="60">60 FPS (Ultra Smooth)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-[#202742]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300">Đóng</button>
          <button
            onClick={() => {
              setIsExporting(true);
              setTimeout(() => {
                setIsExporting(false);
                alert(`Đã hoàn tất xuất video ${resolution} ${codec.toUpperCase()}!`);
                onClose();
              }, 2000);
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold shadow-lg shadow-emerald-600/25"
          >
            {isExporting ? 'Đang kết xuất...' : 'Bắt Đầu Xuất File'}
          </button>
        </div>
      </div>
    </div>
  );
};
