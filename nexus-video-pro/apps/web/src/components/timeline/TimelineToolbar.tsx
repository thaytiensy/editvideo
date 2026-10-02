import React from 'react';
import { useEditorStore } from '../../stores/useEditorStore';
import { 
  MousePointer, 
  Scissors, 
  MoveHorizontal, 
  Magnet, 
  ZoomIn, 
  ZoomOut, 
  Undo2, 
  Redo2, 
  Trash2 
} from 'lucide-react';

export const TimelineToolbar: React.FC = () => {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const snappingEnabled = useEditorStore((s) => s.snappingEnabled);
  const setSnappingEnabled = useEditorStore((s) => s.setSnappingEnabled);
  const zoomLevel = useEditorStore((s) => s.zoomLevel);
  const setZoomLevel = useEditorStore((s) => s.setZoomLevel);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const splitClip = useEditorStore((s) => s.splitClip);
  const deleteClip = useEditorStore((s) => s.deleteClip);
  const currentTime = useEditorStore((s) => s.currentTime);

  return (
    <div className="h-10 bg-[#11131F] border-b border-[#202538] px-3 flex items-center justify-between text-xs select-none">
      {/* Tools */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setActiveTool('select')}
          className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${
            activeTool === 'select' ? 'bg-amber-400 text-black font-bold' : 'text-neutral-400 hover:text-white'
          }`}
          title="Selection Tool (V)"
        >
          <MousePointer className="w-4 h-4" />
          <span className="hidden sm:inline">V</span>
        </button>

        <button
          onClick={() => {
            setActiveTool('razor');
            if (selectedClipId) splitClip(selectedClipId, currentTime);
          }}
          className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${
            activeTool === 'razor' ? 'bg-amber-400 text-black font-bold' : 'text-neutral-400 hover:text-white'
          }`}
          title="Razor / Cut (C)"
        >
          <Scissors className="w-4 h-4" />
          <span className="hidden sm:inline">C</span>
        </button>

        <div className="w-px h-5 bg-[#2A3047] mx-1" />

        <button
          onClick={() => setSnappingEnabled(!snappingEnabled)}
          className={`p-1.5 rounded-lg transition-colors ${
            snappingEnabled ? 'text-amber-400 bg-amber-400/10' : 'text-neutral-500'
          }`}
          title="Magnetic Snapping (S)"
        >
          <Magnet className="w-4 h-4" />
        </button>

        {selectedClipId && (
          <button
            onClick={() => deleteClip(selectedClipId)}
            className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
            title="Delete Selected Clip"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Undo / Redo & Zoom */}
      <div className="flex items-center gap-2">
        <button onClick={undo} className="p-1.5 rounded-lg text-neutral-400 hover:text-white" title="Undo (Ctrl+Z)">
          <Undo2 className="w-4 h-4" />
        </button>
        <button onClick={redo} className="p-1.5 rounded-lg text-neutral-400 hover:text-white" title="Redo (Ctrl+Shift+Z)">
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-[#2A3047] mx-1" />

        <button onClick={() => setZoomLevel(zoomLevel - 10)} className="p-1 text-neutral-400 hover:text-white">
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-[10px] text-neutral-400 font-mono w-10 text-center">{zoomLevel}px/s</span>
        <button onClick={() => setZoomLevel(zoomLevel + 10)} className="p-1 text-neutral-400 hover:text-white">
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
