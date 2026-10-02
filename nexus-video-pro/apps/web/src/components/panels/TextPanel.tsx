import React from 'react';
import { Type, Sparkles } from 'lucide-react';

export const TextPanel: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col bg-[#0D0F1A] border-l border-[#1E2338] p-3 space-y-3 text-xs select-none">
      <div className="flex items-center gap-2 border-b border-[#1E2338] pb-2 font-bold text-neutral-200">
        <Type className="w-4 h-4 text-indigo-400" />
        <span>KINETIC TEXT & AUTO CAPTIONS</span>
      </div>

      <div className="space-y-2">
        <div className="p-3 bg-[#121524] rounded-xl border border-[#232840] space-y-2">
          <span className="font-semibold text-neutral-300 block">AI Speech-to-Text Whisper</span>
          <p className="text-[10px] text-neutral-400">
            Tự động tách âm thanh từ video và tạo phụ đề từng từ chuẩn karaoke.
          </p>
          <button className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tạo Phụ Đề Tự Động</span>
          </button>
        </div>
      </div>
    </div>
  );
};
