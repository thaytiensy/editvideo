import React from 'react';
import { Volume2, Mic, Activity } from 'lucide-react';

export const AudioPanel: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col bg-[#0D0F1A] border-l border-[#1E2338] p-3 space-y-3 text-xs select-none">
      <div className="flex items-center gap-2 border-b border-[#1E2338] pb-2 font-bold text-neutral-200">
        <Volume2 className="w-4 h-4 text-emerald-400" />
        <span>AUDIO MIXER & LOUDNESS</span>
      </div>

      <div className="space-y-3">
        <div className="p-3 bg-[#121524] rounded-xl border border-[#232840] space-y-2">
          <div className="flex justify-between text-neutral-300">
            <span>Broadcast Loudness</span>
            <span className="font-mono text-emerald-400 font-bold">-14.0 LUFS</span>
          </div>
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div className="w-[70%] h-full bg-emerald-500 rounded-full" />
          </div>
        </div>

        <div>
          <label className="text-neutral-400 block mb-1">Master Output Gain</label>
          <input type="range" min={0} max={1.5} step={0.05} defaultValue={1.0} className="w-full accent-emerald-400" />
        </div>
      </div>
    </div>
  );
};
