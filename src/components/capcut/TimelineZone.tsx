import React, { useState, useRef, useEffect } from 'react';
import { 
  Scissors, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Music, 
  Film, 
  Sparkles, 
  ChevronRight, 
  Sliders,
  RotateCcw,
  Check,
  UserCheck
} from 'lucide-react';
import { UploadedMedia, DetectedFace } from '../../services/faceSwapApi';

interface TimelineZoneProps {
  activeMedia: UploadedMedia | null;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  inPoint: number;
  outPoint: number;
  onSetInPoint: (time: number) => void;
  onSetOutPoint: (time: number) => void;
  onResetInOut: () => void;
  selectedFaceIndex: number;
  detectedFaces: DetectedFace[];
  sourceFaceCrop: string | null;
  unifyCharacter: boolean;
  swapAllFaces: boolean;
}

export const TimelineZone: React.FC<TimelineZoneProps> = ({
  activeMedia,
  currentTime,
  duration,
  onSeek,
  inPoint,
  outPoint,
  onSetInPoint,
  onSetOutPoint,
  onResetInOut,
  selectedFaceIndex,
  detectedFaces,
  sourceFaceCrop,
  unifyCharacter,
  swapAllFaces
}) => {
  const [zoom, setZoom] = useState(1); // 1x to 5x zoom
  const trackRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Time formatting helper
  const formatTimecode = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 30); // frame number at 30fps
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
  };

  const handleTimelineMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current || duration === 0) return;
    setIsScrubbing(true);
    updateSeekFromEvent(e);
  };

  const updateSeekFromEvent = (e: React.MouseEvent | MouseEvent) => {
    if (!trackRef.current || duration === 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbing) {
        updateSeekFromEvent(e);
      }
    };
    const handleMouseUp = () => {
      setIsScrubbing(false);
    };
    if (isScrubbing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, duration]);

  // Current playhead percentage
  const playheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const inPercent = duration > 0 ? (inPoint / duration) * 100 : 0;
  const outPercent = duration > 0 ? (outPoint / duration) * 100 : 100;

  // Selected face info
  const selectedFace = detectedFaces.find(f => f.index === selectedFaceIndex) || null;

  return (
    <section className="h-64 bg-[#121319] border-t border-[#23252e] flex flex-col select-none">
      {/* Timeline Control Toolbar */}
      <div className="h-10 bg-[#14151c] border-b border-[#20222b] px-4 flex items-center justify-between text-xs">
        {/* Left Editing Tools */}
        <div className="flex items-center gap-2">
          {/* Split Tool */}
          <button
            onClick={() => {
              // Set in/out point around playhead
              onSetInPoint(currentTime);
            }}
            className="px-2.5 py-1 rounded bg-[#1c1e28] hover:bg-[#252836] text-neutral-300 hover:text-white border border-[#2b2e3e] flex items-center gap-1.5 transition-colors"
            title="Tách clip / Cắt đoạn tại đầu đọc (S)"
          >
            <Scissors className="w-3.5 h-3.5 text-indigo-400" />
            <span>Cắt Tại Đầu Đọc (S)</span>
          </button>

          {/* Mark In */}
          <button
            onClick={() => onSetInPoint(currentTime)}
            className="px-2.5 py-1 rounded bg-[#1c1e28] hover:bg-[#252836] text-neutral-300 hover:text-white border border-[#2b2e3e] flex items-center gap-1 transition-colors"
            title="Chọn điểm bắt đầu hoán đổi (I)"
          >
            <span>[ Đặt In</span>
          </button>

          {/* Mark Out */}
          <button
            onClick={() => onSetOutPoint(currentTime)}
            className="px-2.5 py-1 rounded bg-[#1c1e28] hover:bg-[#252836] text-neutral-300 hover:text-white border border-[#2b2e3e] flex items-center gap-1 transition-colors"
            title="Chọn điểm kết thúc hoán đổi (O)"
          >
            <span>Đặt Out ]</span>
          </button>

          {/* Reset In/Out */}
          {(inPoint > 0 || outPoint < duration) && (
            <button
              onClick={onResetInOut}
              className="px-2 py-1 rounded text-neutral-400 hover:text-amber-400 hover:bg-[#20222e] flex items-center gap-1 text-[11px]"
              title="Khôi phục toàn bộ độ dài video"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Toàn bộ video</span>
            </button>
          )}
        </div>

        {/* Center: Selected Character Status */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1b1c26] border border-[#282b3a] text-[11px] text-neutral-300">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Đổi mặt:</span>
            {swapAllFaces ? (
              <span className="text-purple-300 font-semibold">Tất cả khuôn mặt</span>
            ) : selectedFace ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                Mặt #{selectedFace.index + 1} ({selectedFace.gender}, ~{selectedFace.age}t)
                {unifyCharacter && <span className="text-indigo-400 text-[10px]">· Thống nhất bối cảnh</span>}
              </span>
            ) : (
              <span className="text-neutral-500">Mặc định mặt đầu tiên</span>
            )}
          </div>
        </div>

        {/* Right Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(1, zoom - 0.5))}
            className="p-1 rounded hover:bg-[#20222f] text-neutral-400 hover:text-white"
            title="Thu nhỏ Timeline"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] text-neutral-400 font-mono w-8 text-center">{zoom}x</span>
          <button
            onClick={() => setZoom(Math.min(4, zoom + 0.5))}
            className="p-1 rounded hover:bg-[#20222f] text-neutral-400 hover:text-white"
            title="Phóng to Timeline"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Timeline Ruler & Tracks Viewport */}
      <div className="flex-1 flex overflow-x-auto relative bg-[#0e0f14]">
        {/* Track Headers (Left sidebar) */}
        <div className="w-36 flex-shrink-0 bg-[#121319] border-r border-[#20222b] flex flex-col z-20 shadow-md">
          {/* Ruler Corner */}
          <div className="h-6 border-b border-[#20222b] flex items-center px-3 text-[10px] font-mono text-neutral-500">
            TRACKS
          </div>

          {/* Track 1 Header: Face Swap Effect */}
          <div className="h-14 border-b border-[#20222b] px-3 flex items-center gap-2 text-xs text-purple-300 bg-[#161722]/50">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="font-semibold block truncate text-[11px]">AI FaceSwap</span>
              <span className="text-[9px] text-neutral-500 block truncate">
                {swapAllFaces ? "Tất cả mặt" : "Mặt đã chọn"}
              </span>
            </div>
          </div>

          {/* Track 2 Header: Video */}
          <div className="h-16 border-b border-[#20222b] px-3 flex items-center gap-2 text-xs text-indigo-300 bg-[#141620]/50">
            <Film className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="font-semibold block truncate text-[11px]">Video Track</span>
              <span className="text-[9px] text-neutral-500 block truncate">V1 · Gốc</span>
            </div>
          </div>

          {/* Track 3 Header: Audio */}
          <div className="h-10 border-b border-[#20222b] px-3 flex items-center gap-2 text-xs text-emerald-300 bg-[#13171e]/50">
            <Music className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="font-semibold block truncate text-[11px]">Audio Track</span>
              <span className="text-[9px] text-neutral-500 block truncate">A1 · Giữ nguyên</span>
            </div>
          </div>
        </div>

        {/* Scrollable Tracks Canvas */}
        <div 
          ref={trackRef}
          onMouseDown={handleTimelineMouseDown}
          className="flex-1 relative cursor-pointer min-w-full overflow-hidden"
          style={{ width: `${zoom * 100}%` }}
        >
          {/* Time Ruler */}
          <div className="h-6 border-b border-[#20222b] bg-[#14151c] flex items-center relative text-[9px] font-mono text-neutral-500 select-none">
            {duration > 0 && Array.from({ length: 11 }).map((_, idx) => {
              const sec = (duration / 10) * idx;
              return (
                <div
                  key={idx}
                  style={{ left: `${idx * 10}%` }}
                  className="absolute transform -translate-x-1/2 flex flex-col items-center pointer-events-none"
                >
                  <span className="h-1.5 w-[1px] bg-neutral-600 mb-0.5" />
                  <span>{formatTimecode(sec)}</span>
                </div>
              );
            })}
          </div>

          {/* In / Out Active Range Highlight */}
          {duration > 0 && (
            <div
              style={{
                left: `${inPercent}%`,
                width: `${outPercent - inPercent}%`
              }}
              className="absolute top-6 bottom-0 bg-indigo-500/10 border-x border-indigo-500/40 pointer-events-none z-0"
            >
              <div className="absolute top-1 left-1 bg-indigo-600/80 text-white text-[9px] font-mono px-1 rounded">
                IN
              </div>
              <div className="absolute top-1 right-1 bg-indigo-600/80 text-white text-[9px] font-mono px-1 rounded">
                OUT
              </div>
            </div>
          )}

          {/* Track 1: Face Swap Effect Block */}
          <div className="h-14 border-b border-[#20222b] relative p-1.5 flex items-center">
            {activeMedia && sourceFaceCrop && (
              <div
                style={{
                  left: `${inPercent}%`,
                  width: `${outPercent - inPercent}%`
                }}
                className="h-full rounded-lg bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-purple-900/60 border border-purple-500/60 px-3 flex items-center justify-between shadow-lg shadow-purple-950/40 overflow-hidden relative"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={sourceFaceCrop}
                    alt="Mặt thay thế"
                    className="w-8 h-8 rounded-full border border-purple-300 object-cover shadow"
                  />
                  <div className="text-[10px] text-purple-200">
                    <span className="font-semibold block">Đổi sang Mặt Mới</span>
                    <span className="text-[9px] text-purple-300/80">
                      {swapAllFaces ? "Tất cả các mặt" : `Mặt mục tiêu #${selectedFaceIndex + 1}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[9px] bg-purple-950/80 px-2 py-0.5 rounded text-purple-300 border border-purple-800">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>buffalo_l + inswapper (CPU)</span>
                </div>
              </div>
            )}
          </div>

          {/* Track 2: Video Clip Strip */}
          <div className="h-16 border-b border-[#20222b] relative p-1 flex items-center">
            {activeMedia ? (
              <div className="w-full h-full rounded-lg bg-[#181a24] border border-[#2b2e3e] flex items-center px-3 overflow-hidden relative shadow">
                {/* Visual Video Thumbnails repeating */}
                {activeMedia.thumbnail && (
                  <div className="absolute inset-0 opacity-20 flex overflow-hidden pointer-events-none">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <img
                        key={i}
                        src={activeMedia.thumbnail}
                        alt="filmstrip"
                        className="h-full w-24 object-cover flex-shrink-0"
                      />
                    ))}
                  </div>
                )}

                <div className="relative z-10 flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
                    <Film className="w-4 h-4 text-indigo-400" />
                    <span>{activeMedia.filename}</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {formatTimecode(activeMedia.duration)} · {activeMedia.width}x{activeMedia.height}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full h-full rounded-lg border border-dashed border-[#242633] flex items-center justify-center text-xs text-neutral-500">
                Kéo thả video vào đây
              </div>
            )}
          </div>

          {/* Track 3: Audio Track Waveform */}
          <div className="h-10 border-b border-[#20222b] relative p-1 flex items-center">
            {activeMedia && activeMedia.type === 'video' ? (
              <div className="w-full h-full rounded-md bg-[#131820] border border-[#202936] flex items-center px-3 overflow-hidden relative">
                {/* Mock Audio Waveform bars */}
                <div className="w-full flex items-center justify-between gap-1 opacity-40">
                  {Array.from({ length: 60 }).map((_, i) => {
                    const h = 20 + Math.sin(i * 0.4) * 15 + Math.random() * 15;
                    return (
                      <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className="w-1 bg-emerald-400 rounded-full"
                      />
                    );
                  })}
                </div>
                <span className="absolute left-3 text-[10px] font-mono text-emerald-400 font-medium">
                  Audio AAC / Stereo (Bảo tồn 100% âm thanh gốc)
                </span>
              </div>
            ) : (
              <div className="w-full h-full rounded-md border border-dashed border-[#20232e] flex items-center justify-center text-[10px] text-neutral-600">
                Không có track âm thanh
              </div>
            )}
          </div>

          {/* Playhead Red Needle Scrub Line */}
          {duration > 0 && (
            <div
              style={{ left: `${playheadPercent}%` }}
              className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-30 pointer-events-none transform -translate-x-1/2 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
            >
              {/* Playhead Scrubber Handle */}
              <div className="w-3.5 h-3.5 bg-red-500 rounded-sm transform rotate-45 -translate-x-1/2 -top-1 absolute shadow-md" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
