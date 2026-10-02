import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface HotkeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HotkeysModal: React.FC<HotkeysModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const hotkeys = [
    { key: 'Space', desc: 'Phát / Tạm dừng phát video (Play/Pause)' },
    { key: 'S', desc: 'Cắt / Tách phân cảnh tại vị trí đầu đọc' },
    { key: 'I / [', desc: 'Đánh dấu điểm bắt đầu (Set In Point)' },
    { key: 'O / ]', desc: 'Đánh dấu điểm kết thúc (Set Out Point)' },
    { key: '← / →', desc: 'Lùi / Tiến 1 khung hình' },
    { key: 'Shift + ← / →', desc: 'Lùi / Tiến 1 giây' },
    { key: 'Ctrl + E', desc: 'Mở cửa sổ xuất video (Export)' },
    { key: 'F', desc: 'Bật / Tắt toàn màn hình Preview' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div className="w-full max-w-md bg-[#14151d] border border-[#282b3a] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-[#232532] flex items-center justify-between bg-[#171822]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Phím Tắt Chỉnh Sửa (CapCut Hotkeys)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-2.5">
          {hotkeys.map((h, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-[#21232d] last:border-0">
              <span className="text-neutral-300">{h.desc}</span>
              <kbd className="px-2 py-0.5 rounded bg-[#20222e] border border-[#2f3244] font-mono text-indigo-300 font-semibold text-[11px]">
                {h.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-4 bg-[#171822] border-t border-[#232532] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
