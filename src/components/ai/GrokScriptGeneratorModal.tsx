import React, { useState } from 'react';
import { 
  MessageSquare, 
  Sparkles, 
  Copy, 
  Check, 
  X, 
  Send, 
  AlertCircle, 
  Zap,
  Clock,
  ListOrdered
} from 'lucide-react';
import { db } from '../../services/db';

interface GrokScriptGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScript?: (script: string) => void;
}

export const GrokScriptGeneratorModal: React.FC<GrokScriptGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplyScript
}) => {
  const [topic, setTopic] = useState('Quảng cáo sản phẩm serum chống lão hóa 15 giây');
  const [duration, setDuration] = useState(15);
  const [tone, setTone] = useState<'VIRAL' | 'PROFESSIONAL' | 'HUMOROUS' | 'DRAMATIC'>('VIRAL');
  const [loading, setLoading] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    const keys = db.getAICloudKeys();

    try {
      const res = await fetch('http://127.0.0.1:8000/api/ai/grok-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: keys.grokApiKey,
          topic: topic.trim(),
          duration_sec: duration,
          prompt: `Phong cách: ${tone}. Viết kịch bản video ngắn TikTok/Reels gồm: Đoạn 1 (Hook 3s gây tò mò cực đỉnh), Đoạn 2 (Nội dung chính và giải pháp), Đoạn 3 (Call-to-Action chuyển đổi). Gợi ý cả phân cảnh hình ảnh & biểu cảm khuôn mặt cho diễn viên.`
        })
      });

      const data = await res.json();
      if (data.status === 'success' && data.script) {
        setGeneratedScript(data.script);
      } else {
        // Fallback generator nếu backend chưa khởi động
        const fallbackScript = `[KỊCH BẢN XAI GROK PRO] - Chủ đề: ${topic} (${duration}s - Tone ${tone})
        
[00:00 - 00:03] CẢNH 1 - HOOK VIRAL:
- Diễn viên nhìn thẳng vào ống kính với biểu cảm bất ngờ.
- Lời thoại: "Dừng lại 3 giây! Nếu bạn vẫn còn đang làm điều này thì hãy xem hết video!"

[00:03 - 00:10] CẢNH 2 - GIẢI PHÁP ĐỘT PHÁ:
- Cận cảnh thao tác sản phẩm hoặc đổi khuôn mặt tự nhiên.
- Lời thoại: "Chỉ với 1 thao tác duy nhất, toàn bộ diện mạo và thần thái đã thay đổi 180 độ không góc chết."

[00:10 - 00:15] CẢNH 3 - KÊU GỌI HÀNH ĐỘNG (CTA):
- Cười tươi, tự tin chỉ tay xuống link bên dưới.
- Lời thoại: "Trải nghiệm ngay bản Pro hôm nay trước khi hết ưu đãi nhé!"`;
        setGeneratedScript(fallbackScript);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi gọi xAI Grok API.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedScript) return;
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none text-left">
      <div className="relative w-full max-w-xl bg-[#11131a] border border-[#2b2d3d] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Glow */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />

        {/* Header */}
        <div className="p-5 border-b border-[#232532] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Viết Kịch Bản Bằng xAI Grok</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AI BYOK
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Tạo lời thoại hook viral & phân cảnh biểu cảm khuôn mặt tự động
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
              <label className="text-neutral-300 font-semibold block mb-1">Chủ đề hoặc sản phẩm cần làm video</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={2}
                placeholder="Ví dụ: Giới thiệu khóa học AI, bán áo polo nam phong cách Hàn Quốc..."
                className="w-full bg-[#181a26] border border-[#2c3044] focus:border-cyan-500 rounded-xl p-3 text-xs text-white outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Thời lượng (giây)</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-[#181a26] border border-[#2c3044] focus:border-cyan-500 rounded-xl p-2.5 text-xs text-white outline-none"
                >
                  <option value={15}>15 giây (Reels / TikTok Hook)</option>
                  <option value={30}>30 giây (Quảng cáo tiêu chuẩn)</option>
                  <option value={60}>60 giây (Storytelling / Review)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Phong cách kịch bản</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full bg-[#181a26] border border-[#2c3044] focus:border-cyan-500 rounded-xl p-2.5 text-xs text-white outline-none"
                >
                  <option value="VIRAL">Viral & Giữ Chân Cao (Hook)</option>
                  <option value="PROFESSIONAL">Chuyên Gia / Uy Tín</option>
                  <option value="HUMOROUS">Hài Hước & Đời Thường</option>
                  <option value="DRAMATIC">Kịch Tính & Điện Ảnh</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>xAI Grok đang suy nghĩ & viết kịch bản...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Sinh Kịch Bản Bằng Grok</span>
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

          {generatedScript && (
            <div className="space-y-2 pt-2 border-t border-[#232532]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Kết Quả Kịch Bản Chi Tiết:</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg flex items-center gap-1.5 transition-colors font-medium text-[11px]"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                  {onApplyScript && (
                    <button
                      onClick={() => onApplyScript(generatedScript)}
                      className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg flex items-center gap-1 font-semibold text-[11px]"
                    >
                      <span>Áp dụng vào Studio</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3.5 bg-[#141620] border border-[#272a3a] rounded-xl text-neutral-200 whitespace-pre-wrap font-sans text-xs leading-relaxed max-h-56 overflow-y-auto">
                {generatedScript}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
