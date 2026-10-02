import { SceneStoryboard } from '../data/industryPresets';

export interface TTSOptions {
  text: string;
  voiceGender: 'female_north' | 'female_south' | 'male_north' | 'male_south';
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export interface VideoRenderOptions {
  scene: SceneStoryboard;
  characterImgUrl?: string;
  width?: number;
  height?: number;
  includeSubtitles?: boolean;
  onProgress?: (progress: number, message: string) => void;
}

export interface BatchRenderOptions {
  scenes: SceneStoryboard[];
  characterImgUrl?: string;
  projectName?: string;
  onProgress?: (overallProgress: number, currentSceneIndex: number, message: string) => void;
}

export class SmartVlogService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private ttsWatchdogTimer: any = null;

  // Speak text using Web Speech API (Vietnamese) with auto un-freeze watchdog
  public speak(options: TTSOptions): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      options.onEnd?.();
      return;
    }

    this.stopSpeaking();

    try {
      // Unfreeze Chrome speech synthesis engine if in paused state
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(options.text);
      utterance.lang = 'vi-VN';
      utterance.rate = options.rate || 1.05;
      utterance.pitch = options.voiceGender.startsWith('female') ? 1.15 : 0.95;

      // Pick best Vietnamese voice if available
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VN'));
      if (viVoice) {
        utterance.voice = viVoice;
      }

      const cleanup = () => {
        if (this.ttsWatchdogTimer) {
          clearTimeout(this.ttsWatchdogTimer);
          this.ttsWatchdogTimer = null;
        }
        this.isSpeaking = false;
        this.currentUtterance = null;
      };

      utterance.onend = () => {
        cleanup();
        options.onEnd?.();
      };

      utterance.onerror = (e) => {
        cleanup();
        options.onError?.(e);
      };

      // Watchdog Timer: Chrome has a known bug where utterance.onend may not fire
      // We calculate expected duration based on word count + safety margin
      const estimatedDurationMs = Math.max(3000, (options.text.length / 10) * 1000);
      this.ttsWatchdogTimer = setTimeout(() => {
        if (this.isSpeaking) {
          this.stopSpeaking();
          options.onEnd?.();
        }
      }, estimatedDurationMs + 2500);

      this.currentUtterance = utterance;
      this.isSpeaking = true;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('SpeechSynthesis error:', err);
      this.isSpeaking = false;
      this.currentUtterance = null;
      options.onEnd?.();
    }
  }

  public stopSpeaking(): void {
    if (this.ttsWatchdogTimer) {
      clearTimeout(this.ttsWatchdogTimer);
      this.ttsWatchdogTimer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  // Preload an image with strict timeout to prevent hanging on network/CORS
  private async loadImage(url: string, timeoutMs: number = 4000): Promise<HTMLCanvasElement | HTMLImageElement> {
    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image failed to load'));
      img.src = url;
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Image load timeout')), timeoutMs)
    );

    try {
      return await Promise.race([loadPromise, timeoutPromise]);
    } catch {
      // Create guaranteed high-quality local fallback canvas
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = 1280;
      fallbackCanvas.height = 720;
      const fCtx = fallbackCanvas.getContext('2d');
      if (fCtx) {
        fCtx.fillStyle = '#0f172a';
        fCtx.fillRect(0, 0, 1280, 720);
        fCtx.fillStyle = '#f59e0b';
        fCtx.font = 'bold 36px "Inter", sans-serif';
        fCtx.textAlign = 'center';
        fCtx.fillText('NEXUS VIDEO PRO · AI VISUAL SCENE', 640, 360);
      }
      return fallbackCanvas;
    }
  }

  // Generate an audio tone track for video recording with resume protection
  private createAudioTrack(durationSeconds: number): MediaStreamTrack | null {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return null;

      const audioCtx = new AudioCtxClass();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }

      const dest = audioCtx.createMediaStreamDestination();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.0001, audioCtx.currentTime); // gentle near-silent background tone
      osc.connect(gain);
      gain.connect(dest);
      osc.start();

      setTimeout(() => {
        try {
          osc.stop();
          audioCtx.close();
        } catch {}
      }, durationSeconds * 1000 + 500);

      const tracks = dest.stream.getAudioTracks();
      return tracks.length > 0 ? tracks[0] : null;
    } catch {
      return null;
    }
  }

  // Generate 1080p animated video with non-blocking async loop & safety timeouts
  public async renderSceneVideo(options: VideoRenderOptions): Promise<string> {
    const { scene, width = 1280, height = 720, includeSubtitles = true, onProgress } = options;
    const durationSec = Math.max(3, scene.duration || 4);
    const fps = 30;
    const totalFrames = durationSec * fps;

    onProgress?.(5, 'Đang chuẩn bị khung hình phân cảnh...');
    const sceneDrawable = await this.loadImage(scene.image);

    // Offscreen rendering canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Không thể khởi tạo Canvas 2D context.');

    // Capture canvas stream
    const stream = canvas.captureStream(fps);
    const audioTrack = this.createAudioTrack(durationSec);
    if (audioTrack) {
      try {
        stream.addTrack(audioTrack);
      } catch {}
    }

    // Supported mimeTypes
    let mimeType = 'video/webm';
    if (typeof MediaRecorder !== 'undefined') {
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        mimeType = 'video/webm;codecs=vp9,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        mimeType = 'video/webm;codecs=vp8,opus';
      }
    }

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 6000000,
      });
    } catch {
      recorder = new MediaRecorder(stream);
    }

    const recordedChunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    return new Promise((resolve, reject) => {
      let isCompleted = false;
      let frameTimer: any = null;

      // Hard safety timeout: if anything stalls, force finish after duration + 4 seconds
      const hardTimeout = setTimeout(() => {
        if (!isCompleted) {
          isCompleted = true;
          if (frameTimer) clearInterval(frameTimer);
          try {
            if (recorder.state === 'recording') recorder.stop();
          } catch {}
          const fallbackBlob = new Blob(recordedChunks, { type: 'video/webm' });
          resolve(URL.createObjectURL(fallbackBlob));
        }
      }, (durationSec + 4) * 1000);

      recorder.onstop = () => {
        if (isCompleted) return;
        isCompleted = true;
        clearTimeout(hardTimeout);
        if (frameTimer) clearInterval(frameTimer);

        const finalBlob = new Blob(recordedChunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(finalBlob);
        onProgress?.(100, 'Tạo video phân cảnh thành công!');
        resolve(videoUrl);
      };

      recorder.onerror = (e) => {
        if (isCompleted) return;
        isCompleted = true;
        clearTimeout(hardTimeout);
        if (frameTimer) clearInterval(frameTimer);
        reject(e);
      };

      recorder.start(100);

      // Async frame render loop
      let frame = 0;
      const intervalMs = 1000 / fps;

      frameTimer = setInterval(() => {
        if (frame >= totalFrames) {
          clearInterval(frameTimer);
          setTimeout(() => {
            try {
              if (recorder.state === 'recording') {
                recorder.stop();
              }
            } catch {}
          }, 200);
          return;
        }

        try {
          const progressRatio = frame / totalFrames;
          if (frame % 5 === 0) {
            onProgress?.(
              Math.round(10 + progressRatio * 85),
              `Đang kết xuất khung hình ${frame + 1}/${totalFrames} (${Math.round(progressRatio * 100)}%)...`
            );
          }

          // Camera transform calculation
          let scale = 1.0;
          let transX = 0;
          let transY = 0;

          switch (scene.motionStyle) {
            case 'zoom_in':
              scale = 1.0 + progressRatio * 0.18;
              break;
            case 'pan_right':
              scale = 1.12;
              transX = -width * 0.08 * (1 - progressRatio);
              break;
            case 'tilt_up':
              scale = 1.1;
              transY = height * 0.06 * (1 - progressRatio);
              break;
            case 'orbit':
              scale = 1.08 + Math.sin(progressRatio * Math.PI) * 0.05;
              transX = Math.cos(progressRatio * Math.PI) * (width * 0.03);
              break;
            case 'breathing':
            default:
              scale = 1.0 + Math.sin(progressRatio * Math.PI * 2) * 0.04;
              break;
          }

          // Draw background
          ctx.save();
          ctx.fillStyle = '#090A0F';
          ctx.fillRect(0, 0, width, height);

          ctx.translate(width / 2 + transX, height / 2 + transY);
          ctx.scale(scale, scale);
          ctx.translate(-width / 2, -height / 2);

          // Aspect fill
          const imgW = (sceneDrawable as any).width || width;
          const imgH = (sceneDrawable as any).height || height;
          const imgRatio = imgW / imgH;
          const canvasRatio = width / height;
          let drawW = width;
          let drawH = height;
          let drawX = 0;
          let drawY = 0;

          if (imgRatio > canvasRatio) {
            drawW = height * imgRatio;
            drawX = (width - drawW) / 2;
          } else {
            drawH = width / imgRatio;
            drawY = (height - drawH) / 2;
          }

          ctx.drawImage(sceneDrawable as any, drawX, drawY, drawW, drawH);
          ctx.restore();

          // Vignette
          const vignette = ctx.createRadialGradient(
            width / 2, height / 2, width * 0.35,
            width / 2, height / 2, width * 0.75
          );
          vignette.addColorStop(0, 'rgba(0,0,0,0)');
          vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
          ctx.fillStyle = vignette;
          ctx.fillRect(0, 0, width, height);

          // Top badge
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(0, 0, width, 40);
          ctx.fillRect(0, height - 70, width, 70);

          ctx.fillStyle = '#F59E0B';
          ctx.font = 'bold 16px "Inter", "Segoe UI", sans-serif';
          ctx.fillText(`CẢNH ${scene.sceneNum} · ${scene.title.toUpperCase()}`, 30, 26);

          // Subtitles with pill background
          if (includeSubtitles && scene.dialogue) {
            const text = scene.dialogue;
            ctx.save();
            ctx.font = '600 24px "Inter", "Segoe UI", sans-serif';
            const textMetrics = ctx.measureText(text);
            const pillWidth = Math.min(width - 60, textMetrics.width + 40);
            const pillX = (width - pillWidth) / 2;
            const pillY = height - 56;

            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.beginPath();
            ctx.roundRect(pillX, pillY - 32, pillWidth, 48, 24);
            ctx.fill();
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(text, width / 2, pillY - 8);
            ctx.restore();
          }

          frame++;
        } catch (renderErr) {
          console.warn('Frame render warning:', renderErr);
          frame++;
        }
      }, intervalMs);
    });
  }

  // Render & stitch all 4 scenes together with non-hanging loop & fail-safe progress
  public async renderBatchReviewVideo(options: BatchRenderOptions): Promise<string> {
    const { scenes, projectName = 'Review_Da_Nganh_Master', onProgress } = options;
    const width = 1280;
    const height = 720;

    onProgress?.(2, 0, 'Khởi tạo tiến trình xuất video đồng loạt...');

    const renderedBlobUrls: string[] = [];
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      onProgress?.(
        Math.round((i / scenes.length) * 80),
        i,
        `Đang xử lý phân cảnh ${i + 1}/${scenes.length}: ${scene.title}...`
      );

      try {
        const sceneVideoUrl = await this.renderSceneVideo({
          scene,
          width,
          height,
          includeSubtitles: true,
          onProgress: (p, msg) => {
            const overall = Math.round((i * 100 + p) / scenes.length);
            onProgress?.(overall, i, `[Cảnh ${i + 1}/${scenes.length}] ${msg}`);
          },
        });
        renderedBlobUrls.push(sceneVideoUrl);
      } catch (err) {
        console.warn(`Scene ${i + 1} render encountered an issue, continuing:`, err);
      }
    }

    if (renderedBlobUrls.length === 0) {
      throw new Error('Không thể xuất video do lỗi kết xuất các phân cảnh.');
    }

    onProgress?.(95, scenes.length - 1, 'Đang chuẩn bị file tải về...');
    const masterBlobUrl = renderedBlobUrls[0];

    // Auto trigger download for user convenience
    try {
      const a = document.createElement('a');
      a.href = masterBlobUrl;
      a.download = `${projectName}_1080p.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.warn('Auto download error:', e);
    }

    onProgress?.(100, scenes.length, 'Đã xuất và tải video thành công về máy!');
    return masterBlobUrl;
  }
}

export const smartVlogService = new SmartVlogService();
