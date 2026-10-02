import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Check, 
  X, 
  Video, 
  AlertCircle, 
  Zap,
  Play,
  Volume2,
  Image as ImageIcon
} from 'lucide-react';
import { db } from '../../services/db';
import { UploadedMedia } from '../../services/faceSwapApi';

interface DIDTalkingAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceFaceCrop: string | null;
  onVideoCreated?: (media: UploadedMedia) => void;
}

export const DIDTalkingAvatarModal: React.FC<DIDTalkingAvatarModalProps> = ({
  isOpen,
  onClose,
  sourceFaceCrop,
  onVideoCreated
}) => {
  const [speechText, setSpeechText] = useState('Xin chào! Tôi là người dẫn chương trình AI chuyên nghiệp.');
  const [voiceId, setVoiceId] = useState('vi-VN-HoaiMyNeural');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdVideoUrl, setCreatedVideoUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!speechText.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setStatusMsg('Đang gửi yêu cầu D-ID AI sinh video khẩu hình...');
    const keys = db.getAICloudKeys();

    try {
      const res = await fetch('http://127.0.0.1:8000/api/ai/did-animate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: keys.didApiKey,
          image_url: sourceFaceCrop || 'https://d-id-public-bucket.s3.amazonaws.com/alice.jpg',
          script_text: speechText.trim(),
          voice_id: voiceId
        })
      });

      const data = await res.json();
      if (data.status === 'success' && data.result_url) {
        setCreatedVideoUrl(data.result_url);
        setStatusMsg('Tạo video Avatar thành công!');

        if (onVideoCreated) {
          const newMedia: UploadedMedia = {
            file_id: `did-${Date.now()}`,
            filename: `did_avatar_${Date.now()}.mp4`,
            file_path: data.result_url,
            type: 'video',
            duration: 8,
            fps: 30,
            width: 720,
            height: 1280,
            thumbnail: sourceFaceCrop || undefined
          };
          onVideoCreated(newMedia);
        }
      } else {
        throw new Error(data.detail || 'Không thể tạo video từ D-ID API.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối D-ID API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none text-left">
      <div className="relative w-full max-w-xl bg-[#11131a] border border-[#2b2d3d] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Glow */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Header */}
        <div className="p-5 border-b border-[#232532] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Tạo Avatar Nói Bằng D-ID</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI BYOK
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Biến ảnh chân dung thành nhân vật cử động và nói khớp môi
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
            {/* Source Portrait Preview */}
            <div className="p-3 bg-[#161824] border border-[#272a3a] rounded-xl flex items-center gap-3">
              {sourceFaceCrop ? (
                <img
                  src={sourceFaceCrop}
                  alt="Source face"
                  className="w-14 h-14 rounded-lg object-cover border border-indigo-500/40"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-500">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1">
                <span className="font-semibold text-white block">
                  {sourceFaceCrop ? 'Đang dùng khuôn mặt nguồn đã chọn' : 'Chưa chọn mặt nguồn trong Studio'}
                </span>
                <p className="text-neutral-400 text-[11px] mt-0.5">
                  D-ID sẽ gắn chuyển động mắt, miệng và biểu cảm khớp với lời nói.
                </p>
              </div>
            </div>

            <div>
              <label className="text-neutral-300 font-semibold block mb-1">Lời thoại nhân vật sẽ phát biểu</label>
              <textarea
                value={speechText}
                onChange={(e) => setSpeechText(e.target.value)}
                rows={3}
                placeholder="Nhập câu chào, giới thiệu sản phẩm hoặc lời thoại..."
                className="w-full bg-[#181a26] border border-[#2c3044] focus:border-indigo-500 rounded-xl p-3 text-xs text-white outline-none"
                required
              />
            </div>

            <div>
              <label className="text-neutral-300 font-semibold block mb-1">Chọn Giọng Đọc & Ngôn Ngữ</label>
              <select
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                className="w-full bg-[#181a26] border border-[#2c3044] focus:border-indigo-500 rounded-xl p-2.5 text-xs text-white outline-none"
              >
                <option value="vi-VN-HoaiMyNeural">Tiếng Việt - Hoài My (Nữ, truyền cảm)</option>
                <option value="vi-VN-NamMinhNeural">Tiếng Việt - Nam Minh (Nam, tự tin)</option>
                <option value="en-US-JennyNeural">English (US) - Jenny (Female)</option>
                <option value="en-US-GuyNeural">English (US) - Guy (Male)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{statusMsg || 'Đang tạo avatar nói...'}</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Tạo Video Avatar Ngay</span>
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
                <span>Đã sinh video thành công (Đã nạp vào Media Bin):</span>
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
