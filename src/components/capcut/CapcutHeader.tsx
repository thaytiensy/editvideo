import React from 'react';
import { 
  Video, 
  Cpu, 
  HardDrive, 
  HelpCircle, 
  Keyboard, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  Wand2,
  KeyRound
} from 'lucide-react';
import { HealthStatus } from '../../services/faceSwapApi';
import { db } from '../../services/db';

interface CapcutHeaderProps {
  health: HealthStatus | null;
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onOpenExport: () => void;
  onToggleGuide: () => void;
  onToggleHotkeys: () => void;
  isGuideActive: boolean;
  canExport: boolean;
  onSwitchView?: () => void;
  onOpenLicense?: () => void;
}

export const CapcutHeader: React.FC<CapcutHeaderProps> = ({
  health,
  projectName,
  onProjectNameChange,
  onOpenExport,
  onToggleGuide,
  onToggleHotkeys,
  isGuideActive,
  canExport,
  onSwitchView,
  onOpenLicense
}) => {
  const lic = db.checkAppLicense();
  return (
    <header className="h-14 bg-[#14151a] border-b border-[#23252e] px-4 flex items-center justify-between select-none z-30">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Video className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
                FaceSwap <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">PRO</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                CapCut Studio
              </span>
            </div>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-[#2a2c36]" />

        {/* Project Name Editor */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            className="bg-[#1c1e26] hover:bg-[#232630] focus:bg-[#232630] border border-transparent focus:border-indigo-500/50 rounded px-2.5 py-1 text-xs text-neutral-200 focus:outline-none transition-colors w-44 font-medium"
            placeholder="Tên dự án..."
          />
        </div>
      </div>

      {/* Center Hardware / Offline AI Status Badges */}
      <div className="hidden md:flex items-center gap-2 text-xs">
        {/* CPU Mode Badge */}
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1c1e26] border border-[#2a2c36] text-neutral-300 cursor-help"
          title="Chế độ CPU-only: Tối ưu cho mọi máy không có GPU rời, an toàn, không tốn tài nguyên GPU"
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-medium">CPU Only (Offline)</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        </div>

        {/* Model Status */}
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1c1e26] border border-[#2a2c36] text-neutral-300 cursor-help"
          title={health?.analyzer_ready && health?.swapper_ready ? "buffalo_l + inswapper_128.onnx đã sẵn sàng" : "Đang kiểm tra AI models..."}
        >
          <Wand2 className="w-3.5 h-3.5 text-purple-400" />
          <span>AI InsightFace:</span>
          {health?.analyzer_ready && health?.swapper_ready ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Sẵn sàng
            </span>
          ) : (
            <span className="text-amber-400 font-medium">Đang tải...</span>
          )}
        </div>

        {/* FFmpeg Badge */}
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1c1e26] border border-[#2a2c36] text-neutral-300"
          title="FFmpeg Audio Muxing & Encoding"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-neutral-400">FFmpeg:</span>
          <span className="text-neutral-200">Native</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* License Status & Activation Trigger */}
        {onOpenLicense && (
          <button
            onClick={onOpenLicense}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              lic.isLicensed
                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30 animate-pulse'
            }`}
            title={lic.isLicensed ? `Bản quyền ${lic.plan} hợp lệ. Click để xem chi tiết.` : 'Bản quyền chưa kích hoạt hoặc hết hạn! Click để nhập key.'}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{lic.isLicensed ? `License: ${lic.plan}` : 'Kích Hoạt Key'}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${lic.isLicensed ? 'bg-emerald-400' : 'bg-red-400'}`} />
          </button>
        )}

        {/* Switch to Web Hub / Admin if desired */}
        {onSwitchView && (
          <button
            onClick={onSwitchView}
            className="px-2.5 py-1.5 rounded-lg bg-[#1c1e26] hover:bg-[#272a36] text-neutral-400 hover:text-white transition-colors border border-[#2a2c36] text-xs"
            title="Mở Bảng Điều Khiển / Quản Trị Hệ Thống"
          >
            Quản trị & Phân quyền
          </button>
        )}

        {/* Hotkeys Button */}
        <button
          onClick={onToggleHotkeys}
          className="p-2 rounded-lg bg-[#1c1e26] hover:bg-[#272a36] text-neutral-400 hover:text-white transition-colors border border-[#2a2c36]"
          title="Phím tắt chỉnh sửa (Space, S, I, O...)"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Interactive Guide Toggle */}
        <button
          onClick={onToggleGuide}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
            isGuideActive 
              ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 shadow-sm' 
              : 'bg-[#1c1e26] text-neutral-300 border-[#2a2c36] hover:bg-[#272a36] hover:text-white'
          }`}
          title="Bật/Tắt hướng dẫn trực tiếp"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Hướng dẫn</span>
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          disabled={!canExport}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
            canExport
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/20 active:scale-95'
              : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
          }`}
          title={canExport ? "Xuất video chất lượng cao (720p - 8K)" : "Cần chọn video và ảnh khuôn mặt nguồn trước"}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Xuất Video</span>
          <span className="text-[10px] bg-white/20 px-1 py-0.2 rounded font-mono">4K</span>
        </button>
      </div>
    </header>
  );
};
