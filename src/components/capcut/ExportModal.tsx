import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Sparkles, 
  Film, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileVideo, 
  Play, 
  RotateCw,
  FolderOpen
} from 'lucide-react';
import { JobProgress, faceSwapApi, API_BASE_URL } from '../../services/faceSwapApi';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoPath: string;
  sourceImagePath: string;
  targetFaceIndex: number;
  inPoint: number;
  outPoint: number;
  duration: number;
  unifyCharacter: boolean;
  swapAllFaces: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  videoPath,
  sourceImagePath,
  targetFaceIndex,
  inPoint,
  outPoint,
  duration,
  unifyCharacter,
  swapAllFaces
}) => {
  const [resolution, setResolution] = useState<'720p' | '1080p' | '2k' | '4k' | '8k'>('1080p');
  const [exportRange, setExportRange] = useState<'all' | 'inout'>('all');
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobState, setJobState] = useState<JobProgress | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Poll for progress when jobId exists
  useEffect(() => {
    let timer: any = null;
    if (jobId && jobState?.status !== 'completed' && jobState?.status !== 'failed' && jobState?.status !== 'cancelled') {
      timer = setInterval(async () => {
        try {
          const res = await faceSwapApi.getJob(jobId);
          setJobState(res);
        } catch (e) {
          console.error(e);
        }
      }, 800);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [jobId, jobState?.status]);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    try {
      setIsStarting(true);
      setErrorMsg(null);
      const time_start = exportRange === 'inout' ? inPoint : 0;
      const time_end = exportRange === 'inout' ? outPoint : undefined;

      const res = await faceSwapApi.startExport({
        video_path: videoPath,
        source_image_path: sourceImagePath,
        target_face_index: swapAllFaces ? -1 : targetFaceIndex,
        time_start,
        time_end,
        resolution,
        unify_character: unifyCharacter
      });

      setJobId(res.job_id);
      setJobState({
        job_id: res.job_id,
        status: 'queued',
        progress: 0,
        current_frame: 0,
        total_frames: 0,
        fps: 0,
        eta_seconds: 0,
        output_file: '',
        download_url: '',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể bắt đầu quá trình xuất');
    } finally {
      setIsStarting(false);
    }
  };

  const handleCancelExport = async () => {
    if (jobId) {
      await faceSwapApi.cancelJob(jobId);
      setJobId(null);
      setJobState(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div className="w-full max-w-xl bg-[#14151c] border border-[#272a38] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#232532] flex items-center justify-between bg-[#171822]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Xuất Video Đổi Mặt (Export Studio)</h2>
              <p className="text-[11px] text-neutral-400">Động cơ INSightFace CPU + FFmpeg Audio Muxer</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (jobState?.status === 'processing') {
                if (window.confirm('Đang xuất video, bạn có chắc muốn hủy?')) {
                  handleCancelExport();
                  onClose();
                }
              } else {
                onClose();
              }
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#222432] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* If NOT exporting yet: Setup Form */}
          {!jobId && (
            <>
              {/* Resolution Selection */}
              <div>
                <label className="text-xs font-bold text-neutral-200 uppercase tracking-wider mb-2.5 block">
                  1. Chọn Độ Phân Giải (Resolution)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: '720p', label: '720p', desc: 'HD Nhanh' },
                    { id: '1080p', label: '1080p', desc: 'Full HD (Khuyên dùng)' },
                    { id: '2k', label: '2K', desc: '1440p QHD' },
                    { id: '4k', label: '4K', desc: 'Ultra HD' },
                    { id: '8k', label: '8K', desc: 'Extreme' },
                  ].map((res) => {
                    const isSelected = resolution === res.id;
                    return (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => setResolution(res.id as any)}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500'
                            : 'bg-[#181a24] border-[#292c3a] text-neutral-400 hover:text-neutral-200 hover:border-[#383d50]'
                        }`}
                      >
                        <span className={`text-sm font-bold ${isSelected ? 'text-indigo-400' : 'text-neutral-200'}`}>
                          {res.label}
                        </span>
                        <span className="text-[9px] text-neutral-500 mt-1">{res.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Range Selection */}
              <div>
                <label className="text-xs font-bold text-neutral-200 uppercase tracking-wider mb-2 block">
                  2. Phạm Vi Thời Gian (Timeline Range)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setExportRange('all')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      exportRange === 'all'
                        ? 'bg-purple-600/15 border-purple-500 text-white'
                        : 'bg-[#181a24] border-[#292c3a] text-neutral-400 hover:border-[#383d50]'
                    }`}
                  >
                    <div className="text-xs font-semibold text-neutral-200">Toàn Bộ Video</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">Từ 00:00 đến {Math.round(duration)}s</div>
                  </div>

                  <div
                    onClick={() => setExportRange('inout')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      exportRange === 'inout'
                        ? 'bg-purple-600/15 border-purple-500 text-white'
                        : 'bg-[#181a24] border-[#292c3a] text-neutral-400 hover:border-[#383d50]'
                    }`}
                  >
                    <div className="text-xs font-semibold text-neutral-200">Đoạn In - Out Đã Chọn</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      Từ {Math.round(inPoint)}s đến {Math.round(outPoint)}s ({Math.round(outPoint - inPoint)}s)
                    </div>
                  </div>
                </div>
              </div>

              {/* Character Unification Summary */}
              <div className="rounded-xl bg-[#181922] border border-[#262836] p-3 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-neutral-300 font-medium">
                    {swapAllFaces ? "Chế độ: Đổi toàn bộ mọi khuôn mặt" : "Chế độ: Thống nhất nhân vật đã chọn"}
                  </span>
                </div>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded font-mono">
                  Offline CPU 100%
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </>
          )}

          {/* If EXPORTING or COMPLETED: Progress / Results View */}
          {jobId && jobState && (
            <div className="space-y-4 py-2">
              {/* Progress Title & Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {jobState.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : jobState.status === 'failed' ? (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  ) : (
                    <RotateCw className="w-5 h-5 text-indigo-400 animate-spin" />
                  )}
                  <span className="text-sm font-bold text-white">
                    {jobState.status === 'completed'
                      ? 'Xuất Video Thành Công!'
                      : jobState.status === 'failed'
                      ? 'Lỗi trong quá trình xuất'
                      : 'Đang Xử Lý Hoán Đổi Khuôn Mặt...'}
                  </span>
                </div>

                <span className="font-mono text-sm font-bold text-indigo-400">
                  {Math.round(jobState.progress)}%
                </span>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-3 bg-[#1e202b] rounded-full overflow-hidden p-0.5 border border-[#2b2e3e]">
                <div
                  style={{ width: `${jobState.progress}%` }}
                  className={`h-full rounded-full transition-all duration-300 ${
                    jobState.status === 'completed'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : jobState.status === 'failed'
                      ? 'bg-red-500'
                      : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                  }`}
                />
              </div>

              {/* Progress Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-[#171922] border border-[#252836]">
                  <span className="text-[10px] text-neutral-400 block">Khung hình</span>
                  <span className="font-mono text-xs font-semibold text-neutral-200">
                    {jobState.current_frame} / {jobState.total_frames || '...'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#171922] border border-[#252836]">
                  <span className="text-[10px] text-neutral-400 block">Tốc độ (CPU)</span>
                  <span className="font-mono text-xs font-semibold text-cyan-400">
                    {jobState.fps} FPS
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#171922] border border-[#252836]">
                  <span className="text-[10px] text-neutral-400 block">Thời gian còn lại</span>
                  <span className="font-mono text-xs font-semibold text-amber-400">
                    {jobState.eta_seconds > 0 ? `${jobState.eta_seconds}s` : 'Hoàn tất'}
                  </span>
                </div>
              </div>

              {/* Stage Info */}
              {jobState.stage && (
                <div className="text-center text-xs text-neutral-400">
                  {jobState.stage}
                </div>
              )}

              {/* Completed Video Player Preview & Download */}
              {jobState.status === 'completed' && jobState.download_url && (
                <div className="mt-4 p-4 rounded-xl bg-[#151720] border border-emerald-500/40 space-y-3">
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-black border border-neutral-800">
                    <video
                      src={`http://127.0.0.1:8000${jobState.download_url}`}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <a
                    href={`http://127.0.0.1:8000${jobState.download_url}`}
                    download={jobState.output_file}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải Video MP4 Về Máy ({resolution.toUpperCase()})</span>
                  </a>
                </div>
              )}

              {/* Error Message */}
              {jobState.status === 'failed' && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs">
                  {jobState.error || 'Có lỗi xảy ra khi xuất video.'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#232532] bg-[#171822] flex items-center justify-end gap-3">
          {!jobId ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white hover:bg-[#20222f] text-xs font-semibold transition-colors"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleStartExport}
                disabled={isStarting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20 active:scale-95 transition-transform disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Bắt Đầu Xuất Video ({resolution.toUpperCase()})</span>
              </button>
            </>
          ) : jobState?.status === 'processing' || jobState?.status === 'queued' ? (
            <button
              type="button"
              onClick={handleCancelExport}
              className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-semibold border border-red-800/50 transition-colors"
            >
              Hủy Quá Trình Xuất
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setJobId(null);
                setJobState(null);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors"
            >
              Đóng Cửa Sổ
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
