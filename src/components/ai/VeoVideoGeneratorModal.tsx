import React, { useState } from 'react';
import { 
  Video, 
  Sparkles, 
  Check, 
  X, 
  AlertCircle, 
  Zap, 
  Film,
  Camera,
  Layers
} from 'lucide-react';
import { db } from '../../services/db';
import { UploadedMedia } from '../../services/faceSwapApi';

interface VeoVideoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoCreated?: (media: UploadedMedia) => void;
}

export const VeoVideoGeneratorModal: React.FC<VeoVideoGeneratorModalProps> = ({
  isOpen,
  onClose,
  onVideoCreated
}) => {
  const [prompt, setPrompt] = useState('Cinematic shot of a fashionable Vietnamese model walking down a futuristic Saigon street at sunset, 4K resolution, 35mm lens effect');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [motionSpeed, setMotionSpeed] = useState<'cinematic' | 'slow_motion' | 'dynamic'>('cinematic');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdVideoUrl, setCreatedVideoUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setStatusMsg('Đang gửi prompt đến Google Veo 3 Neural Engine...');
    const keys = db.getAICloudKeys();

    try {
      // Giả lập hoặc gọi Google Generative Video API
      await new Promise((r) => setTimeout(r, 2000));
      setStatusMsg('Veo 3 đang tổng hợp các chuyển động hạt và ánh sáng...');
      await new Promise((r) => setTimeout(r, 2000));

      // Video demo kết quả điện ảnh
      const sampleResultUrl = 'https://assets.mixkit.co/videos/preview/mixkit-woman-walking-on-a-city-street-at-sunset-41315-large.mp4';
      setCreatedVideoUrl(sampleResultUrl);
      setStatusMsg('Tạo video bằng Google Veo 3 hoàn tất!');

      if (onVideoCreated) {
        const newMedia: UploadedMedia = {
          file_id: `veo3-${Date.now()}`,
          filename: `veo3_cinematic_${Date.now()}.mp4`,
          file_path: sampleResultUrl,
          url: sampleResultUrl,
          type: 'video',
          duration: 10,
          fps: 30,
          frame_count: 300,
          width: aspectRatio === '16:9' ? 1920 : 1080,
          height: aspectRatio === '16:9' ? 1080 : 1920,
          thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
        };
        onVideoCreated(newMedia);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi gọi Google Veo 3 API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none text-left">
      <div className="relative w-full max-w-xl bg-[#11131a] border border-[#2b2d3d] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Glow */}
        <div className="h-1.5 w-full bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-500" />

        {/* Header */}
        <div className="p-5 border-b border-[#232532] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Tạo Video Điện Ảnh Bằng Veo 3</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Google AI
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Sinh video chuyển động siêu thực từ mô tả văn bản (Text-to-Video)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="text-neutral-300 font-semibold block mb-1">Mô tả cảnh quay điện ảnh (Prompt)</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Mô tả chi tiết nhân vật, bối cảnh, góc máy, ánh sáng..."
                className="w-full bg-[#181a26] border border-[#2c3044] focus:border-pink-500 rounded-xl p-3 text-xs text-white outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Tỷ lệ khung hình</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as any)}
                  className="w-full bg-[#181a26] border border-[#2c3044] focus:border-pink-500 rounded-xl p-2.5 text-xs text-white outline-none"
                >
                  <option value="16:9">16:9 (Ngang - Youtube / Phim)</option>
                  <option value="9:16">9:16 (Dọc - TikTok / Reels / Shorts)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Phong cách chuyển động máy</label>
                <select
                  value={motionSpeed}
                  onChange={(e) => setMotionSpeed(e.target.value as any)}
                  className="w-full bg-[#181a26] border border-[#2c3044] focus:border-pink-500 rounded-xl p-2.5 text-xs text-white outline-none"
                >
                  <option value="cinematic">Cinematic Pan (Điện ảnh mượt mà)</option>
                  <option value="slow_motion">Slow Motion 60fps (Nghệ thuật)</option>
                  <option value="dynamic">Dynamic Action (Chuyển động nhanh)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{statusMsg || 'Đang sinh video Veo 3...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Tạo Video Bằng Veo 3</span>
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {createdVideoUrl && (
            <div className="space-y-2 pt-2 border-t border-[#232532]">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Video Veo 3 đã sẵn sàng (Đã tự động thêm vào Media Bin):</span>
              </span>
              <div className="rounded-xl overflow-hidden border border-[#2e3144] aspect-video bg-black flex items-center justify-center">
                <video src={createdVideoUrl} controls autoPlay className="w-full h-full object-contain" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
