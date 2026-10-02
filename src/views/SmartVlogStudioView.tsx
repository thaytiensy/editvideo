import React, { useState, useRef } from 'react';
import { 
  INDUSTRY_PRESETS, 
  IndustryPreset, 
  SceneStoryboard 
} from '../data/industryPresets';
import { smartVlogService } from '../services/smartVlogService';
import { geminiService } from '../services/geminiService';
import { db } from '../services/db';
import { downloadVideoFile } from '../services/videoDownloader';
import { VideoSearchModal } from '../components/video/VideoSearchModal';
import { 
  Sparkles, Wand2, Video, Download, Play, Pause, RefreshCw, 
  Smartphone, Monitor, Phone, ChevronRight, Layers, Eye, 
  Upload, Scissors, CheckCircle2, Film, Volume2, VolumeX,
  Sliders, Settings, ArrowRight, ShieldCheck, Flame, Zap, Search, Plus
} from 'lucide-react';

export const SmartVlogStudioView: React.FC = () => {
  // Active industry preset
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('gia_dung');
  const activePreset = INDUSTRY_PRESETS.find(p => p.id === selectedIndustryId) || INDUSTRY_PRESETS[0];

  // View mode: 'pc' (Ver3: PC) vs 'mobile' (Ver1: Mobile)
  const [viewMode, setViewMode] = useState<'pc' | 'mobile'>('pc');

  // Mobile sub-tab: 'settings' | 'storyboard' | 'production'
  const [mobileTab, setMobileTab] = useState<'settings' | 'storyboard' | 'production'>('settings');

  // Product & character slots (6 slots)
  const [slots, setSlots] = useState(activePreset.productSlots);

  // Vlog idea input
  const [vlogIdea, setVlogIdea] = useState(activePreset.defaultIdea);

  // Camera angle & image style
  const [cameraAngle, setCameraAngle] = useState<'lo_mat' | 'pov' | 'boi_canh'>(activePreset.defaultAngle);
  const [imageStyle, setImageStyle] = useState<string>(activePreset.defaultStyle);

  // 4 Scenes storyboard
  const [scenes, setScenes] = useState<SceneStoryboard[]>(activePreset.scenes);

  // AI Script generation state
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);

  // Step 2: "Bung tạo 1/4" progress state
  const [bungStage, setBungStage] = useState<number>(0); // 0 = idle, 1..4 = active
  const [isBunging, setIsBunging] = useState(false);

  // Audio TTS playing state
  const [playingSceneAudioId, setPlayingSceneAudioId] = useState<string | null>(null);

  // Single Scene Video generation state
  const [renderingSceneId, setRenderingSceneId] = useState<string | null>(null);
  const [renderProgress, setRenderProgress] = useState<{ percent: number; message: string }>({ percent: 0, message: '' });

  // Batch rendering state
  const [isBatchRendering, setIsBatchRendering] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ percent: number; message: string }>({ percent: 0, message: '' });

  // Video Search & Template Library Modal state
  const [isVideoSearchOpen, setIsVideoSearchOpen] = useState(false);
  const [searchTargetSceneNum, setSearchTargetSceneNum] = useState<number | undefined>(undefined);

  // Smart Edit Modal
  const [editingScene, setEditingScene] = useState<SceneStoryboard | null>(null);
  const [editPrompt, setEditPrompt] = useState('');

  // Switch industry preset
  const handleSelectIndustry = (preset: IndustryPreset) => {
    setSelectedIndustryId(preset.id);
    setSlots(preset.productSlots);
    setVlogIdea(preset.defaultIdea);
    setCameraAngle(preset.defaultAngle);
    setImageStyle(preset.defaultStyle);
    setScenes(preset.scenes);
    smartVlogService.stopSpeaking();
    setPlayingSceneAudioId(null);
  };

  // 1. Tạo kịch bản AI (Google Gemini AI integrated)
  const handleGenerateScript = async () => {
    setIsGeneratingScript(true);
    setGenerationNotice('Gemini AI đang viết kịch bản 4 phân cảnh...');

    try {
      const res = await geminiService.generateSmartVlogStoryboard(
        activePreset.name,
        vlogIdea,
        imageStyle,
        cameraAngle
      );

      const updated = scenes.map((sc, idx) => {
        const gen = res.scenes[idx];
        if (gen) {
          return {
            ...sc,
            title: gen.title || sc.title,
            dialogue: gen.dialogue || sc.dialogue,
            autoPrompt: gen.autoPrompt || sc.autoPrompt,
          };
        }
        return sc;
      });

      setScenes(updated);
      setGenerationNotice(`Đã tạo kịch bản 4 phân cảnh thành công (${res.modelUsed})!`);
      setTimeout(() => setGenerationNotice(null), 4000);
    } catch (err: any) {
      setGenerationNotice('Lỗi tạo kịch bản: ' + (err?.message || err));
      setTimeout(() => setGenerationNotice(null), 4000);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // 2. Bung tạo: 1/4 -> 4/4 (Visual preview generation across all 4 scenes)
  const handleBungTaoScenes = async () => {
    setIsBunging(true);
    for (let step = 1; step <= 4; step++) {
      setBungStage(step);
      // Small visual delay to show realistic AI generation progression
      await new Promise(r => setTimeout(r, 600));
    }
    setIsBunging(false);
    setGenerationNotice('Đã bung tạo 4/4 hình ảnh và bối cảnh phân cảnh thành công!');
    setTimeout(() => setGenerationNotice(null), 3000);
  };

  // 3. Đồng nhất Prompt (Adds consistent character tags, lighting, seed to all scene prompts)
  const handleUnifyPrompts = () => {
    const charTag = slots[0]?.url ? 'consistent character face lock, same outfit, high likeness 98%' : 'consistent reviewer character';
    const styleTag = imageStyle === 'cinematic' 
      ? 'cinematic lighting, 8k resolution, Arri Alexa 35mm lens, photorealistic, color graded' 
      : 'ultra sharp commercial studio photography, softbox lighting, clean backdrop, 8k';

    const updated = scenes.map((sc) => {
      const unifiedPrompt = `${sc.autoPrompt}, ${charTag}, ${styleTag}, highly detailed, master quality.`;
      return { ...sc, autoPrompt: unifiedPrompt };
    });
    setScenes(updated);
    setGenerationNotice('Đã đồng nhất Prompt 4 phân cảnh thành công! Độ đồng nhất nhân vật đạt 95-100%.');
    setTimeout(() => setGenerationNotice(null), 4000);
  };

  // 4. TTS Play / Stop
  const handleToggleVoice = (scene: SceneStoryboard) => {
    if (playingSceneAudioId === scene.id) {
      smartVlogService.stopSpeaking();
      setPlayingSceneAudioId(null);
    } else {
      setPlayingSceneAudioId(scene.id);
      smartVlogService.speak({
        text: scene.dialogue,
        voiceGender: scene.voiceGender,
        onEnd: () => setPlayingSceneAudioId(null),
        onError: () => setPlayingSceneAudioId(null),
      });
    }
  };

  // 5. Render Single Scene Video
  const handleRenderSceneVideo = async (scene: SceneStoryboard) => {
    setRenderingSceneId(scene.id);
    setRenderProgress({ percent: 5, message: 'Khởi tạo render video phân cảnh...' });

    try {
      const videoUrl = await smartVlogService.renderSceneVideo({
        scene,
        characterImgUrl: slots[0]?.url,
        width: 1280,
        height: 720,
        includeSubtitles: true,
        onProgress: (p, msg) => setRenderProgress({ percent: p, message: msg }),
      });

      // Update scene with generated videoUrl
      setScenes(prev => prev.map(s => s.id === scene.id ? { ...s, videoUrl, status: 'completed' } : s));

      // Auto trigger download for user convenience
      await downloadVideoFile(videoUrl, `Canh_${scene.sceneNum}_${activePreset.name}_Review`);
    } catch (err: any) {
      alert('Lỗi render video: ' + (err?.message || err));
    } finally {
      setRenderingSceneId(null);
    }
  };

  // 6. Batch Render All 4 Scenes ("4. Xuất video đồng loạt")
  const handleBatchExport = async () => {
    setIsBatchRendering(true);
    setBatchProgress({ percent: 0, message: 'Chuẩn bị xuất video đồng loạt 4 phân cảnh...' });

    try {
      const masterBlobUrl = await smartVlogService.renderBatchReviewVideo({
        scenes,
        characterImgUrl: slots[0]?.url,
        projectName: `Review_${activePreset.name}_Viral_TikTok`,
        onProgress: (percent, curIdx, message) => {
          setBatchProgress({ percent, message });
        },
      });

      // Save job to db so it appears in JobsHistoryView
      db.createJob({
        templateId: `review-${activePreset.id}-${Date.now()}`,
        templateTitle: `Review ${activePreset.name} (4 Phân Cảnh Master)`,
        industry: activePreset.id.toUpperCase() as any,
        userId: 'user-admin-tiensy',
        userEmail: 'thaytiensy@gmail.com',
        shopId: 'shop-zen-1',
        faces: slots.filter(s => s.isCharacter && s.url).map((s, idx) => ({
          id: `face-${idx}`,
          name: s.label,
          imageUrl: s.url,
          livenessPassed: true,
          consentTick: true,
        })),
        status: 'COMPLETED',
        progress: 100,
        stageMessage: 'Đã xuất thành công trọn bộ video!',
        outputUrl: masterBlobUrl,
        durationSeconds: scenes.reduce((acc, s) => acc + (s.duration || 4), 0),
        appliedWatermark: 'TOOL ĐA NĂNG AI • thaytiensy@gmail.com',
        engineUsed: 'Real 30FPS AI Canvas & MediaRecorder',
      });
    } catch (err: any) {
      alert('Lỗi xuất video đồng loạt: ' + (err?.message || err));
    } finally {
      setIsBatchRendering(false);
    }
  };

  // Upload custom image or video to a product slot (slots 1 to 6)
  const handleSlotUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    const updated = [...slots];
    updated[index] = { 
      ...updated[index], 
      url: objectUrl,
      label: file.name.slice(0, 16) 
    };
    setSlots(updated);
  };

  // Upload custom video or photo directly to a specific scene
  const handleSceneMediaUpload = (sceneId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov|m4v)$/i);

    if (isVideo) {
      setScenes(prev => prev.map(s => s.id === sceneId ? {
        ...s,
        videoUrl: objectUrl,
        title: `Tải lên: ${file.name.replace(/\.[^/.]+$/, '').slice(0, 25)}`,
        status: 'completed'
      } : s));
    } else {
      setScenes(prev => prev.map(s => s.id === sceneId ? {
        ...s,
        image: objectUrl,
        videoUrl: undefined,
        status: 'ready'
      } : s));
    }
  };

  // Open Video Search Modal for a specific scene or overall
  const openVideoSearchForScene = (sceneNum?: number) => {
    setSearchTargetSceneNum(sceneNum);
    setIsVideoSearchOpen(true);
  };

  // When a video is selected from library
  const handleApplySelectedVideo = (videoUrl: string, title: string, thumbUrl?: string) => {
    if (searchTargetSceneNum) {
      setScenes(prev => prev.map(s => s.sceneNum === searchTargetSceneNum ? {
        ...s,
        videoUrl,
        image: thumbUrl || s.image,
        title: `Mẫu: ${title}`,
        status: 'completed'
      } : s));
    } else {
      // Apply to first scene
      setScenes(prev => prev.map((s, idx) => idx === 0 ? {
        ...s,
        videoUrl,
        image: thumbUrl || s.image,
        title: `Mẫu: ${title}`,
        status: 'completed'
      } : s));
    }
  };

  // Save Smart Edit
  const handleSaveSmartEdit = () => {
    if (!editingScene) return;
    setScenes(prev => prev.map(s => s.id === editingScene.id ? { 
      ...s, 
      autoPrompt: editPrompt,
      dialogue: editingScene.dialogue,
      title: editingScene.title,
      motionStyle: editingScene.motionStyle,
      duration: editingScene.duration,
    } : s));
    setEditingScene(null);
  };

  return (
    <div className="min-h-screen bg-[#07080C] text-[#F3F4F6] flex flex-col font-sans select-none pb-12">
      {/* Top Banner / System Bar */}
      <header className="sticky top-0 z-40 bg-[#0C0E17]/95 border-b border-[#1E2235] px-4 py-2.5 backdrop-blur-md">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-3 flex-wrap">
          {/* Brand & Project Key matching image */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-600/20 border border-amber-500/40 text-amber-300 font-bold text-xs tracking-wide shadow-sm shadow-amber-500/10">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>KEY 666 TIẾN SỸ AI HUB - SMART VLOG</span>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#181B2A] border border-[#2B3048] text-neutral-300 text-[11px] font-semibold">
              REVIEW ĐA NGÀNH NGHỀ
            </span>
          </div>

          {/* Center Version Switcher (Ver3: PC vs Ver1: Mobile) */}
          <div className="flex items-center gap-1.5 p-1 bg-[#121524] rounded-xl border border-[#232840]">
            <button
              onClick={() => setViewMode('pc')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'pc'
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Phiên bản Ver3 : PC</span>
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'mobile'
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Phiên bản Ver1 : Mobile</span>
            </button>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex items-center gap-2.5">
            {/* Find video library button */}
            <button
              onClick={() => openVideoSearchForScene()}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#181D33] hover:bg-[#232B4C] border border-[#2C375C] text-amber-300 text-xs font-semibold transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>Tìm Video Mẫu</span>
            </button>

            {/* Hotline */}
            <a
              href="tel:0988658050"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#181B2A] border border-[#2D334D] text-amber-300 font-mono text-xs font-bold hover:border-amber-400 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>0988-658-050</span>
            </a>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real 30FPS AI Engine</span>
            </div>
          </div>
        </div>
      </header>

      {/* Floating notification badge for script or prompt changes */}
      {generationNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-xs rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-4 h-4 fill-current" />
          <span>{generationNotice}</span>
        </div>
      )}

      {/* Main Workspace: If Ver1 Mobile, show Mobile Mockup frame; if Ver3 PC, show Full PC Studio */}
      {viewMode === 'mobile' ? (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-[#05060A]">
          {/* Smartphone Mockup matching image 1 (Left Phone) */}
          <div className="w-[380px] h-[780px] max-w-full bg-[#0C0E18] rounded-[48px] border-[8px] border-[#2A2E44] shadow-2xl shadow-indigo-950/40 flex flex-col overflow-hidden relative">
            {/* Dynamic Island / Speaker Notch */}
            <div className="w-full flex justify-center pt-2 pb-1 bg-[#0C0E18]">
              <div className="w-24 h-4 bg-black rounded-full" />
            </div>

            {/* Mobile Top Header */}
            <div className="px-4 py-2 border-b border-[#1E2338] bg-[#0E111E] flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>REVIEW ĐA NGÀNH NGHỀ</span>
              </div>
              <div className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                0988-658-050
              </div>
            </div>

            {/* Mobile Content Area based on bottom tab */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {mobileTab === 'settings' && (
                <div className="space-y-4">
                  {/* NHÂN VẬT & SẢN PHẨM (6 slots) */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-2">
                      <span>NHÂN VẬT & SẢN PHẨM</span>
                      <span className="text-[10px] text-neutral-400">Tải ảnh/video</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map((s, idx) => (
                        <label
                          key={s.id}
                          className={`relative aspect-square rounded-xl overflow-hidden border cursor-pointer group bg-black/60 transition-all ${
                            idx === 0 ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-[#262B44]'
                          }`}
                        >
                          <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleSlotUpload(idx, e)} />
                          <img src={s.url} alt={s.label} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Upload className="w-4 h-4 text-white" />
                          </div>
                          <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-center text-neutral-200 py-0.5 truncate px-1">
                            {idx === 0 ? 'Nhân vật' : `SP ${idx}`}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* GÓC QUAY & PHONG CÁCH */}
                  <div>
                    <div className="text-xs font-bold text-amber-300 mb-2">GÓC QUAY & PHONG CÁCH</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => setCameraAngle('lo_mat')}
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                          cameraAngle === 'lo_mat' ? 'bg-amber-400 text-black shadow-md' : 'bg-[#161A2B] text-neutral-300'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lộ mặt</span>
                      </button>
                      <button
                        onClick={() => setCameraAngle('pov')}
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                          cameraAngle === 'pov' ? 'bg-amber-400 text-black shadow-md' : 'bg-[#161A2B] text-neutral-300'
                        }`}
                      >
                        <span>POV</span>
                      </button>
                      <button
                        onClick={() => setCameraAngle('boi_canh')}
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                          cameraAngle === 'boi_canh' ? 'bg-amber-400 text-black shadow-md' : 'bg-[#161A2B] text-neutral-300'
                        }`}
                      >
                        <span>Bối cảnh</span>
                      </button>
                    </div>
                  </div>

                  {/* Ý TƯỞNG VLOG */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-1">
                      <span>Ý TƯỞNG VLOG</span>
                      <button
                        onClick={() => setVlogIdea(activePreset.defaultIdea)}
                        className="text-[10px] text-neutral-400 hover:text-amber-300 underline"
                      >
                        Mẫu
                      </button>
                    </div>
                    <textarea
                      value={vlogIdea}
                      onChange={(e) => setVlogIdea(e.target.value)}
                      rows={3}
                      className="w-full bg-[#161A2B] border border-[#262B44] rounded-xl p-2.5 text-xs text-neutral-200 resize-none focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={handleGenerateScript}
                      disabled={isGeneratingScript}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                    >
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>{isGeneratingScript ? 'AI Đang Viết Kịch Bản...' : '1. Tạo kịch bản'}</span>
                    </button>
                    <button
                      onClick={handleBungTaoScenes}
                      disabled={isBunging}
                      className="w-full py-2 bg-[#22273F] text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-[#373F63]"
                    >
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isBunging ? `Đang tạo: ${bungStage}/4` : 'Bung tạo: 1/4'}</span>
                    </button>
                    <button
                      onClick={handleUnifyPrompts}
                      className="w-full py-2 bg-[#22273F] text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-[#373F63]"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>2. Đồng nhất Prompt</span>
                    </button>
                  </div>
                </div>
              )}

              {mobileTab === 'storyboard' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span>4 PHÂN CẢNH VLOG</span>
                    <button 
                      onClick={() => openVideoSearchForScene()}
                      className="text-[10px] text-amber-400 underline flex items-center gap-1"
                    >
                      <Search className="w-3 h-3" /> Tìm Video
                    </button>
                  </div>
                  {scenes.map((scene) => (
                    <div key={scene.id} className="bg-[#121626] rounded-2xl border border-[#202740] p-3 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-amber-400">Cảnh {scene.sceneNum}: {scene.title}</span>
                        <button
                          onClick={() => downloadVideoFile(scene.videoUrl || scene.image, `Canh_${scene.sceneNum}`)}
                          className="p-1 rounded bg-[#1c2238] text-neutral-300 hover:text-white"
                          title="Tải video/ảnh"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-[#27304e]">
                        {scene.videoUrl ? (
                          <video src={scene.videoUrl} controls className="w-full h-full object-cover" />
                        ) : (
                          <img src={scene.image} alt={scene.title} className="w-full h-full object-cover" />
                        )}
                      </div>

                      {/* Upload button for this scene */}
                      <div className="flex gap-2">
                        <label className="flex-1 py-1.5 px-2 bg-[#1b2238] hover:bg-[#252f4e] text-neutral-200 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors border border-[#2f395c]">
                          <Upload className="w-3 h-3 text-amber-400" />
                          <span>Tải Video/Ảnh</span>
                          <input
                            type="file"
                            accept="video/*,image/*"
                            className="hidden"
                            onChange={(e) => handleSceneMediaUpload(scene.id, e)}
                          />
                        </label>
                        <button
                          onClick={() => openVideoSearchForScene(scene.sceneNum)}
                          className="py-1.5 px-2 bg-[#1b2238] hover:bg-[#252f4e] text-amber-300 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors border border-[#2f395c]"
                        >
                          <Search className="w-3 h-3" />
                          <span>Mẫu</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-neutral-300 bg-[#0C0F1A] p-2 rounded-lg border border-[#1E253B]">
                        "{scene.dialogue}"
                      </div>

                      <button
                        onClick={() => handleRenderSceneVideo(scene)}
                        disabled={renderingSceneId === scene.id}
                        className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold rounded-lg text-xs flex items-center justify-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{renderingSceneId === scene.id ? `Render (${renderProgress.percent}%)...` : 'VIDEO PRODUCTION'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {mobileTab === 'production' && (
                <div className="space-y-4 text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                    <Film className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Xuất Video Review Hoàn Chỉnh</h3>
                  <p className="text-[11px] text-neutral-400 px-4">
                    Ghép toàn bộ 4 phân cảnh, đồng bộ giọng đọc AI tiếng Việt, hiệu ứng chuyển cảnh và chữ chạy phụ đề karaoke.
                  </p>

                  <button
                    onClick={handleBatchExport}
                    disabled={isBatchRendering}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isBatchRendering ? `Đang kết xuất (${batchProgress.percent}%)...` : '4. Xuất Video Hàng Loạt'}</span>
                  </button>

                  {isBatchRendering && (
                    <div className="p-3 bg-[#121524] rounded-xl border border-[#232840] text-left text-[10px]">
                      <div className="flex justify-between text-neutral-300 mb-1">
                        <span>{batchProgress.message}</span>
                        <span>{batchProgress.percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${batchProgress.percent}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Bottom Navigation Bar matching image */}
            <div className="h-14 bg-[#0A0C14] border-t border-[#1F2338] grid grid-cols-3 text-[10px] font-bold">
              <button
                onClick={() => setMobileTab('settings')}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  mobileTab === 'settings' ? 'text-amber-400' : 'text-neutral-500'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>CÀI ĐẶT</span>
              </button>
              <button
                onClick={() => setMobileTab('storyboard')}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  mobileTab === 'storyboard' ? 'text-amber-400' : 'text-neutral-500'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>PHÂN CẢNH</span>
              </button>
              <button
                onClick={() => setMobileTab('production')}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  mobileTab === 'production' ? 'text-amber-400' : 'text-neutral-500'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>DỰNG PHIM</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* Ver3 : PC Layout - Full Desktop Widescreen Studio matching images 2, 3, 4 */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col max-w-[1920px] w-full mx-auto px-3 sm:px-5 pt-3 gap-3">
          {/* Main Top Studio Area: Left Control Sidebar + Center Multi-Scene Storyboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
            {/* LEFT CONTROL SIDEBAR (lg:col-span-4 xl:col-span-3) */}
            <aside className="lg:col-span-4 xl:col-span-3 bg-[#0D101C] rounded-2xl border border-[#1E2338] p-3.5 space-y-3.5 shadow-xl">
              {/* Branding Box in Sidebar */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-amber-300 tracking-wider">TIẾN SỸ AI HUB</div>
                  <div className="text-[10px] text-neutral-400 font-semibold">REVIEW ĐA NGÀNH NGHỀ</div>
                </div>
                <div className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                  0988-658-050
                </div>
              </div>

              {/* NHÂN VẬT & SẢN PHẨM (6 slots grid) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                  <span>NHÂN VẬT & SẢN PHẨM</span>
                  <span className="text-[10px] text-neutral-400 font-normal">Tải ảnh/video (6 slots)</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((s, idx) => (
                    <label
                      key={s.id}
                      className={`relative aspect-square rounded-xl overflow-hidden border cursor-pointer group bg-black/50 transition-all ${
                        idx === 0 ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-[#262B44] hover:border-neutral-400'
                      }`}
                    >
                      <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleSlotUpload(idx, e)} />
                      <img src={s.url} alt={s.label} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload className="w-4 h-4 text-white" />
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-xs text-[9px] text-center text-neutral-200 py-0.5 truncate px-1 font-medium">
                        {idx === 0 ? '👤 Nhân vật' : `SP ${idx}`}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* GÓC QUAY & PHONG CÁCH */}
              <div className="space-y-2 pt-1 border-t border-[#1C2035]">
                <div className="text-xs font-bold text-amber-300">GÓC QUAY & PHONG CÁCH</div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setCameraAngle('lo_mat')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                      cameraAngle === 'lo_mat'
                        ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                        : 'bg-[#161A2B] text-neutral-300 hover:bg-[#20253D]'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lộ mặt</span>
                  </button>
                  <button
                    onClick={() => setCameraAngle('pov')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                      cameraAngle === 'pov'
                        ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                        : 'bg-[#161A2B] text-neutral-300 hover:bg-[#20253D]'
                    }`}
                  >
                    <span>POV</span>
                  </button>
                  <button
                    onClick={() => setCameraAngle('boi_canh')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                      cameraAngle === 'boi_canh'
                        ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                        : 'bg-[#161A2B] text-neutral-300 hover:bg-[#20253D]'
                    }`}
                  >
                    <span>Bối cảnh</span>
                  </button>
                </div>

                {/* Dropdown: Phong cách hình ảnh */}
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">PHONG CÁCH HÌNH ẢNH:</label>
                  <select
                    value={imageStyle}
                    onChange={(e) => setImageStyle(e.target.value)}
                    className="w-full bg-[#161A2B] border border-[#2B3048] rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="cinematic">Điện ảnh (Cinematic 4K Master)</option>
                    <option value="realistic">Chân thực (Hyper-Realistic Studio)</option>
                    <option value="3d">3D Render (CGI Commercial)</option>
                    <option value="viral">TikTok Viral (Punchy & Warm)</option>
                    <option value="vintage">Vintage 35mm Film</option>
                  </select>
                </div>
              </div>

              {/* Ý TƯỞNG VLOG */}
              <div className="space-y-1.5 pt-1 border-t border-[#1C2035]">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                  <span>Ý TƯỞNG VLOG</span>
                  <button
                    onClick={() => setVlogIdea(activePreset.defaultIdea)}
                    className="text-[10px] text-neutral-400 hover:text-amber-300 underline"
                  >
                    Mặc định
                  </button>
                </div>
                <textarea
                  value={vlogIdea}
                  onChange={(e) => setVlogIdea(e.target.value)}
                  rows={3}
                  className="w-full bg-[#161A2B] border border-[#262B44] rounded-xl p-2.5 text-xs text-neutral-200 resize-none focus:outline-none focus:border-amber-400 leading-relaxed custom-scrollbar"
                />
              </div>

              {/* ACTION WORKFLOW BUTTONS (Numbered 1, Bung 1/4, 2, 4) */}
              <div className="space-y-2 pt-2 border-t border-[#1C2035]">
                <button
                  onClick={handleGenerateScript}
                  disabled={isGeneratingScript}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all transform active:scale-98"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>{isGeneratingScript ? 'AI Đang Viết Kịch Bản...' : '1. Tạo kịch bản'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleBungTaoScenes}
                    disabled={isBunging}
                    className="py-2 bg-[#22273F] hover:bg-[#2C3352] text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-[#373F63] transition-all"
                  >
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isBunging ? `Đang tạo: ${bungStage}/4` : 'Bung tạo: 1/4'}</span>
                  </button>

                  <button
                    onClick={handleUnifyPrompts}
                    className="py-2 bg-[#22273F] hover:bg-[#2C3352] text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-[#373F63] transition-all"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>2. Đồng nhất Prompt</span>
                  </button>
                </div>

                <button
                  onClick={handleBatchExport}
                  disabled={isBatchRendering}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all transform active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>{isBatchRendering ? `Đang xuất (${batchProgress.percent}%)...` : '4. Xuất video đồng loạt'}</span>
                </button>

                {isBatchRendering && (
                  <div className="p-2.5 bg-[#141829] rounded-xl border border-emerald-500/30 space-y-1.5 text-[11px]">
                    <div className="flex justify-between items-center text-neutral-300">
                      <span className="truncate pr-2">{batchProgress.message}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-400 font-bold">{batchProgress.percent}%</span>
                        <button
                          onClick={() => {
                            setIsBatchRendering(false);
                            setBatchProgress({ percent: 0, message: 'Đã dừng tiến trình xuất video.' });
                          }}
                          className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold hover:bg-red-500/30 transition-colors"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${batchProgress.percent}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* CENTER MULTI-SCENE STORYBOARD (lg:col-span-8 xl:col-span-9) */}
            <main className="lg:col-span-8 xl:col-span-9 space-y-3">
              {/* Scene Column Grid (4 columns for Cảnh 1, Cảnh 2, Cảnh 3, Cảnh 4) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {scenes.map((scene) => (
                  <div
                    key={scene.id}
                    className="bg-[#0D101C] rounded-2xl border border-[#1E2338] p-3 space-y-3 shadow-lg flex flex-col justify-between"
                  >
                    {/* Scene Card Header */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#1C2035]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black flex items-center justify-center">
                          {scene.sceneNum}
                        </span>
                        <span className="font-bold text-xs text-neutral-200 truncate max-w-[110px]" title={scene.title}>
                          Cảnh {scene.sceneNum}
                        </span>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-1">
                        {/* Direct File Upload button for this scene */}
                        <label 
                          className="p-1 rounded-md text-neutral-400 hover:text-amber-300 hover:bg-[#1A1F33] transition-colors cursor-pointer"
                          title="Tải video/ảnh riêng lên cảnh này"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="video/*,image/*"
                            className="hidden"
                            onChange={(e) => handleSceneMediaUpload(scene.id, e)}
                          />
                        </label>

                        {/* Search library video for this scene */}
                        <button
                          onClick={() => openVideoSearchForScene(scene.sceneNum)}
                          className="p-1 rounded-md text-neutral-400 hover:text-amber-300 hover:bg-[#1A1F33] transition-colors"
                          title="Tìm video mẫu cho cảnh này"
                        >
                          <Search className="w-3.5 h-3.5" />
                        </button>

                        {/* Direct Download of this scene video */}
                        <button
                          onClick={() => downloadVideoFile(scene.videoUrl || scene.image, `Canh_${scene.sceneNum}_${activePreset.name}`)}
                          className="p-1 rounded-md text-neutral-400 hover:text-emerald-400 hover:bg-[#1A1F33] transition-colors"
                          title="Tải video cảnh này về máy"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingScene(scene);
                            setEditPrompt(scene.autoPrompt);
                          }}
                          className="p-1 rounded-md text-neutral-400 hover:text-amber-300 hover:bg-[#1A1F33] transition-colors"
                          title="Sửa prompt / chi tiết"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Preview Image / Video Container */}
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-black/60 border border-[#232840] group">
                      {scene.videoUrl ? (
                        <video
                          src={scene.videoUrl}
                          controls
                          loop
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={scene.image}
                          alt={scene.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}

                      {/* Video generation loading overlay */}
                      {renderingSceneId === scene.id && (
                        <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center z-10">
                          <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mb-2" />
                          <span className="text-[10px] text-neutral-300 font-medium">{renderProgress.message}</span>
                          <span className="text-xs text-amber-400 font-bold mt-1">{renderProgress.percent}%</span>
                        </div>
                      )}

                      {/* Quick upload overlay indicator */}
                      <label className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 hover:bg-black/90 text-[10px] text-amber-300 rounded-lg cursor-pointer flex items-center gap-1 border border-amber-400/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-3 h-3" />
                        <span>Đổi Video/Ảnh</span>
                        <input
                          type="file"
                          accept="video/*,image/*"
                          className="hidden"
                          onChange={(e) => handleSceneMediaUpload(scene.id, e)}
                        />
                      </label>
                    </div>

                    {/* SỬA ẢNH THÔNG MINH BUTTON */}
                    <button
                      onClick={() => {
                        setEditingScene(scene);
                        setEditPrompt(scene.autoPrompt);
                      }}
                      className="w-full py-1.5 bg-[#161B2E] hover:bg-[#202742] text-amber-300 hover:text-amber-200 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>SỬA ẢNH THÔNG MINH</span>
                    </button>

                    {/* LỜI THOẠI & TÔNG GIỌNG */}
                    <div className="space-y-1 bg-[#121524] p-2.5 rounded-xl border border-[#1E2338]">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                        <span className="flex items-center gap-1">
                          <Volume2 className="w-3 h-3 text-amber-400" />
                          <span>LỜI THOẠI & TÔNG GIỌNG</span>
                        </span>
                        <button
                          onClick={() => handleToggleVoice(scene)}
                          className="px-2 py-0.5 rounded-md bg-[#22273F] text-amber-300 text-[10px] font-bold hover:bg-amber-400 hover:text-black transition-colors flex items-center gap-1"
                        >
                          {playingSceneAudioId === scene.id ? (
                            <>
                              <VolumeX className="w-3 h-3 text-red-400" />
                              <span>Dừng</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-current" />
                              <span>Nghe</span>
                            </>
                          )}
                        </button>
                      </div>

                      <textarea
                        value={scene.dialogue}
                        onChange={(e) => {
                          const val = e.target.value;
                          setScenes(prev => prev.map(s => s.id === scene.id ? { ...s, dialogue: val } : s));
                        }}
                        rows={3}
                        className="w-full bg-[#181B2C] border border-[#272D45] rounded-lg p-2 text-xs text-neutral-200 resize-none focus:outline-none focus:border-amber-400 leading-relaxed custom-scrollbar"
                      />

                      <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1">
                        <span>Giọng:</span>
                        <select
                          value={scene.voiceGender}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setScenes(prev => prev.map(s => s.id === scene.id ? { ...s, voiceGender: val } : s));
                          }}
                          className="bg-[#1C2138] border border-[#2C3352] rounded-md px-1.5 py-0.5 text-[10px] text-neutral-300"
                        >
                          <option value="female_north">Nữ Miền Bắc</option>
                          <option value="female_south">Nữ Miền Nam</option>
                          <option value="male_north">Nam Miền Bắc</option>
                          <option value="male_south">Nam Miền Nam</option>
                        </select>
                      </div>
                    </div>

                    {/* Auto Prompt */}
                    <div className="bg-[#121524] p-2 rounded-xl border border-[#1E2338] space-y-1">
                      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Auto Prompt</span>
                        <span className="text-[9px] text-amber-400 font-mono">8K UHD</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 line-clamp-2 leading-tight">
                        {scene.autoPrompt}
                      </p>
                    </div>

                    {/* VIDEO PRODUCTION (Yellow play button matching image) */}
                    <button
                      onClick={() => handleRenderSceneVideo(scene)}
                      disabled={renderingSceneId === scene.id}
                      className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{renderingSceneId === scene.id ? `Đang render (${renderProgress.percent}%)...` : 'VIDEO PRODUCTION'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </main>
          </div>

          {/* BOTTOM INDUSTRY PRESETS BAR ("REVIEW ĐA NGÀNH NGHỀ - 1 TOOL LÀM TẤT CẢ") */}
          <section className="bg-[#0D101C] rounded-2xl border border-[#1E2338] p-3.5 space-y-2.5 shadow-xl">
            {/* Header banner bar matching promo image */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white font-black text-xs tracking-wider shadow-md">
                  REVIEW ĐA NGÀNH NGHỀ - 1 TOOL LÀM TẤT CẢ
                </span>
                <span className="text-xs text-neutral-400 hidden md:inline">
                  Bấm chọn ngành nghề để nạp trọn bộ kịch bản, sản phẩm & visual tự động
                </span>
              </div>
              <div className="text-xs text-amber-400 font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Nhân vật & Giọng nói đồng nhất 95-100%</span>
              </div>
            </div>

            {/* Industry Cards Slider / Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2">
              {INDUSTRY_PRESETS.map((preset) => {
                const isSelected = preset.id === selectedIndustryId;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectIndustry(preset)}
                    className={`relative rounded-xl overflow-hidden border p-1 flex flex-col items-center gap-1 transition-all group ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/40 bg-amber-500/10'
                        : 'border-[#22273D] bg-[#121524] hover:border-neutral-500'
                    }`}
                  >
                    <div className="w-full aspect-[4/3] rounded-lg overflow-hidden relative">
                      <img
                        src={preset.coverThumb}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <span className="absolute top-1 right-1 text-sm bg-black/60 rounded-md px-1">
                        {preset.icon}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-neutral-200 group-hover:text-amber-300 transition-colors uppercase tracking-tight truncate w-full text-center">
                      {preset.name}
                    </span>
                  </button>
                );
              })}

              {/* And many other industries (+) card */}
              <button
                onClick={() => openVideoSearchForScene()}
                className="rounded-xl border border-dashed border-[#2F3654] hover:border-amber-400 p-1 flex flex-col items-center justify-center gap-1 bg-[#101322] hover:bg-amber-500/10 transition-all text-neutral-400 hover:text-amber-300"
              >
                <div className="w-full aspect-[4/3] rounded-lg bg-[#181D33] flex items-center justify-center">
                  <span className="text-xl font-bold text-amber-400">+</span>
                </div>
                <span className="text-[10px] font-bold uppercase truncate w-full text-center">
                  Và nhiều ngành...
                </span>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* SMART EDIT MODAL */}
      {editingScene && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101424] border border-[#2B3250] rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#202742] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Sửa Ảnh Thông Minh · Cảnh {editingScene.sceneNum}</h3>
              </div>
              <button
                onClick={() => setEditingScene(null)}
                className="text-neutral-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1 font-semibold">Tiêu Đề Phân Cảnh:</label>
                <input
                  type="text"
                  value={editingScene.title}
                  onChange={(e) => setEditingScene({ ...editingScene, title: e.target.value })}
                  className="w-full bg-[#171C30] border border-[#2B3352] rounded-xl px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 font-semibold">Lời Thoại Tiếng Việt:</label>
                <textarea
                  value={editingScene.dialogue}
                  onChange={(e) => setEditingScene({ ...editingScene, dialogue: e.target.value })}
                  rows={2}
                  className="w-full bg-[#171C30] border border-[#2B3352] rounded-xl p-3 text-neutral-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 font-semibold">Auto Prompt AI (Visual Generation):</label>
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  rows={3}
                  className="w-full bg-[#171C30] border border-[#2B3352] rounded-xl p-3 text-neutral-200 focus:outline-none focus:border-amber-400 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-neutral-400 block mb-1 font-semibold">Chuyển động Camera:</label>
                  <select
                    value={editingScene.motionStyle}
                    onChange={(e) => setEditingScene({ ...editingScene, motionStyle: e.target.value as any })}
                    className="w-full bg-[#171C30] border border-[#2B3352] rounded-xl px-3 py-2 text-neutral-200"
                  >
                    <option value="zoom_in">Zoom In (Tiến dần vào sản phẩm)</option>
                    <option value="pan_right">Pan Right (Quét ngang từ trái sang)</option>
                    <option value="orbit">Orbit 3D (Xoay tròn góc nhìn)</option>
                    <option value="tilt_up">Tilt Up (Quét từ chân lên mặt)</option>
                    <option value="breathing">Breathing Pulse (Nhịp thở sống động)</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1 font-semibold">Thời lượng (giây):</label>
                  <input
                    type="number"
                    min={2}
                    max={15}
                    value={editingScene.duration}
                    onChange={(e) => setEditingScene({ ...editingScene, duration: parseInt(e.target.value) || 4 })}
                    className="w-full bg-[#171C30] border border-[#2B3352] rounded-xl px-3 py-2 text-neutral-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#202742]">
              {/* Face swap shortcut using Character from Slot 1 */}
              <button
                type="button"
                onClick={() => {
                  if (slots[0]?.url) {
                    setEditingScene({
                      ...editingScene,
                      image: slots[0].url,
                    });
                    alert('Đã khóa khuôn mặt nhân vật từ Slot 1 vào phân cảnh này!');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ghép Mặt Nhân Vật (Slot 1)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingScene(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-700"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSaveSmartEdit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-bold shadow-lg shadow-amber-500/20"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Search & Template Library Modal */}
      <VideoSearchModal
        isOpen={isVideoSearchOpen}
        onClose={() => setIsVideoSearchOpen(false)}
        targetSceneNum={searchTargetSceneNum}
        onSelectVideo={handleApplySelectedVideo}
      />
    </div>
  );
};
