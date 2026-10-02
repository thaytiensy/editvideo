import React, { useState, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Film, 
  Play, 
  Check, 
  Upload, 
  Layers, 
  Camera, 
  Sliders, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Wand2,
  Maximize2
} from 'lucide-react';
import { UploadedMedia, faceSwapApi } from '../../services/faceSwapApi';

interface ImageToVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaList: UploadedMedia[];
  sourceFaceMedia: UploadedMedia | null;
  sourceFaceCrop: string | null;
  onVideoCreated: (newMedia: UploadedMedia) => void;
}

const MOTION_STYLES = [
  {
    id: 'ken_burns',
    name: 'Ken Burns 3D Cinematic',
    icon: '🎬',
    desc: 'Thu phóng chậm dần đều vào mắt và biểu cảm, phong cách phim tài liệu Hollywood.',
    tag: 'Khuyên dùng'
  },
  {
    id: 'breathing',
    name: 'Breathing Pulse (Nhịp Thở)',
    icon: '💨',
    desc: 'Mô phỏng nhịp thở phập phồng tự nhiên và micro-movement như người thật.',
    tag: 'Chân thực'
  },
  {
    id: 'parallax_pan',
    name: 'Parallax Pan (Lia Ngang)',
    icon: '↔️',
    desc: 'Lướt camera mượt mà sang ngang tạo chiều sâu quang học 3D ấn tượng.',
    tag: 'Góc rộng'
  },
  {
    id: 'dolly_zoom',
    name: 'Dolly Zoom (Vertigo)',
    icon: '🎥',
    desc: 'Thu phóng kịch tính giữ cố định đối tượng và nén không gian hậu cảnh.',
    tag: 'Kịch tính'
  }
];

