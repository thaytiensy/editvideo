import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

export interface RenderJobSpec {
  jobId: string;
  outputPath: string;
  resolution: { width: number; height: number };
  fps: number;
  clips: {
    filePath: string;
    start: number;
    duration: number;
    layer: number;
    opacity?: number;
    x?: number;
    y?: number;
  }[];
}

export class RenderService {
  /**
   * Generates complex multi-layer video using headless FFmpeg filter_complex.
   */
  async renderTimeline(
    spec: RenderJobSpec,
    onProgress?: (percent: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg();

      // Add inputs
      for (const clip of spec.clips) {
        command = command.input(clip.filePath);
      }

      // Build filter_complex string
      const filters: string[] = [];
      filters.push(
        `color=c=black:s=${spec.resolution.width}x${spec.resolution.height}:r=${spec.fps}:d=10[base]`
      );

      let lastStream = 'base';
      for (let i = 0; i < spec.clips.length; i++) {
        const c = spec.clips[i];
        const outStream = `v${i}`;
        // Scale and overlay
        filters.push(
          `[${i}:v]scale=${spec.resolution.width}:${spec.resolution.height}:force_original_aspect_ratio=decrease[s${i}]`,
          `[${lastStream}][s${i}]overlay=x=${c.x || 0}:y=${c.y || 0}:enable='between(t,${c.start},${c.start + c.duration})'[${outStream}]`
        );
        lastStream = outStream;
      }

      command
        .complexFilter(filters, lastStream)
        .outputOptions([
          '-c:v libx264',
          '-preset fast',
          '-crf 18',
          '-pix_fmt yuv420p',
          '-movflags +faststart'
        ])
        .output(spec.outputPath)
        .on('progress', (p) => {
          if (p.percent) {
            onProgress?.(Math.round(p.percent));
          }
        })
        .on('end', () => {
          resolve(spec.outputPath);
        })
        .on('error', (err) => {
          reject(err);
        });

      command.run();
    });
  }
}

export const renderService = new RenderService();
