/**
 * Formats seconds into SMPTE timecode string: HH:MM:SS:FF
 */
export function formatSMPTETimecode(seconds: number, fps: number = 30): string {
  const totalFrames = Math.floor(seconds * fps);
  const ff = totalFrames % fps;
  const totalSeconds = Math.floor(seconds);
  const ss = totalSeconds % 60;
  const mm = Math.floor(totalSeconds / 60) % 60;
  const hh = Math.floor(totalSeconds / 3600);

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}

/**
 * Parses SMPTE timecode HH:MM:SS:FF back to seconds
 */
export function parseSMPTETimecode(timecode: string, fps: number = 30): number {
  const parts = timecode.split(':').map((p) => parseInt(p, 10));
  if (parts.length !== 4) return 0;
  const [hh, mm, ss, ff] = parts;
  return hh * 3600 + mm * 60 + ss + ff / fps;
}

/**
 * Keyframe interpolation with easing
 */
export function interpolateKeyframe(
  t: number,
  t0: number,
  v0: number,
  t1: number,
  v1: number,
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' = 'linear'
): number {
  if (t <= t0) return v0;
  if (t >= t1) return v1;

  let progress = (t - t0) / (t1 - t0);

  switch (easing) {
    case 'easeIn':
      progress = progress * progress;
      break;
    case 'easeOut':
      progress = progress * (2 - progress);
      break;
    case 'easeInOut':
      progress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      break;
    case 'linear':
    default:
      break;
  }

  return v0 + (v1 - v0) * progress;
}
