import { useEffect } from 'react';
import { useEditorStore } from '../stores/useEditorStore';

export function useTimelineShortcuts() {
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const setIsPlaying = useEditorStore((s) => s.setIsPlaying);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const selectedClipId = useEditorStore((s) => s.selectedClipId);
  const currentTime = useEditorStore((s) => s.currentTime);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const splitClip = useEditorStore((s) => s.splitClip);
  const deleteClip = useEditorStore((s) => s.deleteClip);
  const rippleDeleteClip = useEditorStore((s) => s.rippleDeleteClip);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const setInPoint = useEditorStore((s) => s.setInPoint);
  const setOutPoint = useEditorStore((s) => s.setOutPoint);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      // Space: Play / Pause
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
        return;
      }

      // V: Selection Tool
      if (e.key === 'v' || e.key === 'V') {
        setActiveTool('select');
        return;
      }

      // C: Razor / Cut Tool
      if (e.key === 'c' || e.key === 'C') {
        setActiveTool('razor');
        if (selectedClipId) {
          splitClip(selectedClipId, currentTime);
        }
        return;
      }

      // Delete / Backspace: Delete or Ripple Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedClipId) {
          e.preventDefault();
          if (e.shiftKey) {
            rippleDeleteClip(selectedClipId);
          } else {
            deleteClip(selectedClipId);
          }
        }
        return;
      }

      // I / O: In / Out points
      if (e.key === 'i' || e.key === 'I') {
        setInPoint(currentTime);
        return;
      }
      if (e.key === 'o' || e.key === 'O') {
        setOutPoint(currentTime);
        return;
      }

      // J / K / L Shuttle Controls
      if (e.key === 'j' || e.key === 'J') {
        setCurrentTime(Math.max(0, currentTime - 1.0));
        return;
      }
      if (e.key === 'k' || e.key === 'K') {
        setIsPlaying(false);
        return;
      }
      if (e.key === 'l' || e.key === 'L') {
        setCurrentTime(currentTime + 1.0);
        return;
      }

      // Cmd/Ctrl + Z: Undo / Redo
      if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPlaying,
    selectedClipId,
    currentTime,
    setIsPlaying,
    setActiveTool,
    splitClip,
    deleteClip,
    rippleDeleteClip,
    undo,
    redo,
    setInPoint,
    setOutPoint,
    setCurrentTime,
  ]);
}
