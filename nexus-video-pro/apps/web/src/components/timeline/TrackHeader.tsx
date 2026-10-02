import React from 'react';
import { Track } from '../../types/timeline';
import { useEditorStore } from '../../stores/useEditorStore';
import { Eye, EyeOff, Lock, Unlock, Volume2, VolumeX, Trash2 } from 'lucide-react';

interface TrackHeaderProps {
  track: Track;
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({ track }) => {
  const removeTrack = useEditorStore((s) => s.removeTrack);

  return (
    <div
      className="w-48 bg-[#121524] border-b border-r border-[#1E2338] px-2.5 flex items-center justify-between text-xs select-none flex-shrink-0"
      style={{ height: `${track.height}px` }}
    >
      <div className="flex items-center gap-1.5 overflow-hidden">
        <span className={`w-2 h-2 rounded-full ${track.type === 'video' ? 'bg-amber-400' : track.type === 'audio' ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
        <span className="font-semibold text-neutral-300 truncate text-[11px]">{track.name}</span>
      </div>

      <div className="flex items-center gap-1 text-neutral-400">
        <button className="p-1 hover:text-white">
          {track.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-neutral-600" />}
        </button>
        <button className="p-1 hover:text-white">
          {track.muted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3" />}
        </button>
        <button className="p-1 hover:text-white">
          {track.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 text-neutral-600" />}
        </button>
      </div>
    </div>
  );
};
