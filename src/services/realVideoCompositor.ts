import { FaceItem, FaceSwapConfig, ImageToVideoMotion } from '../types';

export interface RenderProgressCallback {
  (progress: number, stageMessage: string, currentTime: number, duration: number): void;
}

export interface CompositorOptions {
  videoSource: string | File;
  faces: FaceItem[];
  watermarkText?: string;
  maxDuration?: number; // optional trim duration in seconds
  autoTrack?: boolean; // automatic face tracking mode
  onProgress?: RenderProgressCallback;
}

export interface ImageToVideoOptions {
  sourceImage: string | File;
  faces: FaceItem[];
  motionStyle: ImageToVideoMotion;
  duration?: number; // seconds (default 10)
  aspectRatio?: '9:16' | '16:9' | '1:1';
  watermarkText?: string;
  onProgress?: RenderProgressCallback;
}

export interface RenderResult {
  outputBlobUrl: string;
  outputBlob: Blob;
  duration: number;
  width: number;
  height: number;
}

export interface DetectedFaceBox {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  scale: number; // scale factor
}

export class RealVideoCompositor {
  private nativeFaceDetector: any = null;

  // Smoothing tracker state for seamless tracking across frames
  private lastTracked: DetectedFaceBox = { x: 50, y: 32, scale: 1.0 };

