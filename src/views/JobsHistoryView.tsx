import React, { useState, useMemo } from 'react';
import { db } from '../services/db';
import { VideoJob, JobStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { VideoJobProgressModal } from '../components/video/VideoJobProgressModal';
import { 
  Video, Play, Download, Share2, CheckCircle2, Clock, AlertTriangle, 
  ExternalLink, Sparkles, Filter, Mail 
} from 'lucide-react';

export const JobsHistoryView: React.FC<{ onNavigateCreate: () => void }> = ({ onNavigateCreate }) => {
  const { currentUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'ALL' | JobStatus>('ALL');
  const [selectedJob, setSelectedJob] = useState<VideoJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const jobs = useMemo(() => {
    const list = db.getJobs(currentUser?.id);
    if (statusFilter === 'ALL') return list;
    return list.filter((j) => j.status === statusFilter);
  }, [currentUser?.id, statusFilter, isModalOpen]);

  const handleOpenJob = (job: VideoJob) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleShareGmail = (job: VideoJob) => {
    const subject = encodeURIComponent(`[ZenStudio PRO] Chia sẻ video Face Swap: ${job.templateTitle}`);
    const videoUrl = job.outputUrl || window.location.href;
    const body = encodeURIComponent(
      `Xin chào,\n\nAdmin hệ thống ZenStudio PRO (thaytiensy@gmail.com) xin gửi bạn video đã render thành công:\n` +
      `- Tên video: ${job.templateTitle}\n` +
      `- Link xem / tải video: ${videoUrl}\n` +
      `- Watermark bản quyền: ${job.appliedWatermark || 'Bản quyền ZenStudio PRO'}\n` +
      `- Số khuôn mặt ghép: ${job.faces.length}\n` +
      `- Thời gian tạo: ${new Date(job.createdAt).toLocaleString('vi-VN')}\n\n` +
      `---\nZenStudio AI Face-Swap Platform - Email Quản Trị: thaytiensy@gmail.com`
    );
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Lịch Sử Video Đã Render</span>
            <span className="text-xs font-mono text-neutral-400">({jobs.length} video)</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Quản lý các bản render face-swap, tải file MP4 chất lượng cao và kiểm tra trạng thái hàng đợi BullMQ
          </p>
        </div>

        <button
          onClick={onNavigateCreate}
          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>Tạo Video Mới</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[11px] text-neutral-400 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Trạng thái:
        </span>
        {(['ALL', 'COMPLETED', 'PROCESSING', 'FAILED'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === st
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {st === 'ALL'
              ? 'Tất cả'
              : st === 'COMPLETED'
              ? 'Thành công'
              : st === 'PROCESSING'
              ? 'Đang xử lý'
              : 'Thất bại'}
          </button>
        ))}
      </div>

      {/* Jobs List / Grid */}
      {jobs.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-dashed border-neutral-800 bg-[#10131d] space-y-3">
          <Video className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">Chưa có video nào được xuất</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Hàng đợi đang trống. Bạn có thể tải video lên để đổi mặt tự động hoặc tạo video điện ảnh sống động từ ảnh tĩnh.
          </p>
          <button
            onClick={onNavigateCreate}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20"
          >
            Bắt đầu tạo video ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => {
            const isDone = job.status === 'COMPLETED';
            const isProcessing = job.status === 'PROCESSING';

            return (
              <div
                key={job.id}
                className="bg-[#111420] border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors flex flex-col justify-between"
              >
                {/* Media Container */}
                <div className="relative aspect-video bg-black overflow-hidden group">
                  {job.outputUrl && isDone ? (
                    <video
                      src={job.outputUrl}
                      muted
                      loop
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#151928] flex items-center justify-center">
                      <Video className="w-8 h-8 text-neutral-600" />
                    </div>
                  )}

                  {/* Play / View Overlay */}
                  <button
                    type="button"
                    onClick={() => handleOpenJob(job)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                      <Play className="w-4 h-4 ml-0.5 fill-white" />
                    </div>
                  </button>

                  {/* Status Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    {isDone ? (
                      <span className="px-2 py-0.5 bg-emerald-500/80 backdrop-blur-md text-white rounded text-[10px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Thành công
                      </span>
                    ) : isProcessing ? (
                      <span className="px-2 py-0.5 bg-indigo-500/80 backdrop-blur-md text-white rounded text-[10px] font-semibold flex items-center gap-1 animate-pulse">
                        <Clock className="w-3 h-3" /> Đang render ({job.progress}%)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-red-500/80 backdrop-blur-md text-white rounded text-[10px] font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Lỗi
                      </span>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 bg-black/70 backdrop-blur-md rounded text-[10px] font-mono text-neutral-300">
                    {job.durationSeconds}s
                  </div>
                </div>

                {/* Body Meta */}
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-white truncate">{job.templateTitle}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                      <span>{job.videoFileName || job.industry || 'Video tải lên'}</span>
                      <span>·</span>
                      <span className="font-mono tabular-nums">
                        {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {/* Faces Thumbnails */}
                  <div className="flex items-center gap-2 pt-1 border-t border-neutral-800/80">
                    <span className="text-[10px] text-neutral-400">Khuôn mặt:</span>
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {job.faces.map((f, fIdx) => (
                        <img
                          key={fIdx}
                          src={f.imageUrl}
                          alt={f.name}
                          className="inline-block h-5 w-5 rounded-full ring-2 ring-neutral-900 object-cover"
                          title={f.name}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 ml-auto truncate max-w-[120px]">
                      WM: {job.appliedWatermark || 'ZenStudio'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenJob(job)}
                      className="flex-1 py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3 h-3" /> Chi tiết
                    </button>
                    {isDone && job.outputUrl && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleShareGmail(job)}
                          className="p-1.5 bg-[#181d32] hover:bg-[#232b49] text-red-400 hover:text-red-300 rounded-lg transition-colors border border-neutral-700"
                          title="Chia sẻ video qua Gmail (Admin: thaytiensy@gmail.com)"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <a
                          href={job.outputUrl}
                          download="video.mp4"
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg transition-colors"
                          title="Tải MP4"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Progress Modal */}
      <VideoJobProgressModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
