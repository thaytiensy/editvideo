import React from 'react';
import { useEditorStore } from '../../stores/useEditorStore';
import { Sliders, RotateCcw } from 'lucide-react';

export const InspectorPanel: React.FC = () => {
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const tracks = useEditorStore((s) => s.project.tracks);
  const updateClipProperties = useEditorStore((s) => s.updateClipProperties);

  let selectedClip = null;
  for (const t of tracks) {
    const c = t.clips.find((clip) => clip.id === selectedClipId);
    if (c) {
      selectedClip = c;
      break;
    }
  }

  if (!selectedClip) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-neutral-500 text-xs text-center select-none bg-[#0D0F1A]">
        Chọn một đoạn clip trên timeline để chỉnh sửa thuộc tính
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0D0F1A] border-l border-[#1E2338] p-3 space-y-4 text-xs select-none overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b border-[#1E2338] pb-2">
        <span className="font-bold text-neutral-200">INSPECTOR</span>
        <span className="text-[10px] text-amber-400 font-mono">{selectedClip.name}</span>
      </div>

      {/* Transform */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-neutral-400 block">TRANSFORM</span>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-neutral-500 block">Position X</label>
            <input
              type="number"
              value={selectedClip.transform.x}
              onChange={(e) =>
                updateClipProperties(selectedClip.id, {
                  transform: { ...selectedClip.transform, x: parseFloat(e.target.value) || 0 },
                })
              }
              className="w-full bg-[#141829] border border-[#232840] rounded px-2 py-1 text-neutral-200 text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] text-neutral-500 block">Position Y</label>
            <input
              type="number"
              value={selectedClip.transform.y}
              onChange={(e) =>
                updateClipProperties(selectedClip.id, {
                  transform: { ...selectedClip.transform, y: parseFloat(e.target.value) || 0 },
                })
              }
              className="w-full bg-[#141829] border border-[#232840] rounded px-2 py-1 text-neutral-200 text-xs"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
            <span>Scale ({Math.round(selectedClip.transform.scaleX * 100)}%)</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={3.0}
            step={0.05}
            value={selectedClip.transform.scaleX}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              updateClipProperties(selectedClip.id, {
                transform: { ...selectedClip.transform, scaleX: val, scaleY: val },
              });
            }}
            className="w-full accent-amber-400"
          />
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
            <span>Opacity ({Math.round(selectedClip.opacity * 100)}%)</span>
          </div>
          <input
            type="range"
            min={0}
            max={1.0}
            step={0.05}
            value={selectedClip.opacity}
            onChange={(e) =>
              updateClipProperties(selectedClip.id, {
                opacity: parseFloat(e.target.value),
              })
            }
            className="w-full accent-amber-400"
          />
        </div>
      </div>

      {/* Speed Ramping */}
      <div className="space-y-2 pt-2 border-t border-[#1E2338]">
        <div className="flex justify-between text-[11px] font-bold text-neutral-400">
          <span>SPEED RAMPING</span>
          <span className="font-mono text-amber-400">{selectedClip.speed}x</span>
        </div>
        <input
          type="range"
          min={0.25}
          max={4.0}
          step={0.25}
          value={selectedClip.speed}
          onChange={(e) =>
            updateClipProperties(selectedClip.id, {
              speed: parseFloat(e.target.value),
            })
          }
          className="w-full accent-amber-400"
        />
      </div>
    </div>
  );
};
