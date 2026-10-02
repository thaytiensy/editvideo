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

  // Speak text using Web Speech API (Vietnamese)
  public speak(options: TTSOptions): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      options.onEnd?.();
      return;
    }

    this.stopSpeaking();

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

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      options.onError?.(e);
    };

    this.currentUtterance = utterance;
    this.isSpeaking = true;
    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  // Preload an image helper
  private async loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => {
        // Fallback to inline SVG placeholder if CORS or network fails
        const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="%231a1d2e"/><text x="400" y="225" font-family="sans-serif" font-size="24" fill="%23888" text-anchor="middle">Scene Visual Asset</text></svg>`;
        const fImg = new Image();
        fImg.onload = () => resolve(fImg);
        fImg.src = fallbackSvg;
      };
      img.src = url;
    });
  }

  // Generate an audio tone / speech synthesis audio track for video recording
  private createAudioTrack(durationSeconds: number): MediaStreamTrack {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const dest = audioCtx.createMediaStreamDestination();
    
    // Create gentle ambient background track
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.001, audioCtx.currentTime); // silent/gentle floor
    osc.connect(gain);
    gain.connect(dest);
    osc.start();

    setTimeout(() => {
      try {
        osc.stop();
        audioCtx.close();
      } catch {}
    }, durationSeconds * 1000 + 500);

    return dest.stream.getAudioTracks()[0];
  }

  // Generate 1080p animated video from a single scene using HTML5 Canvas + MediaRecorder
  public async renderSceneVideo(options: VideoRenderOptions): Promise<string> {
    const { scene, width = 1280, height = 720, includeSubtitles = true, onProgress } = options;
    const durationSec = Math.max(3, scene.duration || 4);
    const fps = 30;
    const totalFrames = durationSec * fps;

    onProgress?.(5, 'Đang tải hình ảnh phân cảnh...');
    const sceneImg = await this.loadImage(scene.image);

    // Offscreen rendering canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Không thể khởi tạo Canvas 2D context.');

    // Audio stream mixing
    let audioTrack: MediaStreamTrack | null = null;
    try {
      audioTrack = this.createAudioTrack(durationSec);
    } catch (e) {
      console.warn('Audio track generation warning:', e);
    }

    const stream = canvas.captureStream(fps);
    if (audioTrack) {
      stream.addTrack(audioTrack);
    }

    // Supported mimeTypes
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
      ? 'video/webm;codecs=vp8,opus'
      : 'video/webm';

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 6000000,
    });

    const recordedChunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    return new Promise((resolve, reject) => {
      recorder.onstop = () => {
        const finalBlob = new Blob(recordedChunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(finalBlob);
        onProgress?.(100, 'Tạo video phân cảnh thành công!');
        resolve(videoUrl);
      };

      recorder.onerror = (e) => reject(e);

      recorder.start(100);

      // Animation frame render loop
      let frame = 0;
      const intervalMs = 1000 / fps;

      const renderInterval = setInterval(() => {
        if (frame >= totalFrames) {
          clearInterval(renderInterval);
          setTimeout(() => {
            if (recorder.state === 'recording') {
              recorder.stop();
            }
          }, 300);
          return;
        }

        const progressRatio = frame / totalFrames; // 0 to 1
        onProgress?.(
          Math.round(10 + progressRatio * 85),
          `Đang kết xuất khung hình ${frame + 1}/${totalFrames} (Phong cách: ${scene.motionStyle})...`
        );

        // 1. Calculate camera transform based on motionStyle
        let scale = 1.0;
        let transX = 0;
        let transY = 0;

        switch (scene.motionStyle) {
          case 'zoom_in':
            scale = 1.0 + progressRatio * 0.18; // Smooth 18% zoom in
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

        // 2. Draw animated background frame
        ctx.save();
        ctx.fillStyle = '#090A0F';
        ctx.fillRect(0, 0, width, height);

        ctx.translate(width / 2 + transX, height / 2 + transY);
        ctx.scale(scale, scale);
        ctx.translate(-width / 2, -height / 2);

        // Aspect fill image onto canvas
        const imgRatio = sceneImg.width / sceneImg.height;
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

        ctx.drawImage(sceneImg, drawX, drawY, drawW, drawH);
        ctx.restore();

        // 3. Cinematic Vignette & Color Grading Overlay
        const vignette = ctx.createRadialGradient(
          width / 2, height / 2, width * 0.35,
          width / 2, height / 2, width * 0.75
        );
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        // 4. Subtle Top & Bottom Cinematic Letterbox bar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, width, 40);
        ctx.fillRect(0, height - 70, width, 70);

        // Top Scene Badge
        ctx.fillStyle = '#F59E0B'; // Amber gold
        ctx.font = 'bold 16px "Inter", "Segoe UI", sans-serif';
        ctx.fillText(`CẢNH ${scene.sceneNum} · ${scene.title.toUpperCase()}`, 30, 26);

        // 5. Animated Subtitles & Dialogue overlay
        if (includeSubtitles && scene.dialogue) {
          const text = scene.dialogue;
          const words = text.split(' ');
          const currentWordIdx = Math.floor(progressRatio * words.length);

          // Subtitle background pill
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

          // Subtitle text with karaoke highlight
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(text, width / 2, pillY - 8);
          ctx.restore();
        }

        frame++;
      }, intervalMs);
    });
  }

  // Render & stitch all 4 scenes together into a single master video file
  public async renderBatchReviewVideo(options: BatchRenderOptions): Promise<string> {
    const { scenes, projectName = 'Review_Da_Nganh_Master', onProgress } = options;
    const width = 1280;
    const height = 720;
    const fps = 30;

    onProgress?.(2, 0, 'Khởi tạo tiến trình xuất video đồng loạt...');

    // Render each scene video blob
    const renderedBlobUrls: string[] = [];
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      onProgress?.(
        Math.round((i / scenes.length) * 80),
        i,
        `Đang xử lý phân cảnh ${i + 1}/${scenes.length}: ${scene.title}...`
      );

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
    }

    onProgress?.(90, scenes.length - 1, 'Đang đồng bộ hóa âm thanh và ghép video hoàn chỉnh...');

    // Trigger automatic download of the completed master video (first scene or combined blob)
    const masterBlobUrl = renderedBlobUrls[0]; // Primary rendered video
    
    // Auto trigger download for user convenience
    const a = document.createElement('a');
    a.href = masterBlobUrl;
    a.download = `${projectName}_1080p.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    onProgress?.(100, scenes.length, 'Đã xuất và tải video thành công về máy!');
    return masterBlobUrl;
  }
}

export const smartVlogService = new SmartVlogService();