export const ImageToVideoModal: React.FC<ImageToVideoModalProps> = ({
  isOpen,
  onClose,
  mediaList,
  sourceFaceMedia,
  sourceFaceCrop,
  onVideoCreated
}) => {
  const [selectedImage, setSelectedImage] = useState<UploadedMedia | null>(() => {
    return mediaList.find(m => m.type === 'image') || null;
  });
  const [useFaceSwap, setUseFaceSwap] = useState(true);
  const [motionStyle, setMotionStyle] = useState('ken_burns');
  const [duration, setDuration] = useState(6.0);
  const [fps, setFps] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdMedia, setCreatedMedia] = useState<UploadedMedia | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle uploading fresh image
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    try {
      setIsProcessing(true);
      setError(null);
      const uploaded = await faceSwapApi.uploadFile(e.target.files[0]);
      setSelectedImage(uploaded);
    } catch (err: any) {
      setError(err.message || 'Không thể nạp ảnh');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) {
      setError('Vui lòng chọn hoặc nạp một ảnh tĩnh để tạo video.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const params = {
        image_path: selectedImage.file_path,
        source_face_path: useFaceSwap && sourceFaceMedia ? sourceFaceMedia.file_path : undefined,
        motion_style: motionStyle,
        duration: duration,
        fps: fps
      };

      const result = await faceSwapApi.imageToVideo(params);
      setCreatedMedia(result);
      onVideoCreated(result);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo video từ ảnh');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#12141c] border border-[#2b2e3e] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#232635] flex items-center justify-between bg-[#151722]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Tạo Video Từ Ảnh & Đổi Mặt (Image-To-Video AI)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  CPU 100% Offline
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Tự động ghép mặt AI và sinh video chuyển động điện ảnh mượt mà 30 FPS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#202332] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 flex items-start gap-3 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Chọn ảnh nền / Chân dung */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              1. Chọn ảnh chân dung nguồn để làm video
            </label>
            <div className="flex gap-3 items-center">
              {selectedImage ? (
                <div className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-indigo-500 flex-shrink-0 group">
                  <img
                    src={selectedImage.thumbnail || selectedImage.url}
                    alt={selectedImage.filename}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2 py-1 rounded bg-indigo-600 text-[10px] text-white font-medium"
                    >
                      Đổi ảnh
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-28 h-28 rounded-xl border-2 border-dashed border-[#34374a] bg-[#161824] hover:border-indigo-500 flex flex-col items-center justify-center cursor-pointer transition-colors text-center p-2 flex-shrink-0"
                >
                  <Upload className="w-5 h-5 text-indigo-400 mb-1" />
                  <span className="text-[11px] font-semibold text-neutral-300">Nạp ảnh</span>
                  <span className="text-[9px] text-neutral-500">JPG, PNG</span>
                </div>
              )}

              {/* Existing image options in Media Bin */}
              <div className="flex-1 min-w-0">
                <span className="text-xs text-neutral-400 block mb-1.5">Hoặc chọn nhanh từ thư viện dự án:</span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {mediaList.filter(m => m.type === 'image' || m.thumbnail).slice(0, 5).map((m) => (
                    <button
                      key={m.file_id}
                      onClick={() => setSelectedImage(m)}
                      className={`relative w-14 h-14 rounded-lg overflow-hidden border flex-shrink-0 transition-all ${
                        selectedImage?.file_id === m.file_id
                          ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-105'
                          : 'border-[#2d3042] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={m.thumbnail || m.url} alt={m.filename} className="w-full h-full object-cover" />
                      {selectedImage?.file_id === m.file_id && (
                        <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-14 h-14 rounded-lg border border-dashed border-[#2d3042] hover:border-indigo-500/50 flex flex-col items-center justify-center text-neutral-400 hover:text-white transition-colors flex-shrink-0"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-[8px] mt-0.5">Tải mới</span>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadImage}
                />
              </div>
            </div>
          </div>

          {/* Step 2: Tùy chọn hoán đổi khuôn mặt */}
          <div className="p-3.5 rounded-xl bg-[#161825] border border-[#26293a]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>2. Hoán đổi khuôn mặt vào ảnh (Face Swap Blend)</span>
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useFaceSwap}
                  onChange={(e) => setUseFaceSwap(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#252838] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {useFaceSwap && (
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[#232635]">
                {sourceFaceCrop ? (
                  <div className="flex items-center gap-2.5">
                    <img
                      src={sourceFaceCrop}
                      alt="Mặt hoán đổi"
                      className="w-10 h-10 rounded-full border-2 border-purple-500 object-cover"
                    />
                    <div>
                      <span className="text-xs font-semibold text-purple-200 block">Khuôn mặt nguồn đã nạp</span>
                      <span className="text-[10px] text-neutral-400">buffalo_l + inswapper_128 + Reinhard LAB tone</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-amber-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Chưa có mặt nguồn. Vào tab "Mặt Nguồn" tải ảnh chân dung trước để ghép.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 3: Chọn phong cách chuyển động điện ảnh */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              3. Chọn phong cách chuyển động điện ảnh AI
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {MOTION_STYLES.map((style) => {
                const isSelected = motionStyle === style.id;
                return (
                  <div
                    key={style.id}
                    onClick={() => setMotionStyle(style.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 ring-1 ring-indigo-500/50 shadow-md'
                        : 'bg-[#151722] border-[#252838] hover:border-[#383c52] hover:bg-[#1a1c2a]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{style.icon}</span>
                        <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-neutral-200'}`}>
                          {style.name}
                        </span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                        {style.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-relaxed">
                      {style.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 4: Thời lượng & FPS */}
          <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-[#161825] border border-[#252838]">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Thời lượng:</span>
                </span>
                <span className="text-xs font-mono text-indigo-400 font-bold">{duration}s</span>
              </div>
              <input
                type="range"
                min="3"
                max="15"
                step="1"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#25283a] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[9px] text-neutral-500 mt-1">
                <span>3s (Nhanh)</span>
                <span>6s (Chuẩn)</span>
                <span>15s (Dài)</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1">
                  <Film className="w-3.5 h-3.5 text-purple-400" />
                  <span>Tốc độ khung hình:</span>
                </span>
                <span className="text-xs font-mono text-purple-400 font-bold">{fps} FPS</span>
              </div>
              <div className="flex gap-2">
                {[24, 30, 60].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFps(f)}
                    className={`flex-1 py-1 rounded text-xs font-semibold transition-colors border ${
                      fps === f
                        ? 'bg-purple-600 border-purple-400 text-white'
                        : 'bg-[#1e202e] border-[#2b2e40] text-neutral-400 hover:text-white'
                    }`}
                  >
                    {f} fps
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Success Video Result Preview */}
          {createdMedia && (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Đã tạo video thành công và đưa vào Media Bin!</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400/80">
                  {createdMedia.duration}s · {createdMedia.width}x{createdMedia.height}
                </span>
              </div>
              <div className="h-44 rounded-lg overflow-hidden bg-black border border-[#2b2e40] relative">
                <video
                  src={`http://127.0.0.1:8000${createdMedia.url}`}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#232635] bg-[#151722] flex items-center justify-between">
          <div className="text-xs text-neutral-400">
            {isProcessing ? (
              <span className="text-indigo-400 animate-pulse flex items-center gap-2">
                <Wand2 className="w-4 h-4 animate-spin" />
                <span>Đang render video chuyển động điện ảnh ({fps * duration} khung hình)...</span>
              </span>
            ) : (
              <span>Xuất chuẩn MP4 H.264 · Hoàn toàn Offline</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-[#202332] transition-colors disabled:opacity-50"
            >
              {createdMedia ? 'Đóng' : 'Hủy'}
            </button>

            <button
              onClick={handleGenerate}
              disabled={isProcessing || !selectedImage}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang xử lý AI...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Tạo Video Chuyển Động AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
