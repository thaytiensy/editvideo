import React from 'react';
import { Sliders, Sparkles, Film, Palette } from 'lucide-react';

export const EffectsPanel: React.FC = () => {
  const filters = [
    { id: 'f1', name: 'Teal & Orange Hollywood', type: 'lut' },
    { id: 'f2', name: 'Vintage 35mm Grain', type: 'grain' },
    { id: 'f3', name: 'Glitch Chromatic Shift', type: 'glitch' },
    { id: 'f4', name: 'Cyberpunk Neon Glow', type: 'lut' },
    { id: 'f5', name: 'Chroma Key / Green Screen', type: 'chroma' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#0D0F1A] border-l border-[#1E2338] p-3 space-y-3 text-xs select-none">
      <div className="flex items-center gap-2 border-b border-[#1E2338] pb-2 font-bold text-neutral-200">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span>EFFECTS & 3D LUT MATRIX</span>
      </div>

      <div className="space-y-2 overflow-y-auto custom-scrollbar">
        {filters.map((f) => (
          <div
            key={f.id}
            className="p-2.5 rounded-xl border border-[#232840] bg-[#121524] hover:border-amber-400 cursor-pointer transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <span className="font-medium text-neutral-300">{f.name}</span>
            </div>
            <span className="text-[10px] text-neutral-500 uppercase">{f.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
