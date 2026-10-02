export type TrackType = 'video' | 'audio' | 'image' | 'text' | 'adjustment';

export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten';

export interface Keyframe<T = number> {
  id: string;
  time: number; // in seconds
  value: T;
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

export interface TransformProperties {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number; // in degrees
}

export interface FilterProperties {
  brightness: number; // 0 - 200%
  contrast: number; // 0 - 200%
  saturation: number; // 0 - 200%
  blur: number; // in px
  hueRotate: number; // in degrees
  lutUrl?: string; // 3D LUT .CUBE
}

export interface Transition {
  type: 'cross_dissolve' | 'glitch' | 'whip_pan' | 'flash' | 'none';
  duration: number; // in seconds
}

export interface Clip {
  id: string;
  trackId: string;
  name: string;
  sourceUrl: string;
  type: 'video' | 'audio' | 'image' | 'text';
  start: number; // timeline start time in seconds
  duration: number; // duration on timeline in seconds
  inPoint: number; // media source in-point in seconds
  outPoint: number; // media source out-point in seconds
  speed: number; // 0.1x to 10.0x
  volume: number; // 0 to 1.0
  muted: boolean;
  opacity: number; // 0 to 1.0
  blendMode: BlendMode;
  transform: TransformProperties;
  filters: FilterProperties;
  transitionIn?: Transition;
  transitionOut?: Transition;
  keyframes: {
    x?: Keyframe<number>[];
    y?: Keyframe<number>[];
    scale?: Keyframe<number>[];
    opacity?: Keyframe<number>[];
    rotation?: Keyframe<number>[];
  };
  textProperties?: {
    content: string;
    fontSize: number;
    fontFamily: string;
    color: string;
    backgroundColor?: string;
  };
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  height: number;
  muted: boolean;
  solo: boolean;
  locked: boolean;
  visible: boolean;
  volume: number;
  clips: Clip[];
}

export interface TimelineProject {
  id: string;
  title: string;
  fps: number; // 24, 30, 60
  duration: number; // in seconds
  resolution: {
    width: number;
    height: number;
    aspectRatio: '16:9' | '9:16' | '1:1' | '21:9';
  };
  tracks: Track[];
}
