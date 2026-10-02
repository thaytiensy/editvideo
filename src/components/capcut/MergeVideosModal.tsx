import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Film, 
  Play, 
  Check, 
  AlertCircle,
  Plus,
  Combine
} from 'lucide-react';
import { UploadedMedia, faceSwapApi } from '../../services/faceSwapApi';

interface MergeVideosModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaList: UploadedMedia[];
  onMerged: (mergedMedia: UploadedMedia) => void;
}

export const MergeVideosModal: React.FC<MergeVideosModalProps> = ({
  isOpen,
  onClose,
  mediaList,
  onMerged
}) => {
  // Only video clips are eligible for merge
  const videoMedia = mediaList.filter(m => m.type === 'video');
  const [selectedQueue, setSelectedQueue] = useState<UploadedMedia[]>(() => {
    return videoMedia.slice(0, 4);
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...selectedQueue];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setSelectedQueue(next);
  };

  const moveDown = (index: number) => {
    if (index === selectedQueue.length - 1) return;
    const next = [...selectedQueue];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setSelectedQueue(next);
  };

  const removeClip = (fileId: string) => {
    setSelectedQueue(prev => prev.filter(m => m.file_id !== fileId));
  };

  const addClip = (media: UploadedMedia) => {
    if (!selectedQueue.some(m => m.file_id === media.file_id)) {
      setSelectedQueue(prev => [...prev, media]);
    }
  };

  const handleMerge = async () => {
    if (selectedQueue.length < 2) {
      setError('Cần ít nhất 2 video clip để ghép lại thành 1 video.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      const paths = selectedQueue.map(m => m.file_path);
      const merged = await faceSwapApi.mergeVideos({ video_paths: paths });
      onMerged(merged);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi trong quá trình ghép video.');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalDuration = selectedQueue.reduce((acc, m) => acc + (m.duration || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#12141c] border border-[#2b2e3e] w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#232635] flex items-center justify-between bg-[#151722]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <Combine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Ghép Nhiều Video (Merge Videos 🔗)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  FFmpeg Nối Liền Mạch
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Sắp xếp thứ tự các đoạn video và ghép thành 1 video duy nhất giữ nguyên âm thanh
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 flex items-start gap-3 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Video Sequence Order List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Thứ tự ghép các đoạn clip ({selectedQueue.length} clip)
              </label>
              <span className="text-xs font-mono text-emerald-400 font-semibold">
                Tổng: ~{Math.round(totalDuration)}s
              </span>
            </div>

            {selectedQueue.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-[#2b2e40] bg-[#161824] text-center text-xs text-neutral-400">
                Chưa có clip nào trong danh sách ghép. Bấm nút (+) bên dưới để thêm clip.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedQueue.map((clip, index) => (
                  <div
                    key={clip.file_id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#171924] border border-[#262838] hover:border-[#383c50] transition-colors"
                  >
                    <span className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-300 flex items-center justify-center text-xs font-bold font-mono">
                      {index + 1}
                    </span>

                    <div className="w-14 h-10 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-[#2b2e40]">
                      {clip.thumbnail ? (
                        <img src={clip.thumbnail} alt={clip.filename} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-600">
                          <Film className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-neutral-200 truncate">{clip.filename}</p>
                      <p className="text-[10px] text-neutral-400">{Math.round(clip.duration)}s · {clip.width}x{clip.height}</p>
                    </div>

                    {/* Move Up / Down Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="p-1 rounded text-neutral-400 hover:text-white hover:bg-[#232635] disabled:opacity-30"
                        title="Đẩy lên trước"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === selectedQueue.length - 1}
                        className="p-1 rounded text-neutral-400 hover:text-white hover:bg-[#232635] disabled:opacity-30"
                        title="Hạ xuống sau"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeClip(clip.file_id)}
                        className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-red-500/10 ml-1"
                        title="Bỏ clip này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add more clips from project */}
          {videoMedia.some(m => !selectedQueue.some(sq => sq.file_id === m.file_id)) && (
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1.5">
                Thêm clip khác từ dự án:
              </label>
              <div className="flex flex-wrap gap-2">
                {videoMedia
                  .filter(m => !selectedQueue.some(sq => sq.file_id === m.file_id))
                  .map(m => (
                    <button
                      key={m.file_id}
                      onClick={() => addClip(m)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#181a26] hover:bg-[#222536] border border-[#2b2e40] text-xs text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="truncate max-w-[150px]">{m.filename}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#232635] bg-[#151722] flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            {selectedQueue.length >= 2 ? `Sẵn sàng ghép ${selectedQueue.length} clip` : 'Cần chọn ít nhất 2 clip'}
          </span>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-[#202332] transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleMerge}
              disabled={isProcessing || selectedQueue.length < 2}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang ghép video...</span>
                </>
              ) : (
                <>
                  <Combine className="w-4 h-4" />
                  <span>Ghép {selectedQueue.length} Clip Thành 1 Video</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
