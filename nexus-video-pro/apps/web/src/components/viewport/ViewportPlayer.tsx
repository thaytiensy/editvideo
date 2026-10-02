import React, { useRef, useEffect } from 'react';
import { useEditorStore } from '../../stores/useEditorStore';
import { PlaybackControls } from './PlaybackControls';

export const ViewportPlayer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const currentTime = useEditorStore((s) => s.currentTime);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const resolution = useEditorStore((s) => s.project.resolution);

  // Sync HTML5 video with timeline playhead
  useEffect(() => {
    if (videoRef.current) {
      if (Math.abs(videoRef.current.currentTime - currentTime) > 0.3) {
        videoRef.current.currentTime = currentTime;
      }
    }
  }, [currentTime]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div className="flex-1 flex flex-col bg-[#07080E] overflow-hidden select-none border-b border-[#1E2338]">
      {/* Video Viewport Stage */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        <div
          className="relative max-w-full max-h-full rounded-xl overflow-hidden shadow-2xl bg-black border border-[#252A40]"
          style={{
            aspectRatio: resolution.aspectRatio === '9:16' ? '9/16' : '16/9',
            width: resolution.aspectRatio === '9:16' ? '360px' : '720px',
          }}
        >
          <video
            ref={videoRef}
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
            className="w-full h-full object-contain"
            onTimeUpdate={() => {
              if (isPlaying && videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
              }
            }}
          />

          {/* Canvas WebGL overlay */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none w-full h-full"
          />

          {/* Title & Action Safe Area Guides Overlay (dashed) */}
          <div className="absolute inset-[10%] border border-dashed border-white/10 pointer-events-none" />
          <div className="absolute inset-[5%] border border-dotted border-white/10 pointer-events-none" />
        </div>
      </div>

      {/* Transport Controls Bar */}
      <PlaybackControls />
    </div>
  );
};
