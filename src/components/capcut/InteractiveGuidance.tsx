import React from 'react';
import { 
  HelpCircle, 
  X, 
  CheckCircle, 
  ArrowRight, 
  MousePointer, 
  Sparkles, 
  Video, 
  User, 
  Scissors, 
  Download,
  Info
} from 'lucide-react';

interface InteractiveGuidanceProps {
  isOpen: boolean;
  onClose: () => void;
  hasMedia: boolean;
  hasSourceFace: boolean;
  hasDetectedFaces: boolean;
  hasSelectedFace: boolean;
}

export const InteractiveGuidance: React.FC<InteractiveGuidanceProps> = ({
  isOpen,
  onClose,
  hasMedia,
  hasSourceFace,
  hasDetectedFaces,
  hasSelectedFace
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: 1,
      title: "Bước 1: Nạp Video hoặc Ảnh Gốc",
      desc: "Kéo thả tệp video vào mục 'Video & Ảnh' bên trái hoặc bấm tải lên.",
      done: hasMedia,
      icon: Video,
      color: "text-indigo-400"
    },
    {
      num: 2,
      title: "Bước 2: Tải Ảnh Chân Dung (Mặt Nguồn)",
      desc: "Chuyển sang tab 'Mặt Nguồn' bên trái, tải ảnh chụp khuôn mặt người bạn muốn ghép vào.",
      done: hasSourceFace,
      icon: User,
      color: "text-purple-400"
    },
    {
      num: 3,
      title: "Bước 3: Click Chọn Mặt Trực Tiếp Trên Preview",
      desc: "AI tự động phát hiện mọi khuôn mặt trong khung hình. Click trực tiếp vào khung viền mặt trên video để chọn người muốn thay thế!",
      done: hasSelectedFace,
      icon: MousePointer,
      color: "text-cyan-400"
    },
    {
      num: 4,
      title: "Bước 4: Cắt Đoạn & Giới Hạn Timeline (Tùy chọn)",
      desc: "Sử dụng phím S để cắt clip, hoặc bấm [ Đặt In / Đặt Out ] để chỉ đổi mặt trong đoạn mong muốn.",
      done: true,
      icon: Scissors,
      color: "text-amber-400"
    },
    {
      num: 5,
      title: "Bước 5: Xuất Video Chất Lượng Cao (720p - 8K)",
      desc: "Bấm nút 'Xuất Video' góc trên bên phải. Chọn độ phân giải (720p/1080p/2K/4K/8K) và theo dõi thanh tiến trình realtime trên CPU.",
      done: hasMedia && hasSourceFace,
      icon: Download,
      color: "text-emerald-400"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-[#14151d] border border-[#282b3a] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#232532] flex items-center justify-between bg-[#171822]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Hướng Dẫn Sử Dụng Studio Đổi Mặt Pro (CapCut Style)</h2>
              <p className="text-[11px] text-neutral-400">Quy trình 5 bước cực nhanh - Hoạt động 100% Offline trên CPU</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#222432] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps List */}
        <div className="p-6 space-y-3 overflow-y-auto max-h-[70vh]">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className={`p-3.5 rounded-xl border flex items-start gap-3.5 transition-all ${
                  st.done
                    ? 'bg-[#181a24] border-emerald-500/40 shadow-sm'
                    : 'bg-[#151720] border-[#252836]'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  st.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {st.done ? <CheckCircle className="w-4 h-4" /> : <Icon className={`w-4 h-4 ${st.color}`} />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{st.title}</span>
                    {st.done && (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.2 rounded-full">
                        Đã sẵn sàng
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            );
          })}

          {/* CPU Note */}
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/30 flex items-center gap-3 text-cyan-300 text-xs">
            <Info className="w-5 h-5 flex-shrink-0 text-cyan-400" />
            <div>
              <strong className="block font-semibold">Tối Ưu 100% CPU Cho Mọi Máy Tính:</strong>
              <span className="text-neutral-400 text-[11px]">
                Hệ thống chạy hoàn toàn bằng ONNX CPU Provider với bộ lọc làm mượt chuyển động, bảo toàn âm thanh qua FFmpeg mà không cần GPU rời!
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#232532] bg-[#171822] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-transform"
          >
            Đã Hiểu - Bắt Đầu Sáng Tạo Ngay
          </button>
        </div>
      </div>
    </div>
  );
};

// Floating Dynamic Helper Banner
export const DynamicGuideHUD: React.FC<{
  hasMedia: boolean;
  hasSourceFace: boolean;
  hasSelectedFace: boolean;
  onOpenGuide: () => void;
}> = ({ hasMedia, hasSourceFace, hasSelectedFace, onOpenGuide }) => {
  let message = "";
  let tag = "";

  if (!hasMedia) {
    tag = "BƯỚC 1";
    message = "Kéo thả hoặc tải video vào Thư Viện bên trái để bắt đầu";
  } else if (!hasSourceFace) {
    tag = "BƯỚC 2";
    message = "Vào tab 'Mặt Nguồn' để tải ảnh khuôn mặt bạn muốn ghép vào video";
  } else if (!hasSelectedFace) {
    tag = "BƯỚC 3";
    message = "Click trực tiếp vào khuôn mặt trên màn hình Preview để chọn người cần thay thế";
  } else {
    tag = "SẴN SÀNG";
    message = "Bấm 'Xuất Video' ở góc trên để render video đổi mặt bằng CPU (720p - 8K)";
  }

  return (
    <div className="bg-[#12131a] border-t border-[#23252e] px-4 py-2 flex items-center justify-between text-xs select-none">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {tag}
        </span>
        <span className="text-neutral-300 font-medium">{message}</span>
      </div>

      <button
        onClick={onOpenGuide}
        className="text-neutral-400 hover:text-white flex items-center gap-1 text-[11px] underline underline-offset-2 transition-colors"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        <span>Xem toàn bộ hướng dẫn</span>
      </button>
    </div>
  );
};
