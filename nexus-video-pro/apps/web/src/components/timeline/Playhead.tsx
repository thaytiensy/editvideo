import React from 'react';
import { useEditorStore } from '../../stores/useEditorStore';

export const Playhead: React.FC = () => {
  const currentTime = useEditorStore((s) => s.currentTime);
  const zoomLevel = useEditorStore((s) => s.zoomLevel);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);

  const leftPx = currentTime * zoomLevel;

  return (
    <div
      className="absolute top-0 bottom-0 z-30 pointer-events-none"
      style={{ left: `${leftPx}px` }}
    >
      {/* Playhead Head Marker */}
      <div className="w-3.5 h-4 bg-amber-400 -translate-x-1/2 clip-path-polygon flex items-center justify-center cursor-ew-resize pointer-events-auto shadow-md shadow-amber-500/50">
        <div className="w-1 h-1 bg-black rounded-full" />
      </div>

      {/* Red/Amber Scrubber Line */}
      <div className="w-0.5 h-full bg-amber-400 -translate-x-1/2" />
    </div>
  );
};
