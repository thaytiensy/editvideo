import React from 'react';
import { useEditorStore } from '../../stores/useEditorStore';
import { formatSMPTETimecode } from '../../lib/math';

export const TimeRuler: React.FC = () => {
  const duration = useEditorStore((s) => s.project.duration);
  const zoomLevel = useEditorStore((s) => s.zoomLevel);
  const fps = useEditorStore((s) => s.project.fps);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);

  const totalWidth = duration * zoomLevel;
  const seconds = Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => i);

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const time = clickX / zoomLevel;
    setCurrentTime(time);
  };

  return (
    <div
      onClick={handleRulerClick}
      className="h-7 bg-[#0E101A] border-b border-[#1E2336] relative cursor-pointer select-none"
      style={{ width: `${totalWidth}px` }}
    >
      {seconds.map((sec) => (
        <div
          key={sec}
          className="absolute top-0 bottom-0 flex flex-col justify-end"
          style={{ left: `${sec * zoomLevel}px` }}
        >
          {sec % 5 === 0 && (
            <span className="text-[9px] font-mono text-neutral-400 pl-1 -translate-y-2">
              {formatSMPTETimecode(sec, fps)}
            </span>
          )}
          <div className={`w-px bg-[#2C334D] ${sec % 5 === 0 ? 'h-3.5 bg-neutral-400' : 'h-1.5'}`} />
        </div>
      ))}
    </div>
  );
};
