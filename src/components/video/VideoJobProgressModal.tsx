import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Download, Share2, X, RefreshCw, Sparkles, Shield, Cpu, Mail } from 'lucide-react';
import { VideoJob } from '../../types';
import { videoPipeline } from '../../services/videoPipeline';
import confetti from 'canvas-confetti';

interface VideoJobProgressModalProps {
  job: VideoJob | null;
  isOpen: boolean;
  onClose: () => void;
  onJobFinished?: () => void;
}

export const VideoJobProgressModal: React.FC<VideoJobProgressModalProps> = ({
  job,
  isOpen,
  onClose,
  onJobFinished,
}) => {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('Đang khởi tạo job...');
  const [engine, setEngine] = useState('BullMQ Worker');
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalUrl, setFinalUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && job && job.status === 'PROCESSING') {
      setIsProcessing(true);
      setCurrentProgress(5);
      setCurrentStage('Xếp hàng vào cụm Redis Queue (BullMQ)...');
      setFinalUrl(null);

      videoPipeline
        .runPipelineJob(job.id, (prog, stage, eng) => {
          setCurrentProgress(prog);
          setCurrentStage(stage);
          setEngine(eng);
        })
        .then((url) => {
          setFinalUrl(url);
          setIsProcessing(false);
          try {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 },
            });
          } catch {}
          if (onJobFinished) onJobFinished();
        })
        .catch((err) => {
          setIsProcessing(false);
          setCurrentStage(`Lỗi pipeline: ${err.message}`);
        });
    } else if (job && job.status === 'COMPLETED' && job.outputUrl) {
      setFinalUrl(job.outputUrl);
      setCurrentProgress(100);
      setCurrentStage('Đã hoàn tất render video!');
      setIsProcessing(false);
    }
  }, [isOpen, job?.id]);

  if (!isOpen || !job) return null;

  const handleShare = () => {
    if (!finalUrl) return;
    navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareGmail = () => {
    const videoLink = finalUrl || window.location.href;
    const subject = encodeURIComponent(`[ZenStudio PRO] Chia sẻ video Face Swap: ${job.templateTitle}`);
    const body = encodeURIComponent(
      `Xin chào,\n\nAdmin hệ thống ZenStudio PRO (thaytiensy@gmail.com) xin gửi bạn video đã render hoàn tất:\n` +
      `- Tên video: ${job.templateTitle}\n` +
      `- Link xem / tải video: ${videoLink}\n` +
      `- Watermark bản quyền: ${job.appliedWatermark || 'Bản quyền ZenStudio PRO'}\n` +
      `- Thời lượng: ${job.durationSeconds}s · ${job.faces.length} khuôn mặt\n\n` +
      `---\nZenStudio AI Face-Swap Platform - Email Quản Trị: thaytiensy@gmail.com`
    );
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#10131e] border border-neutral-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/25 rounded-xl text-indigo-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              {isProcessing ? 'Real Video Engine Đang Xử Lý' : 'Render Video Hoàn Tất!'}
            </h3>
            <p className="text-xs text-neutral-400">
              Video: {job.templateTitle} · {job.faces.length} khuôn mặt ghép
            </p>
          </div>
        </div>

        {/* In-flight Processing view */}
        {isProcessing && (
          <div className="space-y-5">
            {/* Engine banner */}
            <div className="p-3.5 bg-[#151928] border border-neutral-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  Động cơ AI:
                </span>
                <span className="font-mono text-indigo-300 font-medium">{engine}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Hàng đợi:</span>
                <span className="font-mono text-emerald-400">BullMQ Redis Priority #1</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-300 font-medium truncate pr-2">{currentStage}</span>
                <span className="font-mono tabular-nums text-indigo-400 font-semibold">{currentProgress}%</span>
              </div>
              <div className="h-2 bg-[#1a1f33] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 transition-all duration-300 ease-out"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
            </div>

            {/* Face alignment thumbnail list */}
            <div className="pt-2">
              <span className="text-[11px] text-neutral-400 block mb-2 font-medium">
                Khuôn mặt nạp vào bộ xử lý AI Face-Swap:
              </span>
              <div className="flex items-center gap-3">
                {job.faces.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-1.5 bg-[#161a27] rounded-lg border border-neutral-800 text-xs text-neutral-300">
                    <img src={f.imageUrl} alt={f.name} className="w-7 h-7 rounded-full object-cover" />
                    <span className="truncate max-w-[90px]">{f.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Completed View */}
        {!isProcessing && finalUrl && (
          <div className="space-y-4">
            <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-neutral-800">
              <video
                src={finalUrl}
                controls
                autoPlay
                loop
                className="w-full h-full object-contain"
              />
              {/* Dynamic Watermark preview stamp */}
              <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[11px] font-mono text-white/90 border border-white/10 pointer-events-none">
                {job.appliedWatermark || 'Art Video PRO • ZenStudio'}
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
              <span className="text-emerald-300 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Xuất chuẩn 1080p MP4/WebM thành công!
              </span>
              <span className="text-neutral-400 font-mono text-[11px]">Động cơ: Real AI Canvas & MediaRecorder</span>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 pt-2">
              <a
                href={finalUrl}
                download={job.templateTitle ? `${job.templateTitle.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, '_')}.mp4` : 'art_video_render.mp4'}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20 whitespace-nowrap"
              >
                <Download className="w-4 h-4" /> Tải Video Về Máy
              </a>
              <button
                type="button"
                onClick={handleShareGmail}
                className="py-2.5 px-3.5 bg-[#1a1f35] hover:bg-[#252c4b] text-red-400 hover:text-red-300 font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-neutral-700 whitespace-nowrap"
                title="Chia sẻ video qua Gmail (Admin: thaytiensy@gmail.com)"
              >
                <Mail className="w-4 h-4" /> Gửi Gmail
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="py-2.5 px-3.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-neutral-700 whitespace-nowrap"
              >
                <Share2 className="w-4 h-4" />
                {copied ? 'Đã copy!' : 'Sao chép link'}
              </button>
            </div>
          </div>
        )}

        {/* Failure view */}
        {!isProcessing && !finalUrl && (
          <div className="space-y-4 text-center py-6">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
            <h4 className="text-sm font-semibold text-white">Quá trình render thất bại</h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">{currentStage}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs rounded-lg font-medium"
            >
              Đóng và kiểm tra lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
