import React, { useState } from 'react';
import { UploadCloud, Film, Music, Image as ImageIcon, Plus } from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';

export const MediaBinPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'audio' | 'image'>('all');
  const addClip = useEditorStore((s) => s.addClip);

  const mediaItems = [
    {
      id: 'm1',
      name: 'Runway_Model_4K.mp4',
      type: 'video',
      duration: 15,
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumb: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'm2',
      name: 'Ceramic_Kettle_Demo.mp4',
      type: 'video',
      duration: 12,
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      thumb: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const handleAddMediaToTimeline = (m: any) => {
    addClip('track-v1', {
      id: `clip-${Date.now()}`,
      trackId: 'track-v1',
      name: m.name,
      sourceUrl: m.url,
      type: m.type,
      start: 8,
      duration: m.duration,
      inPoint: 0,
      outPoint: m.duration,
      speed: 1.0,
      volume: 1.0,
      muted: false,
      opacity: 1.0,
      blendMode: 'normal',
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
      filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, hueRotate: 0 },
      keyframes: {},
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0D0F1A] border-r border-[#1E2338] select-none text-xs">
      {/* Category Tabs */}
      <div className="h-10 border-b border-[#1E2338] px-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${activeTab === 'all' ? 'bg-[#1E2338] text-amber-400' : 'text-neutral-400'}`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${activeTab === 'video' ? 'bg-[#1E2338] text-amber-400' : 'text-neutral-400'}`}
          >
            Videos
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${activeTab === 'audio' ? 'bg-[#1E2338] text-amber-400' : 'text-neutral-400'}`}
          >
            Audio
          </button>
        </div>

        <label className="p-1 rounded-lg bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          <input type="file" className="hidden" />
        </label>
      </div>

      {/* Media Bin List */}
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2.5 custom-scrollbar">
        {mediaItems.map((m) => (
          <div
            key={m.id}
            onClick={() => handleAddMediaToTimeline(m)}
            className="group relative rounded-xl overflow-hidden border border-[#232840] bg-[#121524] cursor-pointer hover:border-amber-400 transition-all flex flex-col"
          >
            <div className="aspect-video relative overflow-hidden bg-black">
              <img src={m.thumb} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <span className="absolute bottom-1 right-1 px-1 rounded bg-black/70 text-[9px] font-mono text-neutral-300">
                {m.duration}s
              </span>
            </div>
            <div className="p-1.5 truncate text-[10px] text-neutral-300 font-medium">
              {m.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
