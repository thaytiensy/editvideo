'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TimelineContainer } from '../../../components/timeline/TimelineContainer';
import { ViewportPlayer } from '../../../components/viewport/ViewportPlayer';
import { MediaBinPanel } from '../../../components/panels/MediaBinPanel';
import { InspectorPanel } from '../../../components/panels/InspectorPanel';
import { EffectsPanel } from '../../../components/panels/EffectsPanel';
import { AudioPanel } from '../../../components/panels/AudioPanel';
import { TextPanel } from '../../../components/panels/TextPanel';
import { FaceSwapModal } from '../../../components/ai-modal/FaceSwapModal';
import { ImageToVideoModal } from '../../../components/ai-modal/ImageToVideoModal';
import { ConsistentFaceModal } from '../../../components/ai-modal/ConsistentFaceModal';
import { SmartInpaintingModal } from '../../../components/ai-modal/SmartInpaintingModal';
import { ExportModal } from '../../../components/ai-modal/ExportModal';
import { useTimelineShortcuts } from '../../../hooks/useTimelineShortcuts';
import { useEditorStore } from '../../../stores/useEditorStore';
import { 
  Sparkles, 
  Video, 
  UserCheck, 
  Eraser, 
  Download, 
  Layers, 
  Film, 
  ChevronLeft 
} from 'lucide-react';

export default function EditorPage({ params }: { params: { projectId: string } }) {
  // Activate keyboard shortcuts
  useTimelineShortcuts();

  const project = useEditorStore((s) => s.project);
  const [activePanel, setActivePanel] = useState<'media' | 'effects' | 'audio' | 'text'>('media');

  // AI Modals state
  const [isFaceSwapOpen, setIsFaceSwapOpen] = useState(false);
  const [isI2VOpen, setIsI2VOpen] = useState(false);
  const [isConsistentOpen, setIsConsistentOpen] = useState(false);
  const [isInpaintOpen, setIsInpaintOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#07080C] text-[#F3F4F6] overflow-hidden select-none">
      {/* Studio Header Bar */}
      <header className="h-11 bg-[#0C0E17] border-b border-[#1E2338] px-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1A1E30] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div className="font-bold text-xs text-white flex items-center gap-2">
            <span>{project.title}</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px]">
              {project.resolution.aspectRatio} · {project.fps}fps
            </span>
          </div>
        </div>

        {/* AI Synthesis Hub Quick Triggers */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsFaceSwapOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-[#181B2B] hover:bg-[#232840] border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Face Swap</span>
          </button>

          <button
            onClick={() => setIsI2VOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-[#181B2B] hover:bg-[#232840] border border-[#2B3048] text-neutral-300 text-xs font-semibold flex items-center gap-1.5"
          >
            <Video className="w-3.5 h-3.5 text-indigo-400" />
            <span>I2V Generator</span>
          </button>

          <button
            onClick={() => setIsConsistentOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-[#181B2B] hover:bg-[#232840] border border-[#2B3048] text-neutral-300 text-xs font-semibold flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Face Lock 95-100%</span>
          </button>

          <button
            onClick={() => setIsInpaintOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-[#181B2B] hover:bg-[#232840] border border-[#2B3048] text-neutral-300 text-xs font-semibold flex items-center gap-1.5"
          >
            <Eraser className="w-3.5 h-3.5 text-rose-400" />
            <span>SAM 2 Inpaint</span>
          </button>

          <div className="w-px h-5 bg-[#2B3048] mx-1" />

          <button
            onClick={() => setIsExportOpen(true)}
            className="px-3.5 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Video</span>
          </button>
        </div>
      </header>

      {/* Main Studio Middle Area: Left Panel + Center Viewport + Right Inspector */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side Panel Selector (Media, Effects, Audio, Text) */}
        <div className="w-12 bg-[#090B14] border-r border-[#1E2338] flex flex-col items-center py-2 gap-2 flex-shrink-0">
          <button
            onClick={() => setActivePanel('media')}
            className={`p-2 rounded-xl transition-colors ${
              activePanel === 'media' ? 'bg-amber-400 text-black' : 'text-neutral-400 hover:text-white'
            }`}
            title="Media Bin"
          >
            <Film className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActivePanel('effects')}
            className={`p-2 rounded-xl transition-colors ${
              activePanel === 'effects' ? 'bg-amber-400 text-black' : 'text-neutral-400 hover:text-white'
            }`}
            title="Effects & LUTs"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActivePanel('audio')}
            className={`p-2 rounded-xl transition-colors ${
              activePanel === 'audio' ? 'bg-amber-400 text-black' : 'text-neutral-400 hover:text-white'
            }`}
            title="Audio Mixer"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Panel Content */}
        <div className="w-72 flex-shrink-0 flex flex-col overflow-hidden">
          {activePanel === 'media' && <MediaBinPanel />}
          {activePanel === 'effects' && <EffectsPanel />}
          {activePanel === 'audio' && <AudioPanel />}
          {activePanel === 'text' && <TextPanel />}
        </div>

        {/* Center Viewport Stage */}
        <ViewportPlayer />

        {/* Right Inspector */}
        <div className="w-72 flex-shrink-0 flex flex-col overflow-hidden">
          <InspectorPanel />
        </div>
      </div>

      {/* Bottom Multi-Track Timeline */}
      <TimelineContainer />

      {/* AI Synthesis Modals */}
      <FaceSwapModal isOpen={isFaceSwapOpen} onClose={() => setIsFaceSwapOpen(false)} />
      <ImageToVideoModal isOpen={isI2VOpen} onClose={() => setIsI2VOpen(false)} />
      <ConsistentFaceModal isOpen={isConsistentOpen} onClose={() => setIsConsistentOpen(false)} />
      <SmartInpaintingModal isOpen={isInpaintOpen} onClose={() => setIsInpaintOpen(false)} />
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
}
