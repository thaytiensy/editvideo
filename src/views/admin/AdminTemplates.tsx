import React, { useState, useMemo } from 'react';
import { db } from '../../services/db';
import { VideoJob } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  Video, Play, Trash2, Search, Download, CheckCircle2, Clock, 
  AlertTriangle, Filter, Mail, Film, ExternalLink 
} from 'lucide-react';

export const AdminTemplates: React.FC = () => {
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [jobs, setJobs] = useState<VideoJob[]>(() => db.getJobs());
  const [previewJob, setPreviewJob] = useState<VideoJob | null>(null);

  const reload = () => {
    setJobs(db.getJobs());
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const matchSearch =
        j.templateTitle.toLowerCase().includes(search.toLowerCase()) ||
        j.userEmail.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || j.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [jobs, search, statusFilter]);

  const handleDeleteJob = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa video này khỏi lịch sử hệ thống?')) {
      db.deleteJob(id);
      reload();
    }
  };

  const handleShareGmail = (job: VideoJob) => {
    const subject = encodeURIComponent(`[Admin ZenStudio] Chia sẻ video Face Swap: ${job.templateTitle}`);
    const videoUrl = job.outputUrl || window.location.href;
    const body = encodeURIComponent(
      `Xin chào,\n\nAdmin Thầy Tiến Sỹ (thaytiensy@gmail.com) chia sẻ video render:\n` +
      `- Tên video: ${job.templateTitle}\n` +
      `- Người tạo: ${job.userEmail}\n` +
      `- Link xem video: ${videoUrl}\n` +
      `- Watermark: ${job.appliedWatermark || 'Bản quyền PRO'}\n\n` +
      `Trân trọng,\nAdmin Thầy Tiến Sỹ`
    );
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-indigo-400" />
            <span>Quản Lý Video Render & Tải Lên Toàn Hệ Thống</span>
            <span className="text-xs font-mono text-neutral-400">({jobs.length} video)</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Theo dõi tất cả video người dùng tải lên và render thật qua trình xử lý Canvas & MediaRecorder
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên video, email..."
            className="w-full bg-[#121420] border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[11px] text-neutral-400 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Lọc trạng thái:
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
            {st === 'ALL' ? 'Tất cả' : st === 'COMPLETED' ? 'Đã hoàn tất' : st === 'PROCESSING' ? 'Đang xử lý' : 'Thất bại'}
          </button>
        ))}
      </div>

      {/* Video Jobs Table */}
      <div className="bg-[#10131d] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141724] text-neutral-400 font-medium border-b border-neutral-800">
              <tr>
                <th className="py-3 px-5">Video / Tên File</th>
                <th className="py-3 px-5">Người Dùng</th>
                <th className="py-3 px-5">Thời Lượng</th>
                <th className="py-3 px-5">Số Mặt Ghép</th>
                <th className="py-3 px-5">Trạng Thái</th>
                <th className="py-3 px-5">Thời Gian</th>
                <th className="py-3 px-5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    Chưa có video render nào trong hệ thống. Hãy vào Studio để tải video lên và đổi mặt!
                  </td>
                </tr>
              ) : (
                filteredJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-[#141828]/50 transition-colors">
                    <td className="py-3 px-5">
                      <div className="font-semibold text-white truncate max-w-xs">{j.templateTitle}</div>
                      <div className="text-[11px] text-neutral-500 font-mono truncate max-w-xs">
                        WM: {j.appliedWatermark || 'Art Video PRO'}
                      </div>
                    </td>
                    <td className="py-3 px-5 font-mono text-neutral-300">{j.userEmail}</td>
                    <td className="py-3 px-5 font-mono text-neutral-300">{j.durationSeconds}s</td>
                    <td className="py-3 px-5 font-mono text-indigo-400 font-bold">{j.faces.length} khuôn mặt</td>
                    <td className="py-3 px-5">
                      {j.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Hoàn tất
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" /> {j.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-5 font-mono text-neutral-400">
                      {new Date(j.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-5 text-right space-x-2">
                      {j.outputUrl && (
                        <>
                          <button
                            type="button"
                            onClick={() => setPreviewJob(j)}
                            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                            title="Xem video"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShareGmail(j)}
                            className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-[#1d1f33] transition-colors"
                            title="Gửi Gmail"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <a
                            href={j.outputUrl}
                            download="video_faceswap.mp4"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block p-1.5 text-indigo-400 hover:text-indigo-300 rounded-lg hover:bg-neutral-800 transition-colors"
                            title="Tải video"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteJob(j.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors"
                        title="Xóa video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewJob && previewJob.outputUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-[#10131d] border border-neutral-800 rounded-2xl w-full max-w-xl p-5 shadow-2xl relative text-left">
            <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-2">
              <h3 className="text-sm font-semibold text-white">{previewJob.templateTitle}</h3>
              <button
                onClick={() => setPreviewJob(null)}
                className="text-neutral-400 hover:text-white text-xs px-2 py-1 rounded bg-neutral-800"
              >
                Đóng
              </button>
            </div>
            <div className="aspect-video bg-black rounded-xl overflow-hidden mb-3">
              <video
                src={previewJob.outputUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-mono">User: {previewJob.userEmail}</span>
              <a
                href={previewJob.outputUrl}
                download="video.mp4"
                className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Tải Video Về Máy
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
