import React, { useState, useRef, useEffect } from 'react';
import { db } from '../services/db';
import { FaceItem, VideoJob, FaceSwapConfig, ImageToVideoMotion } from '../types';
import { useAuth } from '../context/AuthContext';
import { useBrand } from '../context/BrandContext';
import { videoPipeline } from '../services/videoPipeline';
import { realVideoCompositor } from '../services/realVideoCompositor';
import { VideoJobProgressModal } from '../components/video/VideoJobProgressModal';
import { 
  UploadCloud, Video, Wand2, Play, Pause, RefreshCw, Sparkles, 
  CheckCircle2, AlertCircle, ShieldCheck, Sliders, Layers, Eye, 
  Trash2, Plus, Film, Clock, RotateCcw, Download, Scissors, Image as ImageIcon,
  Bot, Move, Sparkle, Camera, Zap
} from 'lucide-react';

const PRESET_VIDEOS = [
  {
    id: 'sample-runway',
    title: 'Người Mẫu Runway Thời Trang (Dọc 9:16)',
    aspectRatio: '9:16',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumb: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
    duration: 15,
  },
  {
    id: 'sample-business',
    title: 'Thuyết Trình Doanh Nhân & Công Nghệ (Ngang 16:9)',
    aspectRatio: '16:9',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumb: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80',
    duration: 15,
  },
  {
    id: 'sample-lifestyle',
    title: 'Cận Cảnh Lifestyle & Skincare (Vuông 1:1)',
    aspectRatio: '1:1',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumb: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    duration: 15,
  },
];

const PRESET_SOURCE_IMAGES = [
  {
    id: 'src-img-fashion',
    title: 'Chân Dung Thời Trang Paris',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=720&q=80',
  },
  {
    id: 'src-img-suit',
    title: 'Doanh Nhân Vest Công Sở',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=720&q=80',
  },
  {
    id: 'src-img-glamour',
    title: 'Dạ Hội Luxury Glamour',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=720&q=80',
  },
];

const PRESET_FACES = [
  {
    name: 'Chân dung Á Đông',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Chân dung Doanh nhân Nam',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Chân dung Nữ Trẻ trung',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Chân dung Nam Sành điệu',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Chân dung Phong cách Âu Mỹ',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  },
];

const MOTION_STYLES: { key: ImageToVideoMotion; label: string; desc: string }[] = [
  {
    key: 'KEN_BURNS',
    label: 'Ken Burns 3D',
    desc: 'Hiệu ứng zoom điện ảnh mượt mà và quét góc nhìn 3D',
  },
  {
    key: 'BREATHING_PULSE',
    label: 'Nhịp Thở Sống Động',
    desc: 'Chuyển động nhịp thở và lắc lư tự nhiên như người thật',
  },
  {
    key: 'PARALLAX_ZOOM',
    label: 'Parallax Chiều Sâu',
    desc: 'Đẩy sâu góc máy với góc xoay nghệ thuật 2.5D',
  },
  {
    key: 'CAMERA_PAN',
    label: 'Lướt Máy Quay Cinema',
    desc: 'Lia máy quay ngang theo chiều phong cách studio cao cấp',
  },
];

