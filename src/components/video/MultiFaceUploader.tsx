import React, { useState } from 'react';
import { Plus, Trash2, ShieldCheck, AlertCircle, Check, UploadCloud, User } from 'lucide-react';
import { FaceItem } from '../../types';
import { LivenessModal } from './LivenessModal';
import { CELEBRITY_BLOCKLIST } from '../../services/db';

interface MultiFaceUploaderProps {
  faces: FaceItem[];
  onChange: (faces: FaceItem[]) => void;
  maxFacesAllowed?: number;
}

const PRESET_PORTRAITS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
];

export const MultiFaceUploader: React.FC<MultiFaceUploaderProps> = ({
  faces,
  onChange,
  maxFacesAllowed = 5,
}) => {
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);

  const addFace = () => {
    if (faces.length >= maxFacesAllowed) return;
    const newIndex = faces.length + 1;
    const newFace: FaceItem = {
      id: `face-${Date.now()}-${newIndex}`,
      name: `Khuôn mặt #${newIndex}`,
      imageUrl: PRESET_PORTRAITS[(newIndex - 1) % PRESET_PORTRAITS.length],
      consentTick: false,
      livenessPassed: false,
      estimatedAge: 24,
    };
    onChange([...faces, newFace]);
  };

  const removeFace = (index: number) => {
    if (faces.length <= 1) return;
    const updated = faces.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const updateFace = (index: number, patch: Partial<FaceItem>) => {
    const updated = [...faces];
    updated[index] = { ...updated[index], ...patch };

    // Check celebrity on name change
    if (patch.name !== undefined) {
      const lower = patch.name.toLowerCase();
      const detected = CELEBRITY_BLOCKLIST.find((c) => lower.includes(c));
      updated[index].detectedCelebrity = detected || null;
    }

    onChange(updated);
  };

  const handleCustomPhoto = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateFace(index, { imageUrl: url });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Danh Sách Khuôn Mặt Ghép ({faces.length}/{maxFacesAllowed})</span>
            <span className="text-[11px] font-normal text-neutral-400">· Tối đa 5 mặt</span>
          </h4>
          <p className="text-xs text-neutral-400 mt-0.5">
            Bảo mật pháp lý đa lớp: Bắt buộc Liveness 2s + Cam kết bản quyền chân dung
          </p>
        </div>

        {faces.length < maxFacesAllowed && (
          <button
            type="button"
            onClick={addFace}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm Khuôn Mặt
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {faces.map((face, index) => {
          const isCelebrity = !!face.detectedCelebrity;
          const isUnderage = face.estimatedAge !== undefined && face.estimatedAge < 18;

          return (
            <div
              key={face.id}
              className={`p-4 rounded-xl border transition-all ${
                isCelebrity || isUnderage
                  ? 'bg-red-950/20 border-red-500/50'
                  : face.livenessPassed && face.consentTick
                  ? 'bg-[#121622] border-indigo-500/30'
                  : 'bg-[#11131c] border-neutral-800'
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Left: Avatar + Details */}
                <div className="flex items-center gap-3.5 w-full md:w-auto">
                  {/* Avatar Frame */}
                  <div className="relative group shrink-0">
                    <img
                      src={face.imageUrl}
                      alt={face.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-full object-cover border-2 border-neutral-700 group-hover:border-indigo-500 transition-colors"
                    />
                    <label className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                      <UploadCloud className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleCustomPhoto(index, e)}
                      />
                    </label>
                  </div>

                  {/* Name and Tag */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-neutral-400">#{index + 1}</span>
                      <input
                        type="text"
                        value={face.name}
                        onChange={(e) => updateFace(index, { name: e.target.value })}
                        placeholder="Nhập tên đối tượng (vd: Nguyễn Văn A)"
                        className="bg-transparent text-sm font-medium text-white border-b border-neutral-700 focus:border-indigo-400 outline-none pb-0.5 w-full"
                      />
                    </div>

                    {/* Quick Preset Avatars Picker */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-neutral-400">Chọn mẫu:</span>
                      {PRESET_PORTRAITS.map((url, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => updateFace(index, { imageUrl: url })}
                          className={`w-5 h-5 rounded-full overflow-hidden border transition-all ${
                            face.imageUrl === url ? 'border-indigo-400 scale-110' : 'border-neutral-700 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt="preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Actions & Liveness Trigger */}
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
                  {/* Liveness 2s Verification Button */}
                  <button
                    type="button"
                    onClick={() => setActiveModalIndex(index)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                      face.livenessPassed
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {face.livenessPassed ? (
                      <span>Liveness 2s Đạt ({face.livenessMotionScore || 96}%)</span>
                    ) : (
                      <span>Bắt buộc xác thực Liveness 2s</span>
                    )}
                  </button>

                  {/* Remove Button */}
                  {faces.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFace(index)}
                      className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg transition-colors"
                      title="Xóa khuôn mặt này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom: Mandatory Legal Consent Tickbox */}
              <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id={`consent-${face.id}`}
                  checked={face.consentTick}
                  onChange={(e) => updateFace(index, { consentTick: e.target.checked })}
                  className="mt-0.5 rounded border-neutral-700 bg-neutral-900 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor={`consent-${face.id}`}
                  className="text-xs text-neutral-300 cursor-pointer select-none leading-relaxed"
                >
                  <span className="font-semibold text-indigo-300">Cam kết chống kiện:</span> Tôi xác nhận đây là khuôn mặt của tôi hoặc tôi đã có văn bản ủy quyền hợp pháp của chủ sở hữu hình ảnh để tiến hành ghép mặt thương mại.
                </label>
              </div>

              {/* Security Warnings if Celebrity or Underage */}
              {isCelebrity && (
                <div className="mt-2.5 p-2 bg-red-950/40 border border-red-500/40 rounded-lg flex items-center gap-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>
                    <strong>CẢNH BÁO VI PHẠM:</strong> Tên "{face.detectedCelebrity}" trùng khớp người nổi tiếng trong Blocklist chống deepfake. AI sẽ từ chối render!
                  </span>
                </div>
              )}

              {isUnderage && (
                <div className="mt-2.5 p-2 bg-red-950/40 border border-red-500/40 rounded-lg flex items-center gap-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>
                    <strong>CHẶN ĐỘ TUỔI:</strong> AI phát hiện ước tính dưới 18 tuổi ({face.estimatedAge} tuổi). Nghiêm cấm mọi hành vi tạo video trẻ vị thành niên!
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Liveness Modal */}
      {activeModalIndex !== null && (
        <LivenessModal
          isOpen={true}
          faceIndex={activeModalIndex}
          onClose={() => setActiveModalIndex(null)}
          onLivenessSuccess={({ videoUrl, motionScore, estimatedAge }) => {
            updateFace(activeModalIndex, {
              livenessPassed: true,
              livenessVideoUrl: videoUrl,
              livenessMotionScore: motionScore,
              estimatedAge,
            });
          }}
        />
      )}
    </div>
  );
};
