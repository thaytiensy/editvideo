import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  SkipBack, 
  SkipForward, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  Wand2, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Sparkles,
  Info,
  Sliders,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { UploadedMedia, DetectedFace, faceSwapApi } from '../../services/faceSwapApi';

interface PreviewPlayerZoneProps {
  activeMedia: UploadedMedia | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onMarkIn: () => void;
  onMarkOut: () => void;
  inPoint: number;
  outPoint: number;
  
  detectedFaces: DetectedFace[];
  selectedFaceIndex: number;
  onSelectFace: (index: number) => void;
  isDetectingFaces: boolean;
  onTriggerDetectFaces: () => void;

  sourceFaceCrop: string | null;
  sourceFaceMedia: UploadedMedia | null;
  
  swapPreviewImage: string | null;
  isSwappingPreview: boolean;
  onGeneratePreviewSwap: () => void;
  showSwappedPreview: boolean;
  onToggleShowSwappedPreview: (val: boolean) => void;
}

export const PreviewPlayerZone: React.FC<PreviewPlayerZoneProps> = ({
  activeMedia,
  currentTime,
  duration,
  isPlaying,
  onTogglePlay,
  onSeek,
  onMarkIn,
  onMarkOut,
  inPoint,
  outPoint,
  detectedFaces,
  selectedFaceIndex,
  onSelectFace,
  isDetectingFaces,
  onTriggerDetectFaces,
  sourceFaceCrop,
  sourceFaceMedia,
  swapPreviewImage,
  isSwappingPreview,
  onGeneratePreviewSwap,
  showSwappedPreview,
  onToggleShowSwappedPreview,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hoveredFace, setHoveredFace] = useState<number | null>(null);

  // Sync video element time
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.3) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  // Sync play state
  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current && isPlaying) {
      onSeek(videoRef.current.currentTime);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <section className="flex-1 flex flex-col bg-[#0b0c10] overflow-hidden select-none relative">
      {/* Top Preview Toolbar */}
      <div className="h-10 bg-[#121319] border-b border-[#20222b] px-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>Màn Hình Xem Trước (Preview)</span>
          </span>

          {activeMedia && (
            <span className="px-2 py-0.5 rounded bg-[#1a1c25] text-neutral-400 font-mono text-[11px] border border-[#272a38]">
              {activeMedia.width}x{activeMedia.height} @ {Math.round(activeMedia.fps)}fps
            </span>
          )}
        </div>

        {/* AI Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Detect Faces Button */}
          {activeMedia && (
            <button
              onClick={onTriggerDetectFaces}
              disabled={isDetectingFaces}
              className="px-2.5 py-1 rounded bg-[#1a1c26] hover:bg-[#232634] text-neutral-300 hover:text-white border border-[#2b2e3c] flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Phát hiện tất cả khuôn mặt tại khung hình hiện tại"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isDetectingFaces ? "Đang quét mặt..." : "Quét Mặt Khung Hình"}</span>
            </button>
          )}

          {/* Instant Swap Preview Button */}
          {sourceFaceCrop && detectedFaces.length > 0 && (
            <button
              onClick={onGeneratePreviewSwap}
              disabled={isSwappingPreview}
              className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
              title="Thực hiện hoán đổi khuôn mặt trên khung hình hiện tại để xem thử chất lượng"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{isSwappingPreview ? "Đang ghép thử CPU..." : "Xem Thử Đổi Mặt"}</span>
            </button>
          )}

          {/* Toggle Swapped View */}
          {swapPreviewImage && (
            <button
              onClick={() => onToggleShowSwappedPreview(!showSwappedPreview)}
              className={`px-2.5 py-1 rounded border flex items-center gap-1.5 transition-colors ${
                showSwappedPreview 
                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-[#1a1c26] text-neutral-300 border-[#2b2e3c]'
              }`}
              title="Bật/Tắt hiển thị kết quả đổi mặt thử nghiệm"
            >
              {showSwappedPreview ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showSwappedPreview ? "Đang xem: Mặt Mới" : "Đang xem: Mặt Gốc"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Viewport Container */}
      <div 
        ref={containerRef}
        className="flex-1 relative flex items-center justify-center bg-[#07070a] p-4 overflow-hidden"
      >
        {activeMedia ? (
          <div className="relative max-w-full max-h-full aspect-video flex items-center justify-center shadow-2xl rounded-lg overflow-hidden border border-[#20222c] bg-black">
            {/* Show Swapped Image Preview if toggled */}
            {showSwappedPreview && swapPreviewImage ? (
              <img
                src={swapPreviewImage}
                alt="Xem thử hoán đổi khuôn mặt"
                className="w-full h-full object-contain pointer-events-none"
              />
            ) : activeMedia.type === 'video' ? (
              <video
                ref={videoRef}
                src={activeMedia.url.startsWith('http') ? activeMedia.url : `http://127.0.0.1:8000${activeMedia.url}`}
                className="w-full h-full object-contain"
                onTimeUpdate={handleVideoTimeUpdate}
                onClick={onTogglePlay}
              />
            ) : (
              <img
                src={activeMedia.url.startsWith('http') ? activeMedia.url : `http://127.0.0.1:8000${activeMedia.url}`}
                alt={activeMedia.filename}
                className="w-full h-full object-contain"
              />
            )}

            {/* Interactive Face Bounding Boxes Overlay on Preview */}
            {!showSwappedPreview && detectedFaces.length > 0 && (
              <div className="absolute inset-0 pointer-events-auto">
                {detectedFaces.map((face) => {
                  const [nx1, ny1, nx2, ny2] = face.normalized_bbox;
                  const isSelected = selectedFaceIndex === face.index;
                  const isHovered = hoveredFace === face.index;

                  return (
                    <div
                      key={face.index}
                      onClick={() => onSelectFace(face.index)}
                      onMouseEnter={() => setHoveredFace(face.index)}
                      onMouseLeave={() => setHoveredFace(null)}
                      style={{
                        left: `${nx1 * 100}%`,
                        top: `${ny1 * 100}%`,
                        width: `${(nx2 - nx1) * 100}%`,
                        height: `${(ny2 - ny1) * 100}%`,
                      }}
                      className={`absolute cursor-pointer transition-all border-2 rounded ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.6)]'
                          : isHovered
                          ? 'border-cyan-400 bg-cyan-400/15'
                          : 'border-cyan-500/70 hover:border-cyan-400 bg-cyan-500/10'
                      }`}
                      title={`Click để chọn hoán đổi khuôn mặt này (Mặt #${face.index + 1})`}
                    >
                      {/* Bounding Box Corner Reticles */}
                      <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white" />
                      <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white" />
                      <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white" />

                      {/* Face Label Tag */}
                      <div className={`absolute -top-7 left-0 whitespace-nowrap px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-md ${
                        isSelected 
                          ? 'bg-emerald-500 text-black' 
                          : 'bg-black/85 text-cyan-300 border border-cyan-500/50'
                      }`}>
                        {isSelected && <CheckCircle className="w-3 h-3 stroke-[3]" />}
                        <span>Mặt #{face.index + 1}</span>
                        <span className="text-[9px] opacity-80">({face.gender}, ~{face.age}t)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Prompt overlay banner when faces are detected */}
            {detectedFaces.length > 0 && !showSwappedPreview && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-neutral-700/80 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs text-neutral-300 pointer-events-none shadow-lg animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>
                  Phát hiện <strong className="text-white">{detectedFaces.length}</strong> khuôn mặt: 
                  <span className="text-emerald-400 ml-1 font-medium">Click vào mặt trên video để chọn người muốn đổi!</span>
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-[#242633] bg-[#101117] max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <Play className="w-8 h-8 opacity-60" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-200">Chưa chọn video để xem trước</h3>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
              Kéo thả hoặc click tệp ở mục bên trái để đưa video lên bàn chỉnh sửa CapCut.
            </p>
          </div>
        )}
      </div>

      {/* Detected Faces Thumbnail Picker Strip */}
      {detectedFaces.length > 0 && (
        <div className="h-16 bg-[#121319] border-t border-[#20222b] px-4 flex items-center gap-3 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 flex-shrink-0">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span>Mặt trong khung hình:</span>
          </div>

          <div className="flex items-center gap-2">
            {detectedFaces.map((f) => {
              const isSelected = selectedFaceIndex === f.index;
              return (
                <button
                  key={f.index}
                  onClick={() => onSelectFace(f.index)}
                  className={`flex items-center gap-2 p-1 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-500/30 shadow-sm'
                      : 'bg-[#181a23] border-[#292c3a] hover:border-[#3d4255]'
                  }`}
                  title={`Chọn Mặt #${f.index + 1}`}
                >
                  <img
                    src={f.thumbnail}
                    alt={`Mặt ${f.index}`}
                    className="w-10 h-10 rounded object-cover border border-neutral-700"
                  />
                  <div className="text-left text-[10px] pr-2">
                    <span className={`font-semibold block ${isSelected ? 'text-emerald-300' : 'text-neutral-200'}`}>
                      Mặt #{f.index + 1}
                    </span>
                    <span className="text-neutral-400">
                      {f.gender === 'M' ? 'Nam' : 'Nữ'} · {f.age}t
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Transport Controls Bar */}
      <div className="h-12 bg-[#14151c] border-t border-[#23252e] px-4 flex items-center justify-between text-xs">
        {/* Playback Transport Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Jump -1s */}
          <button
            onClick={() => onSeek(Math.max(0, currentTime - 1))}
            className="p-1.5 rounded hover:bg-[#22242f] text-neutral-400 hover:text-white transition-colors"
            title="Lùi 1 giây"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Prev Frame */}
          <button
            onClick={() => onSeek(Math.max(0, currentTime - 1 / (activeMedia?.fps || 30)))}
            className="p-1.5 rounded hover:bg-[#22242f] text-neutral-400 hover:text-white transition-colors"
            title="Lùi 1 khung hình"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={onTogglePlay}
            className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-indigo-600/30"
            title={isPlaying ? "Tạm dừng (Space)" : "Phát (Space)"}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>

          {/* Next Frame */}
          <button
            onClick={() => onSeek(Math.min(duration, currentTime + 1 / (activeMedia?.fps || 30)))}
            className="p-1.5 rounded hover:bg-[#22242f] text-neutral-400 hover:text-white transition-colors"
            title="Tới 1 khung hình"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Jump +1s */}
          <button
            onClick={() => onSeek(Math.min(duration, currentTime + 1))}
            className="p-1.5 rounded hover:bg-[#22242f] text-neutral-400 hover:text-white transition-colors"
            title="Tiến 1 giây"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Timecode display */}
          <div className="ml-3 font-mono text-xs text-neutral-300">
            <span className="text-white font-semibold">{formatTime(currentTime)}</span>
            <span className="text-neutral-500 mx-1">/</span>
            <span className="text-neutral-400">{formatTime(duration)}</span>
          </div>
        </div>

        {/* In / Out Point Markers */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={onMarkIn}
            className="px-2 py-1 rounded bg-[#1c1e28] hover:bg-[#252836] border border-[#2b2e3e] text-neutral-300 hover:text-white text-[11px] font-mono flex items-center gap-1"
            title="Đặt điểm bắt đầu In ([)"
          >
            <span>[ IN: {formatTime(inPoint)}</span>
          </button>

          <button
            onClick={onMarkOut}
            className="px-2 py-1 rounded bg-[#1c1e28] hover:bg-[#252836] border border-[#2b2e3e] text-neutral-300 hover:text-white text-[11px] font-mono flex items-center gap-1"
            title="Đặt điểm kết thúc Out (])"
          >
            <span>OUT: {formatTime(outPoint)} ]</span>
          </button>
        </div>

        {/* Right Preview Controls: Volume & Fullscreen */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 rounded text-neutral-400 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
                if (videoRef.current) videoRef.current.volume = parseFloat(e.target.value);
              }}
              className="w-16 h-1 bg-[#2b2e3c] rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded hover:bg-[#22242f] text-neutral-400 hover:text-white transition-colors"
            title="Toàn màn hình"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