export const CreateStudioView: React.FC = () => {
  const { currentUser, refreshUserData } = useAuth();
  const { watermarkText } = useBrand();

  // Active Studio Mode: Video Swap vs Image-To-Video Swap
  const [studioMode, setStudioMode] = useState<'VIDEO_SWAP' | 'IMAGE_TO_VIDEO'>('VIDEO_SWAP');

  // Mode A: Video States
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>(PRESET_VIDEOS[0].url);
  const [videoTitle, setVideoTitle] = useState<string>(PRESET_VIDEOS[0].title);
  const [videoDuration, setVideoDuration] = useState<number>(15);
  const [renderDuration, setRenderDuration] = useState<number>(10);
  const [autoTrack, setAutoTrack] = useState<boolean>(true); // Auto Face Tracking Mode

  // Mode B: Image to Video States
  const [sourceImageFile, setSourceImageFile] = useState<File | null>(null);
  const [sourceImageUrl, setSourceImageUrl] = useState<string>(PRESET_SOURCE_IMAGES[0].url);
  const [sourceImageTitle, setSourceImageTitle] = useState<string>(PRESET_SOURCE_IMAGES[0].title);
  const [selectedMotion, setSelectedMotion] = useState<ImageToVideoMotion>('KEN_BURNS');
  const [imageVideoDuration, setImageVideoDuration] = useState<number>(10);

  // Common: Face States (up to 5 faces allowed for PRO)
  const [faces, setFaces] = useState<FaceItem[]>([
    {
      id: 'face-1',
      name: 'Khuôn mặt chính',
      imageUrl: PRESET_FACES[0].url,
      consentTick: true,
      livenessPassed: true,
      estimatedAge: 25,
      swapConfig: {
        x: 50,
        y: 34,
        scale: 1.0,
        feather: 22,
        opacity: 0.98,
        rotation: 0,
      },
    },
  ]);
  const [selectedFaceIndex, setSelectedFaceIndex] = useState<number>(0);

  // Video Players & Canvas Preview
  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgAnimCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [cachedFaceImages, setCachedFaceImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const [cachedSourceImg, setCachedSourceImg] = useState<HTMLImageElement | null>(null);

  // In-flight Job modal
  const [activeJob, setActiveJob] = useState<VideoJob | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Pre-load Face Images
  useEffect(() => {
    const map = new Map<string, HTMLImageElement>();
    let loadedCount = 0;
    faces.forEach((f) => {
      if (f.imageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          map.set(f.id, img);
          map.set(f.imageUrl, img);
          loadedCount++;
          if (loadedCount === faces.length) {
            setCachedFaceImages(new Map(map));
          }
        };
        img.src = f.imageUrl;
      }
    });
  }, [faces]);

  // Pre-load source image for Mode B
  useEffect(() => {
    if (sourceImageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setCachedSourceImg(img);
      img.src = sourceImageUrl;
    }
  }, [sourceImageUrl]);

  // Video File Upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError(null);
    setVideoFile(file);
    const blobUrl = URL.createObjectURL(file);
    setVideoUrl(blobUrl);
    setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
    setIsPlaying(false);
  };

  // Source Image Upload for Mode B
  const handleSourceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError(null);
    setSourceImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setSourceImageUrl(dataUrl);
        setSourceImageTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  // Face Photo Upload
  const handleFaceImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        const updated = [...faces];
        updated[index] = {
          ...updated[index],
          imageUrl: dataUrl,
          name: file.name.split('.')[0] || `Mặt #${index + 1}`,
          consentTick: true,
        };
        setFaces(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  // Update Face Config
  const updateCurrentFaceConfig = (patch: Partial<FaceSwapConfig>) => {
    const updated = [...faces];
    const current = updated[selectedFaceIndex] || updated[0];
    const prevCfg = current.swapConfig || {
      x: 50,
      y: 34,
      scale: 1.0,
      feather: 22,
      opacity: 0.98,
      rotation: 0,
    };
    current.swapConfig = { ...prevCfg, ...patch };
    setFaces(updated);
  };

  const handleResetFacePosition = () => {
    updateCurrentFaceConfig({
      x: 50,
      y: 34,
      scale: 1.0,
      feather: 22,
      opacity: 0.98,
      rotation: 0,
    });
  };

  // Mode A: Video Preview Loop with Auto-Tracking
  useEffect(() => {
    if (studioMode !== 'VIDEO_SWAP') return;

    let animId: number;
    const video = hiddenVideoRef.current;
    const canvas = previewCanvasRef.current;

    const render = () => {
      if (video && canvas && video.readyState >= 2) {
        realVideoCompositor.renderPreviewFrame(
          canvas,
          video,
          cachedFaceImages,
          faces,
          watermarkText,
          autoTrack
        );
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [studioMode, cachedFaceImages, faces, watermarkText, autoTrack]);

  // Mode B: Image-to-Video Live Preview Animation Loop
  useEffect(() => {
    if (studioMode !== 'IMAGE_TO_VIDEO' || !cachedSourceImg) return;

    let animId: number;
    const canvas = imgAnimCanvasRef.current;
    if (!canvas) return;

    let startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const t = (elapsed % 6) / 6; // 6s cycle for preview

      const width = 720;
      const height = 1280;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (ctx && cachedSourceImg) {
        let scale = 1.0;
        let panX = 0;
        let panY = 0;
        let rotation = 0;

        switch (selectedMotion) {
          case 'KEN_BURNS':
            scale = 1.0 + Math.sin(t * (Math.PI / 2)) * 0.16;
            panX = Math.sin(t * Math.PI) * 20;
            panY = Math.cos(t * Math.PI) * 15;
            break;
          case 'BREATHING_PULSE':
            scale = 1.0 + Math.sin(t * Math.PI * 4) * 0.035;
            panX = Math.sin(t * Math.PI * 2) * 10;
            break;
          case 'PARALLAX_ZOOM':
            scale = 1.0 + t * 0.2;
            rotation = Math.sin(t * Math.PI * 2) * 1.0;
            break;
          case 'CAMERA_PAN':
            scale = 1.06;
            panX = (t - 0.5) * 50;
            break;
        }

        ctx.fillStyle = '#090a0f';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(width / 2 + panX, height / 2 + panY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(scale, scale);

        const bgRatio = cachedSourceImg.width / cachedSourceImg.height;
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

        ctx.drawImage(cachedSourceImg, -drawW / 2, -drawH / 2, drawW, drawH);

        // Draw Swapped Face
        for (const face of faces) {
          const faceImg = cachedFaceImages.get(face.id) || cachedFaceImages.get(face.imageUrl);
          if (!faceImg) continue;

          const cfg = face.swapConfig || { x: 50, y: 34, scale: 1.0, feather: 22, opacity: 0.98, rotation: 0 };
          const targetX = ((cfg.x - 50) / 100) * drawW;
          const targetY = ((cfg.y - 50) / 100) * drawH;
          const baseFaceHeight = drawH * 0.28 * cfg.scale;
          const baseFaceWidth = baseFaceHeight * 0.85;

          realVideoCompositor.drawFeatheredFace(
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

        if (watermarkText) {
          realVideoCompositor.drawWatermark(ctx, watermarkText, width, height);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [studioMode, cachedSourceImg, cachedFaceImages, faces, selectedMotion, watermarkText]);

  // Video Playback
  const togglePlay = () => {
    const video = hiddenVideoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Launch Rendering for either Mode A or Mode B
  const handleStartRender = () => {
    if (!currentUser) return;

    const currentTitle = studioMode === 'VIDEO_SWAP' ? videoTitle : `Ảnh Động AI - ${sourceImageTitle}`;
    const check = videoPipeline.validateRenderRequest(
      currentUser.id,
      { title: currentTitle, maxFaces: 5 },
      faces
    );
    if (!check.valid) {
      setValidationError(check.error || 'Yêu cầu không vượt qua kiểm định an toàn.');
      return;
    }

    setValidationError(null);

    const newJob = db.createJob({
      userId: currentUser.id,
      userEmail: currentUser.email,
      shopId: currentUser.shopId,
      jobType: studioMode === 'VIDEO_SWAP' ? 'VIDEO_FACE_SWAP' : 'IMAGE_TO_VIDEO_SWAP',
      motionStyle: studioMode === 'IMAGE_TO_VIDEO' ? selectedMotion : undefined,
      sourceImageUrl: studioMode === 'IMAGE_TO_VIDEO' ? sourceImageUrl : undefined,
      templateTitle: currentTitle,
      templateThumbUrl: faces[0]?.imageUrl || '',
      videoSourceUrl: studioMode === 'VIDEO_SWAP' ? videoUrl : undefined,
      videoFileName: studioMode === 'VIDEO_SWAP' ? (videoFile?.name || 'video_face_swap.mp4') : 'ai_animated_photo.mp4',
      faces,
      status: 'PROCESSING',
      progress: 0,
      stageMessage: studioMode === 'VIDEO_SWAP'
        ? 'Đang khởi chạy Real Video Auto Face Swap Engine...'
        : 'Đang khởi chạy AI Image-To-Video Animator...',
      engineUsed: studioMode === 'VIDEO_SWAP'
        ? 'Real Auto Face Tracking & Video Engine'
        : 'Real AI Image-To-Video Animator',
      durationSeconds: studioMode === 'VIDEO_SWAP'
        ? Math.min(renderDuration, videoDuration || 15)
        : imageVideoDuration,
      appliedWatermark: watermarkText || 'Art Video PRO • thaytiensy@gmail.com',
    });

    setActiveJob(newJob);
    setIsJobModalOpen(true);
  };

  const activeFace = faces[selectedFaceIndex] || faces[0];
  const activeCfg = activeFace.swapConfig || {
    x: 50,
    y: 34,
    scale: 1.0,
    feather: 22,
    opacity: 0.98,
    rotation: 0,
  };

  return (
    <div className="space-y-6 pb-16 text-left">
      {/* Hidden Video for Mode A */}
      <video
        ref={hiddenVideoRef}
        src={videoUrl}
        crossOrigin="anonymous"
        loop
        playsInline
        muted
        className="hidden"
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          setVideoDuration(Math.round(v.duration) || 15);
        }}
      />

      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              AI CHẠY THẬT 100%
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              PRO UNLIMITED
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-neutral-400 bg-neutral-800 border border-neutral-700">
              Admin: thaytiensy@gmail.com
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Studio Sáng Tạo Video AI & Đổi Khuôn Mặt</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Đổi mặt tự động trong video bằng AI Tracker · Hoặc tạo video chuyển động điện ảnh từ ảnh tĩnh đồng thời ghép mặt
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="px-3 py-1.5 bg-[#141829] border border-neutral-800 rounded-xl text-xs text-neutral-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-mono">Không Khóa Key API · Quyền PRO Không Giới Hạn</span>
          </div>
        </div>
      </div>

      {/* Studio Feature Mode Switcher Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#121524] rounded-2xl border border-neutral-800 max-w-2xl">
        <button
          type="button"
          onClick={() => setStudioMode('VIDEO_SWAP')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            studioMode === 'VIDEO_SWAP'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>1. Đổi Mặt Trong Video (AI Tự Động)</span>
        </button>

        <button
          type="button"
          onClick={() => setStudioMode('IMAGE_TO_VIDEO')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            studioMode === 'IMAGE_TO_VIDEO'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>2. Tạo Video Từ Ảnh & Đổi Mặt</span>
        </button>
      </div>

      {/* Main 2-Column Studio Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Visual Canvas Player (7 cols) */}
        <div className="lg:col-span-7 bg-[#10131d] border border-neutral-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2 min-w-0">
              {studioMode === 'VIDEO_SWAP' ? (
                <Film className="w-4 h-4 text-indigo-400 shrink-0" />
              ) : (
                <Sparkle className="w-4 h-4 text-purple-400 shrink-0" />
              )}
              <h3 className="text-sm font-semibold text-white truncate">
                {studioMode === 'VIDEO_SWAP' ? videoTitle : sourceImageTitle}
              </h3>
            </div>

            {studioMode === 'VIDEO_SWAP' && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-neutral-400">{videoDuration}s</span>
                <button
                  type="button"
                  onClick={togglePlay}
                  className="py-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Tạm Dừng' : 'Xem Thử'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Canvas Display View */}
          <div className="relative aspect-video max-h-[460px] bg-black rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center group shadow-inner">
            {studioMode === 'VIDEO_SWAP' ? (
              <canvas
                ref={previewCanvasRef}
                className="max-h-full max-w-full object-contain cursor-crosshair"
                title="Khung hiển thị ghép mặt video thời gian thực"
              />
            ) : (
              <canvas
                ref={imgAnimCanvasRef}
                className="max-h-full max-w-full object-contain"
                title="Khung hiển thị ảnh động điện ảnh thời gian thực"
              />
            )}

            {studioMode === 'VIDEO_SWAP' && !isPlaying && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-14 h-14 bg-black/60 hover:bg-indigo-600/80 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all hover:scale-110 border border-white/20 shadow-xl"
              >
                <Play className="w-6 h-6 ml-1" />
              </button>
            )}

            {/* Dynamic Watermark Tag */}
            <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[10px] font-mono text-white/90 border border-white/10 pointer-events-none">
              {watermarkText || 'Art Video PRO • thaytiensy@gmail.com'}
            </div>

            {/* Bottom Status bar */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-white/80 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg pointer-events-none">
              <span>Đang ghép: {activeFace.name} ({activeCfg.scale}x)</span>
              <span>
                {studioMode === 'VIDEO_SWAP'
                  ? (autoTrack ? '🤖 AI Auto Tracking: BẬT' : `Tọa độ: X=${activeCfg.x}%, Y=${activeCfg.y}%`)
                  : `Hiệu ứng: ${selectedMotion}`}
              </span>
            </div>
          </div>

          {/* Mode A: Upload Video Or Pick Sample */}
          {studioMode === 'VIDEO_SWAP' && (
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-indigo-400" />
                  <span>Chọn Video Gốc Cần Thay Mặt:</span>
                </span>
                <label className="cursor-pointer py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Tải Video Từ Máy Tính</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Sample Videos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {PRESET_VIDEOS.map((pv) => {
                  const isSelected = videoUrl === pv.url;
                  return (
                    <button
                      key={pv.id}
                      type="button"
                      onClick={() => {
                        setVideoFile(null);
                        setVideoUrl(pv.url);
                        setVideoTitle(pv.title);
                        setIsPlaying(false);
                      }}
                      className={`text-left p-2 rounded-xl border flex items-center gap-2.5 transition-all ${
                        isSelected
                          ? 'bg-indigo-950/30 border-indigo-500 ring-1 ring-indigo-500/30'
                          : 'bg-[#141726] border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <img src={pv.thumb} alt={pv.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-white truncate">{pv.title}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{pv.aspectRatio} · {pv.duration}s</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mode B: Upload Source Image Or Pick Sample */}
          {studioMode === 'IMAGE_TO_VIDEO' && (
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  <span>Chọn Ảnh Gốc Cần Tạo Thành Video:</span>
                </span>
                <label className="cursor-pointer py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Tải Ảnh Từ Máy Tính</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSourceImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Sample Source Images */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {PRESET_SOURCE_IMAGES.map((si) => {
                  const isSelected = sourceImageUrl === si.url;
                  return (
                    <button
                      key={si.id}
                      type="button"
                      onClick={() => {
                        setSourceImageFile(null);
                        setSourceImageUrl(si.url);
                        setSourceImageTitle(si.title);
                      }}
                      className={`text-left p-2 rounded-xl border flex items-center gap-2.5 transition-all ${
                        isSelected
                          ? 'bg-purple-950/30 border-purple-500 ring-1 ring-purple-500/30'
                          : 'bg-[#141726] border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <img src={si.url} alt={si.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-white truncate">{si.title}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">Chân dung mẫu</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Export Duration Settings */}
          <div className="p-3 bg-[#131726] border border-neutral-800 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-neutral-300 font-medium flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-indigo-400" />
                <span>Thời lượng video xuất ra:</span>
              </span>
              <span className="font-mono text-indigo-300 font-semibold">
                {studioMode === 'VIDEO_SWAP' ? renderDuration : imageVideoDuration} giây
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[5, 10, 15].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => {
                    if (studioMode === 'VIDEO_SWAP') setRenderDuration(sec);
                    else setImageVideoDuration(sec);
                  }}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-mono font-medium transition-colors ${
                    (studioMode === 'VIDEO_SWAP' ? renderDuration === sec : imageVideoDuration === sec)
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-[#1b2034] text-neutral-400 hover:text-white'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Face Replacement & Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Box 1: Face Portrait Uploader & Multi-Face */}
          <div className="bg-[#10131d] border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Khuôn Mặt Thay Thế ({faces.length}/5)</span>
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Tải ảnh chân dung của bạn hoặc chọn khuôn mặt mẫu
                </p>
              </div>

              {faces.length < 5 && (
                <button
                  type="button"
                  onClick={() => {
                    const newIdx = faces.length + 1;
                    const preset = PRESET_FACES[(newIdx - 1) % PRESET_FACES.length];
                    const newFace: FaceItem = {
                      id: `face-${Date.now()}-${newIdx}`,
                      name: `Khuôn mặt #${newIdx}`,
                      imageUrl: preset.url,
                      consentTick: true,
                      livenessPassed: true,
                      estimatedAge: 24,
                      swapConfig: {
                        x: 35 + newIdx * 8,
                        y: 36,
                        scale: 0.85,
                        feather: 20,
                        opacity: 0.95,
                        rotation: 0,
                      },
                    };
                    setFaces([...faces, newFace]);
                    setSelectedFaceIndex(faces.length);
                  }}
                  className="py-1 px-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm Mặt
                </button>
              )}
            </div>

            {/* Face item tabs if multiple */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {faces.map((f, idx) => (
                <div
                  key={f.id}
                  onClick={() => setSelectedFaceIndex(idx)}
                  className={`cursor-pointer px-3 py-1.5 rounded-xl border flex items-center gap-2 shrink-0 transition-all ${
                    selectedFaceIndex === idx
                      ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                      : 'bg-[#141725] text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  <img src={f.imageUrl} alt={f.name} className="w-5 h-5 rounded-full object-cover ring-1 ring-white/20" />
                  <span className="text-xs truncate max-w-[80px]">{f.name}</span>
                  {faces.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFaces(faces.filter((_, i) => i !== idx));
                        setSelectedFaceIndex(Math.max(0, idx - 1));
                      }}
                      className="text-neutral-400 hover:text-red-400 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Active Face Image & Upload Button */}
            <div className="p-3.5 bg-[#141727] border border-neutral-800 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={activeFace.imageUrl}
                  alt={activeFace.name}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-500 shadow-md"
                />
                <div className="flex-1 space-y-1">
                  <span className="text-xs font-semibold text-white block">{activeFace.name}</span>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Tải Ảnh Chân Dung Mới</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFaceImageUpload(selectedFaceIndex, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Preset Faces */}
              <div>
                <span className="text-[11px] text-neutral-400 block mb-1.5">Hoặc chọn nhanh chân dung:</span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {PRESET_FACES.map((pf, pIdx) => (
                    <img
                      key={pIdx}
                      src={pf.url}
                      alt={pf.name}
                      onClick={() => {
                        const updated = [...faces];
                        updated[selectedFaceIndex] = { ...updated[selectedFaceIndex], imageUrl: pf.url, name: pf.name };
                        setFaces(updated);
                      }}
                      className={`w-9 h-9 rounded-lg object-cover cursor-pointer transition-all hover:scale-105 border ${
                        activeFace.imageUrl === pf.url
                          ? 'border-indigo-500 ring-2 ring-indigo-500/40'
                          : 'border-neutral-800 opacity-70 hover:opacity-100'
                      }`}
                      title={pf.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Box 2 (Mode A): Automatic Face Tracking & Manual Sliders */}
          {studioMode === 'VIDEO_SWAP' && (
            <div className="bg-[#10131d] border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
              {/* Auto Track Toggle */}
              <div className="p-3 bg-gradient-to-r from-indigo-950/50 to-purple-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>Tự Động Bám Theo Khuôn Mặt</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                        AI TRACKER
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400">
                      Tự động dò tìm tọa độ mặt người mẫu và bám theo từng khung hình video
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAutoTrack(!autoTrack)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                    autoTrack ? 'bg-indigo-600' : 'bg-neutral-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      autoTrack ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Manual adjustment sliders */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="font-semibold text-white flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Tinh Chỉnh Vị Trí & Kích Thước:
                  </span>
                  <button
                    type="button"
                    onClick={handleResetFacePosition}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Căn Giữa
                  </button>
                </div>

                {/* X */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Tọa độ ngang X:</span>
                    <span className="font-mono text-white">{activeCfg.x}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    value={activeCfg.x}
                    onChange={(e) => updateCurrentFaceConfig({ x: Number(e.target.value) })}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Y */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Tọa độ dọc Y:</span>
                    <span className="font-mono text-white">{activeCfg.y}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    value={activeCfg.y}
                    onChange={(e) => updateCurrentFaceConfig({ y: Number(e.target.value) })}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Scale */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Tỉ lệ khuôn mặt (Zoom):</span>
                    <span className="font-mono text-white">{activeCfg.scale.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={activeCfg.scale}
                    onChange={(e) => updateCurrentFaceConfig({ scale: Number(e.target.value) })}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Feather */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Độ mềm viền hòa trộn (Feather):</span>
                    <span className="font-mono text-white">{activeCfg.feather}px</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="45"
                    value={activeCfg.feather}
                    onChange={(e) => updateCurrentFaceConfig({ feather: Number(e.target.value) })}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Box 2 (Mode B): AI Image-To-Video Motion Styles Selection */}
          {studioMode === 'IMAGE_TO_VIDEO' && (
            <div className="bg-[#10131d] border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
              <div className="border-b border-neutral-800 pb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkle className="w-4 h-4 text-purple-400" />
                  <span>Chọn Hiệu Ứng Chuyển Động Điện Ảnh</span>
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  AI tạo chuyển động camera, hơi thở và góc nhìn 2.5D từ ảnh tĩnh
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {MOTION_STYLES.map((ms) => {
                  const isSelected = selectedMotion === ms.key;
                  return (
                    <div
                      key={ms.key}
                      onClick={() => setSelectedMotion(ms.key)}
                      className={`cursor-pointer p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-purple-950/30 border-purple-500 ring-1 ring-purple-500/30'
                          : 'bg-[#141727] border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-xs">{ms.label}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                      </div>
                      <p className="text-[10px] text-neutral-400 leading-snug">{ms.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Face position on image */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="font-medium text-white">Vị trí khuôn mặt trên ảnh (Y):</span>
                  <span className="font-mono text-white">{activeCfg.y}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={activeCfg.y}
                  onChange={(e) => updateCurrentFaceConfig({ y: Number(e.target.value) })}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Validation Error banner */}
          {validationError && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>{validationError}</div>
            </div>
          )}

          {/* BIG ACTION BUTTON */}
          <button
            type="button"
            onClick={handleStartRender}
            className={`w-full py-4 px-4 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl hover:scale-[1.01] ${
              studioMode === 'VIDEO_SWAP'
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/30'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-600/30'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>
              {studioMode === 'VIDEO_SWAP'
                ? 'Bắt Đầu Đổi Mặt Video Tự Động (Real Engine)'
                : 'Bắt Đầu Tạo Video Từ Ảnh & Đổi Mặt (Real Engine)'}
            </span>
          </button>
        </div>
      </div>

      {/* Progress & Output Modal */}
      <VideoJobProgressModal
        job={activeJob}
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onJobFinished={() => {
          refreshUserData();
        }}
      />
    </div>
  );
};
