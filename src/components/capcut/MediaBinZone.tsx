import React, { useState, useRef } from 'react';
import { 
  FolderPlus, 
  Upload, 
  Video, 
  Image as ImageIcon, 
  User, 
  Check, 
  Sliders, 
  Trash2, 
  Sparkles, 
  Info,
  Clock,
  Layers,
  ChevronRight,
  ShieldCheck,
  Bot,
  Film,
  MessageSquare,
  Wand2,
  Settings2
} from 'lucide-react';
import { UploadedMedia, DetectedFace, faceSwapApi } from '../../services/faceSwapApi';
import { db } from '../../services/db';

interface MediaBinZoneProps {
  mediaList: UploadedMedia[];
  activeMedia: UploadedMedia | null;
  onSelectMedia: (media: UploadedMedia) => void;
  onUploadMedia: (file: File) => Promise<void>;
  onDeleteMedia: (fileId: string) => void;
  
  sourceFaceMedia: UploadedMedia | null;
  sourceFaceCrop: string | null;
  onUploadSourceFace: (file: File) => Promise<void>;
  
  unifyCharacter: boolean;
  onToggleUnifyCharacter: (val: boolean) => void;
  swapAllFaces: boolean;
  onToggleSwapAllFaces: (val: boolean) => void;
  
  isUploading: boolean;

  onOpenAiSettings: () => void;
  onOpenVeoModal: () => void;
  onOpenDidModal: () => void;
  onOpenGrokModal: () => void;
}

