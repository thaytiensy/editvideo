import React, { useRef } from 'react';
import { useEditorStore } from '../../stores/useEditorStore';
import { TimelineToolbar } from './TimelineToolbar';
import { TimeRuler } from './TimeRuler';
import { TrackHeader } from './TrackHeader';
import { TrackLane } from './TrackLane';
import { Playhead } from './Playhead';

export const TimelineContainer: React.FC = () => {
  const tracks = useEditorStore((s) => s.project.tracks);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col bg-[#080910] border-t border-[#1E2338] h-72 select-none">
      {/* Timeline Control Toolbar */}
      <TimelineToolbar />

      {/* Main Track Headers & Scrollable Lane Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Track Headers Column */}
        <div className="w-48 flex-shrink-0 flex flex-col bg-[#0F111D] border-r border-[#1E2338]">
          <div className="h-7 bg-[#121524] border-b border-[#1E2338] px-3 flex items-center text-[11px] font-bold text-neutral-400">
            TRACKS ({tracks.length})
          </div>
          <div className="flex-1 overflow-y-auto">
            {tracks.map((track) => (
              <TrackHeader key={track.id} track={track} />
            ))}
          </div>
        </div>

        {/* Right Scrollable Canvas Lane & Ruler */}
        <div ref={scrollRef} className="flex-1 flex flex-col overflow-auto custom-scrollbar relative">
          <TimeRuler />
          <div className="relative flex-1">
            <Playhead />
            {tracks.map((track) => (
              <TrackLane key={track.id} track={track} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
