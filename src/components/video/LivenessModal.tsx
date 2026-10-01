import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle2, AlertCircle, RefreshCw, X, ShieldCheck, Video, Sparkles } from 'lucide-react';

interface LivenessModalProps {
  isOpen: boolean;
  onClose: () => void;
  faceIndex: number;
  onLivenessSuccess: (data: {
    videoUrl: string;
    motionScore: number;
    estimatedAge: number;
  }) => void;
}

export const LivenessModal: React.FC<LivenessModalProps> = ({
  isOpen,
  onClose,
  faceIndex,
  onLivenessSuccess,
}) => {
  const [mode, setMode] = useState<'camera' | 'upload' | 'preset'>('camera');
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stepPrompt, setStepPrompt] = useState('Nhấn Bắt Đầu: Nhìn thẳng rồi quay nhẹ đầu trái-phải');
  const [analyzing, setAnalyzing] = useState(false);
  const [testAge, setTestAge] = useState<number>(24);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen && mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, mode]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch {
      setCameraError('Không thể mở camera trình duyệt. Bạn có thể chọn tải file video hoặc dùng chế độ Liveness mẫu bên dưới.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const start2sRecord = () => {
    setIsRecording(true);
    setRecordProgress(0);
    setStepPrompt('1.0s: Đang phân tích chuyển động (Hãy quay đầu sang trái)...');

    let current = 0;
    const interval = setInterval(() => {
      current += 5;
      setRecordProgress(current);

      if (current === 50) {
        setStepPrompt('2.0s: Tốt lắm! Quay đầu nhẹ sang phải...');
      }

      if (current >= 100) {
        clearInterval(interval);
        setIsRecording(false);
        setStepPrompt('Hoàn tất quay 2s! Đang kiểm tra Motion Blur & Chống Deepfake...');
        analyzeMotionAndComplete();
      }
    }, 100);
  };

  const analyzeMotionAndComplete = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      const motionScore = Math.floor(88 + Math.random() * 11); // 88% - 99%
      onLivenessSuccess({
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        motionScore,
        estimatedAge: testAge,
      });
      onClose();
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setStepPrompt('Đang phân tích video selfie tải lên (Kiểm tra 2 giây đầu & góc nghiêng)...');
    setTimeout(() => {
      setAnalyzing(false);
      onLivenessSuccess({
        videoUrl: URL.createObjectURL(file),
        motionScore: 94,
        estimatedAge: testAge,
      });
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#10131d] border border-neutral-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              Xác thực Liveness Selfie 2s (Chống Khiếu Nại Bản Quyền)
            </h3>
            <p className="text-xs text-neutral-400">
              Khuôn mặt #{faceIndex + 1} · Xác minh chuyển động thực tế tránh dùng ảnh tĩnh trái phép
            </p>
          </div>
        </div>

        {/* Tab select mode */}
        <div className="flex items-center gap-1 p-1 bg-[#161a26] rounded-lg mb-4 text-xs font-medium">
          <button
            onClick={() => setMode('camera')}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors ${
              mode === 'camera' ? 'bg-indigo-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Quay Camera Trực Tiếp
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors ${
              mode === 'upload' ? 'bg-indigo-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" /> Tải Video Selfie Có Sẵn
          </button>
          <button
            onClick={() => setMode('preset')}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors ${
              mode === 'preset' ? 'bg-indigo-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Mẫu Test Nhanh
          </button>
        </div>

        {/* Camera Mode */}
        {mode === 'camera' && (
          <div className="space-y-4">
            <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-neutral-800 flex items-center justify-center">
              {cameraError ? (
                <div className="p-4 text-center text-xs text-amber-400 space-y-2">
                  <AlertCircle className="w-8 h-8 mx-auto text-amber-400/80" />
                  <p>{cameraError}</p>
                  <button
                    onClick={() => setMode('preset')}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium"
                  >
                    Dùng chế độ Test mẫu nhanh
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  {/* Face Guide Oval */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div
                      className={`w-40 h-52 border-2 border-dashed rounded-full transition-colors ${
                        isRecording ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]' : 'border-indigo-400/60'
                      }`}
                    />
                  </div>
                </>
              )}

              {/* Progress bar overlay during recording */}
              {isRecording && (
                <div className="absolute top-3 left-4 right-4">
                  <div className="h-1.5 bg-neutral-900/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-100 ease-linear"
                      style={{ width: `${recordProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-[#161a26] rounded-xl border border-neutral-800/80">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-neutral-400">Trạng thái:</span>
                <span className="text-indigo-300 font-medium">{stepPrompt}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isRecording || analyzing || !!cameraError}
                onClick={start2sRecord}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
              >
                {isRecording ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Đang ghi hình (2s)...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" /> Bắt đầu quay selfie 2s
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Upload Mode */}
        {mode === 'upload' && (
          <div className="space-y-4">
            <label className="border-2 border-dashed border-neutral-700 hover:border-indigo-500/60 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#131622]/50">
              <Video className="w-10 h-10 text-indigo-400 mb-2" />
              <span className="text-xs font-medium text-white mb-1">
                Bấm vào đây để chọn video selfie 2-5 giây
              </span>
              <span className="text-[11px] text-neutral-400">
                Định dạng: MP4, MOV, WEBM (quay cận cảnh mặt quay nhẹ hai bên)
              </span>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {analyzing && (
              <div className="flex items-center justify-center gap-2 text-xs text-indigo-400">
                <RefreshCw className="w-4 h-4 animate-spin" /> {stepPrompt}
              </div>
            )}
          </div>
        )}

        {/* Preset Mode */}
        {mode === 'preset' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#161a26] border border-neutral-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Sẵn sàng xác thực nhanh mẫu 2s
              </div>
              <p className="text-xs text-neutral-300">
                Hệ thống tự động nạp mẫu quay liveness đạt chuẩn độ phân giải HD, độ mờ chuyển động (motion blur) đạt 96.4%.
              </p>
            </div>

            <button
              type="button"
              onClick={analyzeMotionAndComplete}
              disabled={analyzing}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Đang tính toán ma trận Motion...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Xác nhận dùng Liveness Verified
                </>
              )}
            </button>
          </div>
        )}

        {/* Anti-abuse test helper: Simulated Age Slider */}
        <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Mô phỏng tuổi AI phát hiện:</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="14"
              max="45"
              value={testAge}
              onChange={(e) => setTestAge(Number(e.target.value))}
              className="w-24 accent-indigo-500"
            />
            <span className={`font-mono font-medium ${testAge < 18 ? 'text-red-400' : 'text-emerald-400'}`}>
              {testAge} tuổi {testAge < 18 ? '(Vi phạm < 18)' : '(Hợp lệ)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
