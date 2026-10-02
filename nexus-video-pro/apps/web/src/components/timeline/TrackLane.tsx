import React from 'react';
import { Track } from '../../types/timeline';
import { ClipItem } from './ClipItem';
import { useEditorStore } from '../../stores/useEditorStore';

interface TrackLaneProps {
  track: Track;
}

export const TrackLane: React.FC<TrackLaneProps> = ({ track }) => {
  const duration = useEditorStore((s) => s.project.duration);
  const zoomLevel = useEditorStore((s) => s.zoomLevel);
  const totalWidth = duration * zoomLevel;

  return (
    <div
      className="bg-[#0B0D17] border-b border-[#1E2338] relative"
      style={{
        height: `${track.height}px`,
        width: `${totalWidth}px`,
      }}
    >
      {track.clips.map((clip) => (
        <ClipItem key={clip.id} clip={clip} />
      ))}
    </div>
  );
};
