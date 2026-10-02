import React, { useState, useMemo } from 'react';
import { db } from '../services/db';
import { VideoJob, JobStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { VideoJobProgressModal } from '../components/video/VideoJobProgressModal';
import { downloadVideoFile } from '../services/videoDownloader';
import { 
  Video, Play, Download, CheckCircle2, Clock, AlertTriangle, 
  Sparkles, Filter, Mail, Search, RefreshCw 
} from 'lucide-react';

export const JobsHistoryView: React.FC<{ onNavigateCreate: () => void }> = ({ onNavigateCreate }) => {
  const { currentUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'ALL' | JobStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<VideoJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const jobs = useMemo(() => {
    let list = db.getJobs(currentUser?.id);
    if (statusFilter !== 'ALL') {
      list = list.filter((j) => j.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((j) => 
        j.templateTitle.toLowerCase().includes(q) ||
        (j.videoFileName && j.videoFileName.toLowerCase().includes(q)) ||
        (j.industry && j.industry.toLowerCase().includes(q))
      );
    }
    return list;
  }, [currentUser?.id, statusFilter, searchQuery, isModalOpen]);

  const handleOpenJob = (job: VideoJob) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleDownload = async (e: React.MouseEvent, job: VideoJob) => {
    e.stopPropagation();
    if (!job.outputUrl) return;
    await downloadVideoFile(job.outputUrl, `${job.templateTitle || 'video_review'}.mp4`);
  };

  const handleShareGmail = (e: React.MouseEvent, job: VideoJob) => {
    e.stopPropagation();
    const subject = encodeURIComponent(`[ZenStudio PRO] Chia sẻ video Review AI: ${job.templateTitle}`);
    const videoUrl = job.outputUrl || window.location.href;
    const body = encodeURIComponent(
      `Xin chào,\n\nAdmin hệ thống ZenStudio PRO (thaytiensy@gmail.com) xin gửi bạn video đã render thành công:\n` +
      `- Tên video: ${job.templateTitle}\n` +
      `- Link xem / tải video: ${videoUrl}\n` +
      `- Watermark bản quyền: ${job.appliedWatermark || 'Bản quyền ZenStudio PRO'}\n` +
      `- Số khuôn mặt ghép: ${job.faces.length}\n` +
      `- Thời gian tạo: ${new Date(job.createdAt).toLocaleString('vi-VN')}\n\n` +
      `---\nZenStudio AI Platform - Email Quản Trị: thaytiensy@gmail.com`
    );
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-16 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Lịch Sử Video Đã Xuất</span>
            <span className="text-xs font-mono text-amber-400">({jobs.length} video)</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Quản lý các bản render video review AI, tải file MP4/WebM chất lượng cao về máy không bị lỗi
          </p>
        </div>

        <button
          onClick={onNavigateCreate}
          className="py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-600/20"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>Vào Studio Tạo Video Mới</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111422] p-3 rounded-xl border border-neutral-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm video đã xuất theo tên hoặc ngành nghề..."
            className="w-full bg-[#181d30] border border-[#27304e] rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto">
          <span className="text-[11px] text-neutral-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Trạng thái:
          </span>
          {(['ALL', 'COMPLETED', 'PROCESSING', 'FAILED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-amber-400 text-black font-bold'
                  : 'text-neutral-400 hover:text-white bg-[#181d30]'
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
      </div>

      {/* Jobs List / Grid */}
      {jobs.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-dashed border-neutral-800 bg-[#10131d] space-y-3">
          <Video className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">Chưa tìm thấy video nào</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            {searchQuery
              ? `Không có video nào khớp với từ khóa "${searchQuery}". Hãy thử tìm từ khóa khác.`
              : 'Hàng đợi đang trống. Bạn có thể vào Studio để tạo video review đa ngành nghề và xuất hàng loạt ngay bây giờ.'}
          </p>
          <button
            onClick={onNavigateCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
          >
            <Sparkles className="w-4 h-4" /> Bắt đầu tạo video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => {
            const isDone = job.status === 'COMPLETED';
            const isProcessing = job.status === 'PROCESSING';

            return (
              <div
                key={job.id}
                className="bg-[#10131d] border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all shadow-md group flex flex-col justify-between"
              >
                {/* Thumbnail / Video Preview */}
                <div className="relative aspect-video bg-black overflow-hidden">
                  {job.outputUrl && isDone ? (
                    <video
                      src={job.outputUrl}
                      muted
                      loop
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#151928] flex items-center justify-center">
                      <Video className="w-8 h-8 text-neutral-600" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    {isDone ? (
                      <span className="px-2 py-0.5 bg-emerald-500/90 backdrop-blur-md text-white rounded text-[10px] font-bold flex items-center gap-1 shadow">
                        <CheckCircle2 className="w-3 h-3" /> Thành công
                      </span>
                    ) : isProcessing ? (
                      <span className="px-2 py-0.5 bg-indigo-500/90 backdrop-blur-md text-white rounded text-[10px] font-semibold flex items-center gap-1 animate-pulse">
                        <Clock className="w-3 h-3" /> Đang render ({job.progress}%)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-red-500/90 backdrop-blur-md text-white rounded text-[10px] font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Lỗi
                      </span>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 bg-black/80 backdrop-blur-md rounded text-[10px] font-mono text-neutral-300">
                    {job.durationSeconds}s
                  </div>
                </div>

                {/* Body Meta */}
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-white truncate" title={job.templateTitle}>
                      {job.templateTitle}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                      <span>{job.videoFileName || job.industry || 'Video Review AI'}</span>
                      <span>·</span>
                      <span className="font-mono tabular-nums">
                        {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {/* Faces Thumbnails */}
                  <div className="flex items-center gap-2 pt-1 border-t border-neutral-800/80">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {job.faces.map((f, idx) => (
                        <img
                          key={idx}
                          src={f.imageUrl}
                          alt={f.name}
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-[#10131d] object-cover"
                          title={f.name}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 ml-auto truncate max-w-[120px]">
                      WM: {job.appliedWatermark || 'Art Video PRO'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenJob(job)}
                      className="flex-1 py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3 h-3 fill-current" /> Xem Lại
                    </button>
                    {isDone && job.outputUrl && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleShareGmail(e, job)}
                          className="p-1.5 bg-[#181d32] hover:bg-[#232b49] text-red-400 hover:text-red-300 rounded-lg transition-colors border border-neutral-700"
                          title="Chia sẻ video qua Gmail (Admin: thaytiensy@gmail.com)"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDownload(e, job)}
                          className="p-1.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg transition-colors border border-emerald-500/40"
                          title="Tải Video MP4 Về Máy"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Progress / Detail Modal */}
      <VideoJobProgressModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
