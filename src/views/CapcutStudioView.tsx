import React, { useState, useEffect, useCallback } from 'react';
import { CapcutHeader } from '../components/capcut/CapcutHeader';
import { MediaBinZone } from '../components/capcut/MediaBinZone';
import { PreviewPlayerZone } from '../components/capcut/PreviewPlayerZone';
import { TimelineZone } from '../components/capcut/TimelineZone';
import { ExportModal } from '../components/capcut/ExportModal';
import { InteractiveGuidance, DynamicGuideHUD } from '../components/capcut/InteractiveGuidance';
import { HotkeysModal } from '../components/capcut/HotkeysModal';
import { 
  HealthStatus, 
  UploadedMedia, 
  DetectedFace, 
  faceSwapApi 
} from '../services/faceSwapApi';

export const CapcutStudioView: React.FC<{ onSwitchView?: () => void }> = ({ onSwitchView }) => {
  // Backend & System Health
  const [health, setHealth] = useState<HealthStatus | null>(null);

  // Project Info
  const [projectName, setProjectName] = useState('FaceSwap_Project_01');

  // Media Bin State
  const [mediaList, setMediaList] = useState<UploadedMedia[]>([]);
  const [activeMedia, setActiveMedia] = useState<UploadedMedia | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Source Face (Replacement Face)
  const [sourceFaceMedia, setSourceFaceMedia] = useState<UploadedMedia | null>(null);
  const [sourceFaceCrop, setSourceFaceCrop] = useState<string | null>(null);

  // Playback & Timeline
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inPoint, setInPoint] = useState(0);
  const [outPoint, setOutPoint] = useState(0);

  // AI Face Detection on Current Frame
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
  const [selectedFaceIndex, setSelectedFaceIndex] = useState(0);
  const [isDetectingFaces, setIsDetectingFaces] = useState(false);

  // Instant Swap Preview
  const [swapPreviewImage, setSwapPreviewImage] = useState<string | null>(null);
  const [isSwappingPreview, setIsSwappingPreview] = useState(false);
  const [showSwappedPreview, setShowSwappedPreview] = useState(false);

  // AI Mode
  const [unifyCharacter, setUnifyCharacter] = useState(true);
  const [swapAllFaces, setSwapAllFaces] = useState(false);

  // Modals & Guidance
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isHotkeysOpen, setIsHotkeysOpen] = useState(false);

  // 1. Check Backend Health on mount & poll every 10s
  useEffect(() => {
    const check = async () => {
      try {
        const res = await faceSwapApi.getHealth();
        setHealth(res);
      } catch (e) {
        console.warn('Backend not yet reachable:', e);
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  // 2. Upload Media handler
  const handleUploadMedia = async (file: File) => {
    try {
      setIsUploading(true);
      const uploaded = await faceSwapApi.uploadFile(file);
      setMediaList((prev) => [uploaded, ...prev]);
      if (!activeMedia) {
        handleSelectMedia(uploaded);
      }
    } catch (err: any) {
      alert(`Lỗi tải lên: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // 3. Select Media handler
  const handleSelectMedia = async (media: UploadedMedia) => {
    setActiveMedia(media);
    setCurrentTime(0);
    setDuration(media.duration || 10);
    setInPoint(0);
    setOutPoint(media.duration || 10);
    setIsPlaying(false);
    setDetectedFaces([]);
    setSwapPreviewImage(null);
    setShowSwappedPreview(false);

    // Auto detect faces at beginning of clip
    try {
      setIsDetectingFaces(true);
      const res = await faceSwapApi.detectFaces(media.file_path, 0);
      setDetectedFaces(res.faces);
      if (res.faces.length > 0) {
        setSelectedFaceIndex(0);
      }
    } catch (e) {
      console.warn('Could not auto detect faces:', e);
    } finally {
      setIsDetectingFaces(false);
    }
  };

  // 4. Delete Media
  const handleDeleteMedia = (fileId: string) => {
    setMediaList((prev) => prev.filter((m) => m.file_id !== fileId));
    if (activeMedia?.file_id === fileId) {
      const remaining = mediaList.filter((m) => m.file_id !== fileId);
      if (remaining.length > 0) {
        handleSelectMedia(remaining[0]);
      } else {
        setActiveMedia(null);
        setDuration(0);
        setCurrentTime(0);
        setDetectedFaces([]);
      }
    }
  };

  // 5. Upload Source Face
  const handleUploadSourceFace = async (file: File) => {
    try {
      const uploaded = await faceSwapApi.uploadFile(file);
      setSourceFaceMedia(uploaded);

      // Detect face in uploaded image
      const res = await faceSwapApi.detectFaces(uploaded.file_path, 0);
      if (res.faces.length > 0) {
        setSourceFaceCrop(res.faces[0].thumbnail);
      } else if (uploaded.thumbnail) {
        setSourceFaceCrop(uploaded.thumbnail);
      }
    } catch (err: any) {
      alert(`Lỗi tải ảnh chân dung: ${err.message}`);
    }
  };

  // 6. Trigger Detect Faces at current timestamp
  const handleTriggerDetectFaces = async () => {
    if (!activeMedia) return;
    try {
      setIsDetectingFaces(true);
      const res = await faceSwapApi.detectFaces(activeMedia.file_path, currentTime);
      setDetectedFaces(res.faces);
      if (res.faces.length > 0) {
        setSelectedFaceIndex(0);
      }
    } catch (err: any) {
      alert(`Lỗi phát hiện khuôn mặt: ${err.message}`);
    } finally {
      setIsDetectingFaces(false);
    }
  };

  // 7. Instant Swap Preview
  const handleGeneratePreviewSwap = async () => {
    if (!activeMedia || !sourceFaceMedia) return;
    try {
      setIsSwappingPreview(true);
      const params = {
        source_image_path: sourceFaceMedia.file_path,
        target_video_path: activeMedia.type === 'video' ? activeMedia.file_path : undefined,
        target_image_path: activeMedia.type === 'image' ? activeMedia.file_path : undefined,
        timestamp: currentTime,
        target_face_index: selectedFaceIndex,
      };
      const res = await faceSwapApi.swapPreview(params);
      setSwapPreviewImage(res.swapped_image);
      setShowSwappedPreview(true);
    } catch (err: any) {
      alert(`Lỗi xem thử: ${err.message}`);
    } finally {
      setIsSwappingPreview(false);
    }
  };

  // 8. Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'KeyS') {
        e.preventDefault();
        setInPoint(currentTime);
      } else if (e.code === 'KeyI' || e.key === '[') {
        e.preventDefault();
        setInPoint(currentTime);
      } else if (e.code === 'KeyO' || e.key === ']') {
        e.preventDefault();
        setOutPoint(currentTime);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        const step = e.shiftKey ? 1.0 : 1 / (activeMedia?.fps || 30);
        setCurrentTime((t) => Math.max(0, t - step));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        const step = e.shiftKey ? 1.0 : 1 / (activeMedia?.fps || 30);
        setCurrentTime((t) => Math.min(duration, t + step));
      } else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyE') {
        e.preventDefault();
        if (activeMedia && sourceFaceMedia) {
          setIsExportOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration, activeMedia, sourceFaceMedia]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#090a0f] text-white overflow-hidden select-none font-sans">
      {/* Top CapCut App Header */}
      <CapcutHeader
        health={health}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onOpenExport={() => setIsExportOpen(true)}
        onToggleGuide={() => setIsGuideOpen((g) => !g)}
        onToggleHotkeys={() => setIsHotkeysOpen(true)}
        isGuideActive={isGuideOpen}
        canExport={Boolean(activeMedia && sourceFaceMedia)}
        onSwitchView={onSwitchView}
      />

      {/* Main 3-Zone Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Zone 1 (Left): Media Bin & Face Bank */}
        <MediaBinZone
          mediaList={mediaList}
          activeMedia={activeMedia}
          onSelectMedia={handleSelectMedia}
          onUploadMedia={handleUploadMedia}
          onDeleteMedia={handleDeleteMedia}
          sourceFaceMedia={sourceFaceMedia}
          sourceFaceCrop={sourceFaceCrop}
          onUploadSourceFace={handleUploadSourceFace}
          unifyCharacter={unifyCharacter}
          onToggleUnifyCharacter={setUnifyCharacter}
          swapAllFaces={swapAllFaces}
          onToggleSwapAllFaces={setSwapAllFaces}
          isUploading={isUploading}
        />

        {/* Zone 2 (Center): Preview Player with Face Detection Overlay */}
        <PreviewPlayerZone
          activeMedia={activeMedia}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          onSeek={setCurrentTime}
          onMarkIn={() => setInPoint(currentTime)}
          onMarkOut={() => setOutPoint(currentTime)}
          inPoint={inPoint}
          outPoint={outPoint}
          detectedFaces={detectedFaces}
          selectedFaceIndex={selectedFaceIndex}
          onSelectFace={setSelectedFaceIndex}
          isDetectingFaces={isDetectingFaces}
          onTriggerDetectFaces={handleTriggerDetectFaces}
          sourceFaceCrop={sourceFaceCrop}
          sourceFaceMedia={sourceFaceMedia}
          swapPreviewImage={swapPreviewImage}
          isSwappingPreview={isSwappingPreview}
          onGeneratePreviewSwap={handleGeneratePreviewSwap}
          showSwappedPreview={showSwappedPreview}
          onToggleShowSwappedPreview={setShowSwappedPreview}
        />
      </div>

      {/* Dynamic Workflow Guidance Banner */}
      <DynamicGuideHUD
        hasMedia={Boolean(activeMedia)}
        hasSourceFace={Boolean(sourceFaceMedia)}
        hasSelectedFace={detectedFaces.length > 0}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Zone 3 (Bottom): Multi-Track Timeline */}
      <TimelineZone
        activeMedia={activeMedia}
        currentTime={currentTime}
        duration={duration}
        onSeek={setCurrentTime}
        inPoint={inPoint}
        outPoint={outPoint}
        onSetInPoint={setInPoint}
        onSetOutPoint={setOutPoint}
        onResetInOut={() => {
          setInPoint(0);
          setOutPoint(duration);
        }}
        selectedFaceIndex={selectedFaceIndex}
        detectedFaces={detectedFaces}
        sourceFaceCrop={sourceFaceCrop}
        unifyCharacter={unifyCharacter}
        swapAllFaces={swapAllFaces}
      />

      {/* Export Modal (720p, 1080p, 2k, 4k, 8k) */}
      {activeMedia && sourceFaceMedia && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          videoPath={activeMedia.file_path}
          sourceImagePath={sourceFaceMedia.file_path}
          targetFaceIndex={selectedFaceIndex}
          inPoint={inPoint}
          outPoint={outPoint}
          duration={duration}
          unifyCharacter={unifyCharacter}
          swapAllFaces={swapAllFaces}
        />
      )}

      {/* Interactive Guidance Walkthrough Modal */}
      <InteractiveGuidance
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        hasMedia={Boolean(activeMedia)}
        hasSourceFace={Boolean(sourceFaceMedia)}
        hasDetectedFaces={detectedFaces.length > 0}
        hasSelectedFace={detectedFaces.length > 0}
      />

      {/* Hotkeys Shortcuts Modal */}
      <HotkeysModal
        isOpen={isHotkeysOpen}
        onClose={() => setIsHotkeysOpen(false)}
      />
    </div>
  );
};
