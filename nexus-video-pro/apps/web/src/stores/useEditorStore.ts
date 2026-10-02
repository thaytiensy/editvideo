import { create } from 'zustand';
import { produce } from 'immer';
import { TimelineProject, Track, Clip, TrackType } from '../types/timeline';

export type ToolMode = 'select' | 'razor' | 'slip' | 'ripple';

interface EditorState {
  project: TimelineProject;
  currentTime: number;
  isPlaying: boolean;
  activeTool: ToolMode;
  selectedClipId: string | null;
  selectedTrackId: string | null;
  snappingEnabled: boolean;
  zoomLevel: number; // pixels per second
  inPoint: number | null;
  outPoint: number | null;

  // History stack for Undo / Redo
  history: TimelineProject[];
  historyIndex: number;

  // Actions
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setActiveTool: (tool: ToolMode) => void;
  setSelectedClipId: (clipId: string | null) => void;
  setSnappingEnabled: (enabled: boolean) => void;
  setZoomLevel: (zoom: number) => void;
  setInPoint: (time: number | null) => void;
  setOutPoint: (time: number | null) => void;

  // Track & Clip Operations
  addTrack: (type: TrackType, name: string) => void;
  removeTrack: (trackId: string) => void;
  addClip: (trackId: string, clip: Clip) => void;
  splitClip: (clipId: string, splitTime: number) => void;
  deleteClip: (clipId: string) => void;
  rippleDeleteClip: (clipId: string) => void;
  moveClip: (clipId: string, targetTrackId: string, newStart: number) => void;
  updateClipProperties: (clipId: string, partial: Partial<Clip>) => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

const DEFAULT_PROJECT: TimelineProject = {
  id: 'nexus-proj-01',
  title: 'Nexus Cinematic Edit 01',
  fps: 30,
  duration: 60,
  resolution: {
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
  },
  tracks: [
    {
      id: 'track-v1',
      name: 'Video 1',
      type: 'video',
      height: 64,
      muted: false,
      solo: false,
      locked: false,
      visible: true,
      volume: 1.0,
      clips: [
        {
          id: 'clip-v1-sample',
          trackId: 'track-v1',
          name: 'Runway Fashion 4K',
          sourceUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          type: 'video',
          start: 0,
          duration: 8,
          inPoint: 0,
          outPoint: 8,
          speed: 1.0,
          volume: 1.0,
          muted: false,
          opacity: 1.0,
          blendMode: 'normal',
          transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
          filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, hueRotate: 0 },
          keyframes: {},
        }
      ],
    },
    {
      id: 'track-a1',
      name: 'Audio 1 (Voiceover)',
      type: 'audio',
      height: 56,
      muted: false,
      solo: false,
      locked: false,
      visible: true,
      volume: 1.0,
      clips: [],
    },
    {
      id: 'track-t1',
      name: 'Subtitles & VFX',
      type: 'text',
      height: 48,
      muted: false,
      solo: false,
      locked: false,
      visible: true,
      volume: 1.0,
      clips: [],
    },
  ],
};