  constructor() {
    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      try {
        this.nativeFaceDetector = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 3 });
      } catch {
        this.nativeFaceDetector = null;
      }
    }
  }

  // Preload an image from URL or File into an HTMLImageElement
  public async loadImage(source: string | File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(new Error('Không thể tải ảnh: ' + e));

      if (typeof source === 'string') {
        img.src = source;
      } else {
        img.src = URL.createObjectURL(source);
      }
    });
  }

  // Auto Face Detection & Tracker
  // Detects face bounding box using native Shape Detection API or intelligent Skin/Luminance Centroid
  public async detectFaceInFrame(
    source: HTMLVideoElement | HTMLCanvasElement,
    width: number,
    height: number
  ): Promise<DetectedFaceBox> {
    // 1. Try Native FaceDetector if supported by Chromium browser
    if (this.nativeFaceDetector) {
      try {
        const detected = await this.nativeFaceDetector.detect(source);
        if (detected && detected.length > 0) {
          const box = detected[0].boundingBox;
          const targetX = ((box.x + box.width / 2) / width) * 100;
          const targetY = ((box.y + box.height / 2) / height) * 100;
          const targetScale = (box.height / (height * 0.28));

          // Smooth EMA filter
          this.lastTracked.x = this.lastTracked.x * 0.8 + targetX * 0.2;
          this.lastTracked.y = this.lastTracked.y * 0.8 + targetY * 0.2;
          this.lastTracked.scale = this.lastTracked.scale * 0.85 + Math.max(0.6, Math.min(2.0, targetScale)) * 0.15;

          return { ...this.lastTracked };
        }
      } catch {
        // Fallback below
      }
    }

    // 2. Intelligent Computer-Vision Centroid Detector on Upper Body Region (top 65%)
    // Creates a lightweight downscaled 64x64 analysis canvas
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 64;
    sampleCanvas.height = 64;
    const sCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });

    if (sCtx) {
      // Draw top 65% of the frame
      sCtx.drawImage(source, 0, 0, width, height * 0.65, 0, 0, 64, 64);
      const imgData = sCtx.getImageData(0, 0, 64, 64).data;

      let sumX = 0;
      let sumY = 0;
      let count = 0;

      for (let y = 4; y < 60; y++) {
        for (let x = 4; x < 60; x++) {
          const i = (y * 64 + x) * 4;
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];

          // Human skin-tone & face luminance heuristics
          const isSkin =
            r > 80 && g > 35 && b > 20 &&
            r > g && r > b &&
            Math.abs(r - g) > 12 &&
            r - Math.min(g, b) > 15;

          if (isSkin) {
            sumX += x;
            sumY += y;
            count++;
          }
        }
      }

      if (count > 25) {
        const detectedX = (sumX / count / 64) * 100;
        const detectedY = ((sumY / count / 64) * 65); // Scale back to full height percentage
        const spreadFactor = Math.sqrt(count) / 18;
        const detectedScale = Math.max(0.7, Math.min(1.8, spreadFactor));

        // Smooth transition
        this.lastTracked.x = this.lastTracked.x * 0.85 + detectedX * 0.15;
        this.lastTracked.y = this.lastTracked.y * 0.85 + detectedY * 0.15;
        this.lastTracked.scale = this.lastTracked.scale * 0.9 + detectedScale * 0.1;

        return { ...this.lastTracked };
      }
    }

    // Default golden ratio portrait location if no strong face features detected
    return { ...this.lastTracked };
  }

  // Draw smooth feathered elliptical face onto target canvas
  public drawFeatheredFace(
    ctx: CanvasRenderingContext2D,
    faceImg: HTMLImageElement,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    feather: number = 22,
    opacity: number = 1.0,
    rotation: number = 0
  ) {
    ctx.save();
    ctx.globalAlpha = Math.max(0.1, Math.min(1.0, opacity));

    ctx.translate(centerX, centerY);
    if (rotation) {
      ctx.rotate((rotation * Math.PI) / 180);
    }

    const rx = width / 2;
    const ry = height / 2;

    const offscreen = document.createElement('canvas');
    offscreen.width = Math.ceil(width);
    offscreen.height = Math.ceil(height);
    const offCtx = offscreen.getContext('2d');

    if (offCtx) {
      offCtx.drawImage(faceImg, 0, 0, offscreen.width, offscreen.height);

      offCtx.globalCompositeOperation = 'destination-in';
      const grad = offCtx.createRadialGradient(
        rx, ry, Math.max(0, Math.min(rx, ry) - feather),
        rx, ry, Math.max(rx, ry)
      );
      grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.9)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      offCtx.fillStyle = grad;
      offCtx.beginPath();
      offCtx.ellipse(rx, ry, rx, ry, 0, 0, Math.PI * 2);
      offCtx.fill();

      ctx.drawImage(offscreen, -rx, -ry);
    } else {
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(faceImg, -rx, -ry, width, height);
    }

    ctx.restore();
  }

  // Draw Watermark Badge
  public drawWatermark(
    ctx: CanvasRenderingContext2D,
    text: string,
    canvasWidth: number,
    canvasHeight: number
  ) {
    if (!text) return;

    ctx.save();
    const fontSize = Math.max(12, Math.round(canvasWidth * 0.022));
    ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", sans-serif`;

    const textMetrics = ctx.measureText(text);
    const paddingX = fontSize * 0.8;
    const paddingY = fontSize * 0.5;
    const boxWidth = textMetrics.width + paddingX * 2;
    const boxHeight = fontSize + paddingY * 2;

    const x = canvasWidth - boxWidth - fontSize;
    const y = fontSize * 1.5;

    ctx.fillStyle = 'rgba(9, 10, 15, 0.75)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.roundRect(x, y, boxWidth, boxHeight, fontSize * 0.6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + paddingX, y + boxHeight / 2);

    ctx.restore();
  }

  // Preview Frame Compositor with optional Auto-Tracking
  public async renderPreviewFrame(
    canvas: HTMLCanvasElement,
    video: HTMLVideoElement,
    faceImages: Map<string, HTMLImageElement>,
    faces: FaceItem[],
    watermarkText: string,
    autoTrack: boolean = false
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx || !video.videoWidth || !video.videoHeight) return;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // 1. Draw raw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 2. Compute face coordinates (Auto-Track or Manual sliders)
    let autoBox: DetectedFaceBox | null = null;
    if (autoTrack) {
      autoBox = await this.detectFaceInFrame(video, canvas.width, canvas.height);
    }

    // 3. Draw each face
    for (let i = 0; i < faces.length; i++) {
      const face = faces[i];
      const img = faceImages.get(face.id) || faceImages.get(face.imageUrl);
      if (!img) continue;

      const cfg: FaceSwapConfig = face.swapConfig || {
        x: 50,
        y: 35,
        scale: 1.0,
        feather: 22,
        opacity: 0.98,
        rotation: 0,
      };

      // Use autoTrack coordinates for primary face if autoTrack is enabled
      const finalX = (autoTrack && autoBox && i === 0) ? autoBox.x : cfg.x;
      const finalY = (autoTrack && autoBox && i === 0) ? autoBox.y : cfg.y;
      const finalScale = (autoTrack && autoBox && i === 0) ? autoBox.scale * cfg.scale : cfg.scale;

      const posX = (finalX / 100) * canvas.width;
      const posY = (finalY / 100) * canvas.height;

      const baseFaceHeight = canvas.height * 0.28 * finalScale;
      const baseFaceWidth = baseFaceHeight * 0.85;

      this.drawFeatheredFace(
        ctx,
        img,
        posX,
        posY,
        baseFaceWidth,
        baseFaceHeight,
        cfg.feather,
        cfg.opacity,
        cfg.rotation || 0
      );
    }

    // 4. Draw Watermark
    if (watermarkText) {
      this.drawWatermark(ctx, watermarkText, canvas.width, canvas.height);
    }
  }

  // Feature 1: Real In-Browser Video Face Swap Renderer
  public async renderVideo(options: CompositorOptions): Promise<RenderResult> {
    const { videoSource, faces, watermarkText = 'Art Video PRO', maxDuration, autoTrack = true, onProgress } = options;

    if (onProgress) onProgress(5, 'Đang chuẩn bị tệp video và nhận diện khuôn mặt...', 0, 0);

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;

    const videoUrl = typeof videoSource === 'string' ? videoSource : URL.createObjectURL(videoSource);
    video.src = videoUrl;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('Không thể tải tệp video.'));
    });

    const duration = maxDuration ? Math.min(video.duration, maxDuration) : video.duration;
    const width = video.videoWidth || 720;
    const height = video.videoHeight || 1280;

    if (onProgress) onProgress(15, 'Đang nạp ảnh chân dung vào AI Render Engine...', 0, duration);
    const faceImages = new Map<string, HTMLImageElement>();
    for (const face of faces) {
      if (face.imageUrl) {
        try {
          const img = await this.loadImage(face.imageUrl);
          faceImages.set(face.id, img);
          faceImages.set(face.imageUrl, img);
        } catch (err) {
          console.warn('Could not load face image', err);
        }
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Không thể khởi tạo Canvas 2D Engine');

    const stream = canvas.captureStream(30);

    let chosenMime = 'video/webm;codecs=vp9';
    if (typeof MediaRecorder !== 'undefined') {
      if (!MediaRecorder.isTypeSupported(chosenMime)) chosenMime = 'video/webm;codecs=vp8';
      if (!MediaRecorder.isTypeSupported(chosenMime)) chosenMime = 'video/webm';
      if (!MediaRecorder.isTypeSupported(chosenMime)) chosenMime = 'video/mp4';
      if (!MediaRecorder.isTypeSupported(chosenMime)) chosenMime = '';
    }

    const recordedChunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, chosenMime ? { mimeType: chosenMime, videoBitsPerSecond: 5000000 } : undefined);

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    const completionPromise = new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const finalType = chosenMime || 'video/webm';
        resolve(new Blob(recordedChunks, { type: finalType }));
      };
    });

    recorder.start(100);

    video.currentTime = 0;
    await video.play();

    let isFinished = false;

    await new Promise<void>((resolve, reject) => {
      const checkFrame = async () => {
        if (isFinished) return;

        const current = video.currentTime;
        const progress = Math.min(98, Math.round((current / Math.max(duration, 0.1)) * 80) + 15);

        if (onProgress) {
          onProgress(
            progress,
            `Đang đổi khuôn mặt tự động (${current.toFixed(1)}s / ${duration.toFixed(1)}s)...`,
            current,
            duration
          );
        }

        await this.renderPreviewFrame(canvas, video, faceImages, faces, watermarkText, autoTrack);

        if (current >= duration || video.ended) {
          isFinished = true;
          video.pause();
          resolve();
          return;
        }

        requestAnimationFrame(checkFrame);
      };

      video.onerror = () => {
        isFinished = true;
        reject(new Error('Lỗi trong quá trình render video frame'));
      };

      requestAnimationFrame(checkFrame);
    });

    if (onProgress) onProgress(99, 'Đang hoàn tất đóng gói file video...', duration, duration);
    recorder.stop();
    const finalBlob = await completionPromise;

    return {
      outputBlobUrl: URL.createObjectURL(finalBlob),
      outputBlob: finalBlob,
      duration,
      width,
      height,
    };
  }

  // Feature 2: Image-To-Video AI Animator + Face Replacement
  // Converts any still image into a cinematic dynamic video with motion effects while swapping faces!
  public async renderImageToVideo(options: ImageToVideoOptions): Promise<RenderResult> {
    const {
      sourceImage,
      faces,
      motionStyle = 'KEN_BURNS',
      duration = 10,
      aspectRatio = '9:16',
      watermarkText = 'Art Video PRO • thaytiensy@gmail.com',
      onProgress,
    } = options;

    if (onProgress) onProgress(5, 'Đang nạp ảnh nguồn và khởi động AI Image Animator...', 0, duration);

    // 1. Load source image and face portraits
    const bgImage = await this.loadImage(sourceImage);
    const faceImages = new Map<string, HTMLImageElement>();
    for (const face of faces) {
      if (face.imageUrl) {
        try {
          const img = await this.loadImage(face.imageUrl);
          faceImages.set(face.id, img);
          faceImages.set(face.imageUrl, img);
        } catch (e) {
          console.warn('Could not load face image', e);
        }
      }
    }

    // 2. Determine Canvas Dimensions
    let width = 720;
    let height = 1280; // 9:16 default
    if (aspectRatio === '16:9') {
      width = 1280;
      height = 720;
    } else if (aspectRatio === '1:1') {
      width = 1080;
      height = 1080;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Không thể khởi tạo Canvas 2D Animator');

    const fps = 30;
    const totalFrames = Math.round(duration * fps);
    const stream = canvas.captureStream(fps);

    let chosenMime = 'video/webm;codecs=vp9';
    if (typeof MediaRecorder !== 'undefined') {
      if (!MediaRecorder.isTypeSupported(chosenMime)) chosenMime = 'video/webm;codecs=vp8';
      if (!MediaRecorder.isTypeSupported(chosenMime)) chosenMime = 'video/webm';
      if (!MediaRecorder.isTypeSupported(chosenMime)) chosenMime = 'video/mp4';
      if (!MediaRecorder.isTypeSupported(chosenMime)) chosenMime = '';
    }

    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, chosenMime ? { mimeType: chosenMime, videoBitsPerSecond: 5000000 } : undefined);

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    const completionPromise = new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        resolve(new Blob(chunks, { type: chosenMime || 'video/webm' }));
      };
    });

    recorder.start(100);

    // 3. Render motion frames
    for (let frame = 0; frame < totalFrames; frame++) {
      const t = frame / totalFrames; // 0.0 to 1.0 progress
      const currentSec = t * duration;
      const progressPercent = Math.min(98, Math.round(t * 85) + 10);

      if (frame % 5 === 0 && onProgress) {
        onProgress(
          progressPercent,
          `Đang tạo video từ ảnh & ghép mặt: frame ${frame}/${totalFrames} (${currentSec.toFixed(1)}s)...`,
          currentSec,
          duration
        );
      }

      // Compute motion transformation based on selected style
      let scale = 1.0;
      let panX = 0;
      let panY = 0;
      let rotation = 0;

      switch (motionStyle) {
        case 'KEN_BURNS':
          // Smooth zoom-in 1.0x -> 1.18x with diagonal pan
          scale = 1.0 + Math.sin(t * (Math.PI / 2)) * 0.18;
          panX = Math.sin(t * Math.PI) * (width * 0.035);
          panY = Math.cos(t * Math.PI) * (height * 0.025);
          break;

        case 'BREATHING_PULSE':
          // Living breathing oscillation effect
          scale = 1.0 + Math.sin(t * Math.PI * 4) * 0.04;
          panX = Math.sin(t * Math.PI * 2) * (width * 0.02);
          panY = Math.cos(t * Math.PI * 4) * (height * 0.015);
          break;

        case 'PARALLAX_ZOOM':
          // Deep push-in with gentle camera rotation
          scale = 1.0 + t * 0.22;
          rotation = Math.sin(t * Math.PI * 2) * 1.2; // subtle angle
          panY = -t * (height * 0.04);
          break;

        case 'CAMERA_PAN':
          // Horizontal cinema slider pan
          scale = 1.08;
          panX = (t - 0.5) * (width * 0.08);
          panY = Math.sin(t * Math.PI) * (height * 0.015);
          break;
      }

      // Clear & Draw Animated Background
      ctx.fillStyle = '#090a0f';
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2 + panX, height / 2 + panY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);

      // Fit / Fill background image into canvas
      const bgRatio = bgImage.width / bgImage.height;
      const canvasRatio = width / height;
      let drawW = width;
      let drawH = height;

      if (bgRatio > canvasRatio) {
        drawH = height;
        drawW = height * bgRatio;
      } else {
        drawW = width;
        drawH = width / bgRatio;
      }

      ctx.drawImage(bgImage, -drawW / 2, -drawH / 2, drawW, drawH);

      // Draw each swapped face locked onto the animated frame!
      for (const face of faces) {
        const faceImg = faceImages.get(face.id) || faceImages.get(face.imageUrl);
        if (!faceImg) continue;

        const cfg: FaceSwapConfig = face.swapConfig || {
          x: 50,
          y: 35,
          scale: 1.0,
          feather: 22,
          opacity: 0.98,
          rotation: 0,
        };

        const targetX = ((cfg.x - 50) / 100) * drawW;
        const targetY = ((cfg.y - 50) / 100) * drawH;

        const baseFaceHeight = drawH * 0.28 * cfg.scale;
        const baseFaceWidth = baseFaceHeight * 0.85;

        this.drawFeatheredFace(
          ctx,
          faceImg,
          targetX,
          targetY,
          baseFaceWidth,
          baseFaceHeight,
          cfg.feather,
          cfg.opacity,
          cfg.rotation || 0
        );
      }

      ctx.restore();

      // Top Watermark
      if (watermarkText) {
        this.drawWatermark(ctx, watermarkText, width, height);
      }

      // Small tick delay to let stream capture the canvas frame smoothly
      await new Promise((r) => setTimeout(r, 12));
    }

    if (onProgress) onProgress(99, 'Đang hoàn tất đóng gói file video MP4/WebM từ ảnh...', duration, duration);
    recorder.stop();
    const finalBlob = await completionPromise;

    return {
      outputBlobUrl: URL.createObjectURL(finalBlob),
      outputBlob: finalBlob,
      duration,
      width,
      height,
    };
  }
}

export const realVideoCompositor = new RealVideoCompositor();
