import React from 'react';
import { Clip } from '../../types/timeline';
import { useEditorStore } from '../../stores/useEditorStore';

interface ClipItemProps {
  clip: Clip;
}

export const ClipItem: React.FC<ClipItemProps> = ({ clip }) => {
  const zoomLevel = useEditorStore((s) => s.zoomLevel);
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const setSelectedClipId = useEditorStore((s) => s.setSelectedClipId);

  const isSelected = selectedClipId === clip.id;
  const leftPx = clip.start * zoomLevel;
  const widthPx = clip.duration * zoomLevel;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setSelectedClipId(clip.id);
      }}
      className={`absolute top-1 bottom-1 rounded-lg border overflow-hidden cursor-pointer select-none transition-all ${
        isSelected
          ? 'border-amber-400 ring-2 ring-amber-400/40 bg-amber-500/20'
          : clip.type === 'video'
          ? 'border-amber-500/40 bg-amber-500/10 hover:border-amber-400'
          : clip.type === 'audio'
          ? 'border-emerald-500/40 bg-emerald-500/10 hover:border-emerald-400'
          : 'border-indigo-500/40 bg-indigo-500/10 hover:border-indigo-400'
      }`}
      style={{
        left: `${leftPx}px`,
        width: `${widthPx}px`,
      }}
    >
      {/* Clip Header Label */}
      <div className="px-2 py-0.5 text-[10px] font-bold text-neutral-200 truncate bg-black/40 flex items-center justify-between">
        <span className="truncate">{clip.name}</span>
        <span className="font-mono text-[9px] text-neutral-400 ml-1">{clip.duration.toFixed(1)}s</span>
      </div>

      {/* Clip Trim Handles */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize bg-white/20 opacity-0 hover:opacity-100" />
      <div className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize bg-white/20 opacity-0 hover:opacity-100" />
    </div>
  );
};