export const useEditorStore = create<EditorState>((set: any, get: any) => ({
  project: DEFAULT_PROJECT,
  currentTime: 0,
  isPlaying: false,
  activeTool: 'select',
  selectedClipId: 'clip-v1-sample',
  selectedTrackId: 'track-v1',
  snappingEnabled: true,
  zoomLevel: 40,
  inPoint: null,
  outPoint: null,
  history: [DEFAULT_PROJECT],
  historyIndex: 0,

  setCurrentTime: (time: number) => set({ currentTime: Math.max(0, time) }),
  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
  setActiveTool: (tool: ToolMode) => set({ activeTool: tool }),
  setSelectedClipId: (clipId: string | null) => set({ selectedClipId: clipId }),
  setSnappingEnabled: (enabled: boolean) => set({ snappingEnabled: enabled }),
  setZoomLevel: (zoom: number) => set({ zoomLevel: Math.max(10, Math.min(200, zoom)) }),
  setInPoint: (time: number | null) => set({ inPoint: time }),
  setOutPoint: (time: number | null) => set({ outPoint: time }),

  pushHistory: () => {
    const { project, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(project)));
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      set({
        historyIndex: historyIndex - 1,
        project: JSON.parse(JSON.stringify(history[historyIndex - 1])),
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({
        historyIndex: historyIndex + 1,
        project: JSON.parse(JSON.stringify(history[historyIndex + 1])),
      });
    }
  },

  addTrack: (type: TrackType, name: string) => {
    get().pushHistory();
    set(
      produce((state: EditorState) => {
        state.project.tracks.push({
          id: `track-${Date.now()}`,
          name,
          type,
          height: type === 'video' ? 64 : 48,
          muted: false,
          solo: false,
          locked: false,
          visible: true,
          volume: 1.0,
          clips: [],
        });
      })
    );
  },

  removeTrack: (trackId: string) => {
    get().pushHistory();
    set(
      produce((state: EditorState) => {
        state.project.tracks = state.project.tracks.filter((t) => t.id !== trackId);
      })
    );
  },

  addClip: (trackId: string, clip: Clip) => {
    get().pushHistory();
    set(
      produce((state: EditorState) => {
        const track = state.project.tracks.find((t) => t.id === trackId);
        if (track) {
          track.clips.push(clip);
        }
      })
    );
  },

  splitClip: (clipId: string, splitTime: number) => {
    get().pushHistory();
    set(
      produce((state: EditorState) => {
        for (const track of state.project.tracks) {
          const clipIdx = track.clips.findIndex((c) => c.id === clipId);
          if (clipIdx !== -1) {
            const original = track.clips[clipIdx];
            if (splitTime > original.start && splitTime < original.start + original.duration) {
              const firstPartDuration = splitTime - original.start;
              const secondPartDuration = original.duration - firstPartDuration;

              // Clip 1 (Left part)
              original.duration = firstPartDuration;
              original.outPoint = original.inPoint + firstPartDuration * original.speed;

              // Clip 2 (Right part)
              const secondClip: Clip = {
                ...JSON.parse(JSON.stringify(original)),
                id: `clip-${Date.now()}`,
                start: splitTime,
                duration: secondPartDuration,
                inPoint: original.outPoint,
                outPoint: original.outPoint + secondPartDuration * original.speed,
              };

              track.clips.splice(clipIdx + 1, 0, secondClip);
            }
            break;
          }
        }
      })
    );
  },

  deleteClip: (clipId: string) => {
    get().pushHistory();
    set(
      produce((state: EditorState) => {
        for (const track of state.project.tracks) {
          track.clips = track.clips.filter((c) => c.id !== clipId);
        }
        if (state.selectedClipId === clipId) {
          state.selectedClipId = null;
        }
      })
    );
  },

  rippleDeleteClip: (clipId: string) => {
    get().pushHistory();
    set(
      produce((state: EditorState) => {
        for (const track of state.project.tracks) {
          const clipIdx = track.clips.findIndex((c) => c.id === clipId);
          if (clipIdx !== -1) {
            const clip = track.clips[clipIdx];
            const gap = clip.duration;
            track.clips.splice(clipIdx, 1);
            // Ripple subsequent clips to the left
            for (let i = clipIdx; i < track.clips.length; i++) {
              track.clips[i].start -= gap;
            }
            break;
          }
        }
      })
    );
  },

  moveClip: (clipId: string, targetTrackId: string, newStart: number) => {
    set(
      produce((state: EditorState) => {
        let foundClip: Clip | null = null;
        // Remove from old track
        for (const track of state.project.tracks) {
          const idx = track.clips.findIndex((c) => c.id === clipId);
          if (idx !== -1) {
            foundClip = track.clips.splice(idx, 1)[0];
            break;
          }
        }
        // Insert into new track
        if (foundClip) {
          const targetTrack = state.project.tracks.find((t) => t.id === targetTrackId);
          if (targetTrack) {
            foundClip.trackId = targetTrackId;
            foundClip.start = Math.max(0, newStart);
            targetTrack.clips.push(foundClip);
          }
        }
      })
    );
  },

  updateClipProperties: (clipId: string, partial: Partial<Clip>) => {
    set(
      produce((state: EditorState) => {
        for (const track of state.project.tracks) {
          const clip = track.clips.find((c) => c.id === clipId);
          if (clip) {
            Object.assign(clip, partial);
            break;
          }
        }
      })
    );
  },
}));