export const MediaBinZone: React.FC<MediaBinZoneProps> = ({
  mediaList,
  activeMedia,
  onSelectMedia,
  onUploadMedia,
  onDeleteMedia,
  sourceFaceMedia,
  sourceFaceCrop,
  onUploadSourceFace,
  unifyCharacter,
  onToggleUnifyCharacter,
  swapAllFaces,
  onToggleSwapAllFaces,
  isUploading,
  onOpenAiSettings,
  onOpenVeoModal,
  onOpenDidModal,
  onOpenGrokModal
}) => {
  const [activeTab, setActiveTab] = useState<'media' | 'faces' | 'settings'>('media');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faceInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await onUploadMedia(e.dataTransfer.files[0]);
    }
  };

  return (
    <aside className="w-80 sm:w-88 flex-shrink-0 bg-[#121318] border-r border-[#23252e] flex flex-col h-full select-none">
      {/* Tab Navigation */}
      <div className="flex border-b border-[#23252e] bg-[#14151b] px-2 pt-2 gap-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-2 px-2 rounded-t-lg flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'media'
              ? 'bg-[#1a1c24] text-white border-t-2 border-indigo-500 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#181920]'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-indigo-400" />
          <span>Video & Ảnh ({mediaList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('faces')}
          className={`flex-1 py-2 px-2 rounded-t-lg flex items-center justify-center gap-1.5 transition-colors relative ${
            activeTab === 'faces'
              ? 'bg-[#1a1c24] text-white border-t-2 border-purple-500 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#181920]'
          }`}
        >
          <User className="w-3.5 h-3.5 text-purple-400" />
          <span>Mặt Nguồn</span>
          {sourceFaceCrop && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-2 right-2 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-2 px-3 rounded-t-lg flex items-center justify-center transition-colors ${
            activeTab === 'settings'
              ? 'bg-[#1a1c24] text-white border-t-2 border-cyan-500 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#181920]'
          }`}
          title="Cài đặt AI & Tracking"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tab 1: Media Library */}
      {activeTab === 'media' && (
        <div className="flex-1 flex flex-col p-3 overflow-hidden">
          {/* Drag & Drop Upload Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-[#2e313d] bg-[#161820] hover:border-indigo-500/50 hover:bg-[#1a1c26]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onUploadMedia(e.target.files[0]);
                }
              }}
            />
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2">
              <FolderPlus className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-neutral-200">
              {isUploading ? "Đang xử lý tải lên..." : "Kéo thả hoặc Click để nạp video"}
            </p>
            <p className="text-[10px] text-neutral-400 mt-1">Hỗ trợ MP4, MOV, WEBM, JPG, PNG (CPU 100% Offline)</p>
          </div>

          {/* AI Cloud BYOK Action Bar */}
          <div className="mt-2.5 p-2 bg-[#161824] border border-[#26293a] rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-neutral-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Tùy Chọn AI Cloud BYOK:</span>
              </span>
              <button
                onClick={onOpenAiSettings}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                title="Dán API Key Veo 3 / D-ID / Grok"
              >
                <Settings2 className="w-3 h-3" />
                <span>Cấu hình Key</span>
              </button>
            </div>

            {/* Conditional AI Cloud Action Buttons */}
            <div className="flex flex-col gap-1.5">
              {db.hasCloudAI('veo') && (
                <button
                  onClick={onOpenVeoModal}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-pink-600/30 to-rose-600/30 hover:from-pink-600/50 hover:to-rose-600/50 border border-pink-500/40 text-pink-200 text-[11px] font-semibold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-pink-400" />
                    <span>Tạo video bằng Veo 3</span>
                  </span>
                  <span className="text-[9px] bg-pink-500/20 text-pink-300 px-1 py-0.2 rounded font-mono">Google AI</span>
                </button>
              )}

              {db.hasCloudAI('did') && (
                <button
                  onClick={onOpenDidModal}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 border border-indigo-500/40 text-indigo-200 text-[11px] font-semibold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Tạo avatar nói bằng D-ID</span>
                  </span>
                  <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1 py-0.2 rounded font-mono">Talking AI</span>
                </button>
              )}

              {db.hasCloudAI('grok') && (
                <button
                  onClick={onOpenGrokModal}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 border border-cyan-500/40 text-cyan-200 text-[11px] font-semibold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Viết kịch bản bằng Grok</span>
                  </span>
                  <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1 py-0.2 rounded font-mono">xAI</span>
                </button>
              )}

              {!db.hasCloudAI('veo') && !db.hasCloudAI('did') && !db.hasCloudAI('grok') && (
                <div className="text-[10px] text-neutral-400 py-0.5 leading-tight">
                  Chế độ CPU Offline 100% Miễn phí. Nhập Key để mở tính năng Veo 3 / D-ID / Grok.
                </div>
              )}
            </div>
          </div>

          {/* Media Items List */}
          <div className="flex-1 overflow-y-auto mt-2 pr-1 space-y-2">
            {mediaList.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-[#15161e] border border-[#21232c] text-neutral-400">
                <Video className="w-8 h-8 text-neutral-600 mb-2 opacity-50" />
                <span className="text-xs font-medium">Chưa có tệp video nào</span>
                <span className="text-[11px] text-neutral-500 mt-1">Bấm vùng trên để nạp video cần đổi khuôn mặt</span>
              </div>
            ) : (
              mediaList.map((m) => {
                const isSelected = activeMedia?.file_id === m.file_id;
                return (
                  <div
                    key={m.file_id}
                    onClick={() => onSelectMedia(m)}
                    className={`group relative flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'bg-[#171822] border-[#252834] hover:border-[#383b4c] hover:bg-[#1c1d2a]'
                    }`}
                  >
                    {/* Media Thumbnail */}
                    <div className="w-18 h-12 rounded-lg bg-black overflow-hidden flex-shrink-0 relative border border-[#2e3140]">
                      {m.thumbnail ? (
                        <img src={m.thumbnail} alt={m.filename} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-500">
                          <Video className="w-4 h-4" />
                        </div>
                      )}
                      {m.type === 'video' && (
                        <span className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.2 rounded text-[9px] font-mono text-neutral-300">
                          {Math.floor(m.duration)}s
                        </span>
                      )}
                    </div>

                    {/* Media Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-neutral-200 truncate group-hover:text-white" title={m.filename}>
                        {m.filename}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-400">
                        <span>{m.width}x{m.height}</span>
                        <span>·</span>
                        <span>{Math.round(m.fps)} FPS</span>
                      </div>
                    </div>

                    {/* Delete Action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteMedia(m.file_id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Xóa tệp khỏi dự án"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Target Source Face Bank */}
      {activeTab === 'faces' && (
        <div className="flex-1 flex flex-col p-3 overflow-y-auto space-y-4">
          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/30">
            <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Khuôn Mặt Nguồn Muốn Ghép</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Tải ảnh chân dung rõ mặt của người bạn muốn ghép vào video. AI sẽ tự động phân tích và trích xuất vector khuôn mặt.
            </p>
          </div>

          {/* Active Source Face Preview */}
          {sourceFaceCrop ? (
            <div className="relative rounded-xl border border-purple-500/40 bg-gradient-to-b from-[#1e1c2b] to-[#161622] p-4 flex flex-col items-center">
              <div className="w-28 h-28 rounded-full border-2 border-purple-400 p-1 bg-black shadow-xl overflow-hidden relative">
                <img
                  src={sourceFaceCrop}
                  alt="Khuôn mặt nguồn"
                  className="w-full h-full object-cover rounded-full"
                />
                <div className="absolute bottom-0 inset-x-0 bg-emerald-500/90 py-0.5 text-center text-[9px] font-bold text-black uppercase tracking-wider">
                  Đã Khóa Mặt
                </div>
              </div>

              <div className="mt-3 text-center">
                <p className="text-xs font-semibold text-white">Khuôn mặt thay thế chuẩn</p>
                <p className="text-[10px] text-purple-300 mt-0.5">Sẵn sàng hoán đổi vào các phân cảnh</p>
              </div>

              <button
                onClick={() => faceInputRef.current?.click()}
                className="mt-3 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700 flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Đổi ảnh chân dung khác</span>
              </button>
            </div>
          ) : (
            <div
              onClick={() => faceInputRef.current?.click()}
              className="border-2 border-dashed border-purple-500/30 hover:border-purple-500/70 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-[#181622] hover:bg-[#1e1a2d] transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center mb-3">
                <User className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-neutral-200">Tải Ảnh Chân Dung (Mặt Nguồn)</p>
              <p className="text-[10px] text-neutral-400 mt-1">Ảnh cận cảnh hoặc rõ khuôn mặt để chất lượng cao nhất</p>
            </div>
          )}

          <input
            ref={faceInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onUploadSourceFace(e.target.files[0]);
              }
            }}
          />

          {/* Quick Preset Tips */}
          <div className="rounded-xl bg-[#161720] border border-[#232530] p-3 text-[11px] text-neutral-400 space-y-2">
            <span className="font-semibold text-neutral-300 block">💡 Mẹo có kết quả đẹp nhất:</span>
            <ul className="list-disc pl-4 space-y-1 text-neutral-400 text-[10px]">
              <li>Dùng ảnh nguồn có độ sáng đồng đều, góc nhìn tương đối thẳng.</li>
              <li>buffalo_l và inswapper_128 hoạt động 100% trên CPU không cần GPU.</li>
              <li>Chuyển qua Preview để click chọn trực tiếp khuôn mặt mục tiêu trên video.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: AI & Tracking Settings */}
      {activeTab === 'settings' && (
        <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
          <div className="space-y-3">
            <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider block">
              Chế Độ Nhận Diện & Thống Nhất Nhân Vật
            </span>

            {/* Unify Character Toggle */}
            <div 
              onClick={() => onToggleUnifyCharacter(!unifyCharacter)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                unifyCharacter 
                  ? 'bg-indigo-600/15 border-indigo-500' 
                  : 'bg-[#161720] border-[#252834]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`w-4 h-4 ${unifyCharacter ? 'text-indigo-400' : 'text-neutral-500'}`} />
                  <span className="text-xs font-semibold text-neutral-200">Thống Nhất Nhân Vật (AI Embedding)</span>
                </div>
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                  unifyCharacter ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-neutral-600'
                }`}>
                  {unifyCharacter && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Tự động bám đuổi đúng nhân vật đã chọn xuyên suốt các bối cảnh và góc quay khác nhau trong video bằng cosine similarity.
              </p>
            </div>

            {/* Swap All Faces Toggle */}
            <div 
              onClick={() => onToggleSwapAllFaces(!swapAllFaces)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                swapAllFaces 
                  ? 'bg-purple-600/15 border-purple-500' 
                  : 'bg-[#161720] border-[#252834]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Layers className={`w-4 h-4 ${swapAllFaces ? 'text-purple-400' : 'text-neutral-500'}`} />
                  <span className="text-xs font-semibold text-neutral-200">Đổi Tất Cả Các Mặt</span>
                </div>
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                  swapAllFaces ? 'bg-purple-600 border-purple-500 text-white' : 'border-neutral-600'
                }`}>
                  {swapAllFaces && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Thay thế đồng loạt tất cả mọi khuôn mặt xuất hiện trong khung hình bằng khuôn mặt nguồn.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#161720] border border-[#232530] text-[11px] text-neutral-400 space-y-2">
            <span className="font-semibold text-neutral-300 block">⚙️ Cấu Hình Động Cơ:</span>
            <div className="flex justify-between text-[11px]">
              <span className="text-neutral-500">ONNX Provider:</span>
              <span className="text-cyan-400 font-mono">CPUExecutionProvider</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-neutral-500">Mô hình phát hiện:</span>
              <span className="text-neutral-300 font-mono">buffalo_l (SCRFD)</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-neutral-500">Mô hình hoán đổi:</span>
              <span className="text-neutral-300 font-mono">inswapper_128.onnx</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
