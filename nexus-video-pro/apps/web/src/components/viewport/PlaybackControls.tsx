import React from 'react';
import { useEditorStore } from '../../stores/useEditorStore';
import { formatSMPTETimecode } from '../../lib/math';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Maximize2 
} from 'lucide-react';

export const PlaybackControls: React.FC = () => {
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const setIsPlaying = useEditorStore((s) => s.setIsPlaying);
  const currentTime = useEditorStore((s) => s.currentTime);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const fps = useEditorStore((s) => s.project.fps);

  const stepFrame = (frames: number) => {
    setCurrentTime(Math.max(0, currentTime + frames / fps));
  };

  return (
    <div className="h-11 bg-[#10121F] border-t border-[#1F243A] px-4 flex items-center justify-between text-xs select-none">
      {/* Timecode */}
      <div className="font-mono text-amber-400 font-bold tracking-wider text-xs">
        {formatSMPTETimecode(currentTime, fps)}
      </div>

      {/* Transport Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => stepFrame(-1)}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
          title="Previous Frame"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 rounded-xl bg-amber-400 text-black font-bold hover:bg-amber-300 transition-colors shadow-md shadow-amber-500/20"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
        </button>

        <button
          onClick={() => stepFrame(1)}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
          title="Next Frame"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Frame Rate / Fullscreen */}
      <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
        <span className="font-mono">{fps} FPS</span>
        <button className="p-1 hover:text-white">
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
