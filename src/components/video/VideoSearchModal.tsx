import React, { useState } from 'react';
import { Search, X, Film, Check, Upload, Play, Pause, Sparkles, Filter } from 'lucide-react';

export interface SampleVideoItem {
  id: string;
  title: string;
  category: string;
  industry: string;
  videoUrl: string;
  thumbUrl: string;
  duration: number;
  aspectRatio: '9:16' | '16:9' | '1:1';
}

// Curated reliable open sample video assets with CORS-safe CDN
export const SAMPLE_VIDEO_LIBRARY: SampleVideoItem[] = [
  {
    id: 'vid-cosmetics-1',
    title: 'Review Serum Căng Bóng Da Hàn Quốc',
    category: 'Mỹ phẩm',
    industry: 'my_pham',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumbUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    duration: 8,
    aspectRatio: '9:16',
  },
  {
    id: 'vid-agri-1',
    title: 'Nông Sản Sạch Trực Tiếp Tại Vườn Đà Lạt',
    category: 'Nông nghiệp',
    industry: 'nong_nghiep',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumbUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
    duration: 10,
    aspectRatio: '9:16',
  },
  {
    id: 'vid-fashion-1',
    title: 'Lookbook Mẫu Váy Công Sở Thanh Lịch',
    category: 'Thời trang',
    industry: 'thoi_trang',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumbUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
    duration: 12,
    aspectRatio: '9:16',
  },
  {
    id: 'vid-home-1',
    title: 'Trải Nghiệm Bình Đun Siêu Tốc Cao Cấp',
    category: 'Gia dụng',
    industry: 'gia_dung',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumbUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    duration: 9,
    aspectRatio: '16:9',
  },
  {
    id: 'vid-auto-1',
    title: 'Showroom Siêu Xe Điện Thông Minh 2026',
    category: 'Ô tô',
    industry: 'o_to',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumbUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80',
    duration: 15,
    aspectRatio: '16:9',
  },
  {
    id: 'vid-decor-1',
    title: 'Decor Phòng Khách Phong Cách Bắc Âu Minimalist',
    category: 'Decor',
    industry: 'decor',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumbUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    duration: 11,
    aspectRatio: '16:9',
  },
];

interface VideoSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSceneNum?: number;
  onSelectVideo: (videoUrl: string, title: string, thumbUrl?: string) => void;
}

export const VideoSearchModal: React.FC<VideoSearchModalProps> = ({
  isOpen,
  onClose,
  targetSceneNum,
  onSelectVideo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['ALL', 'Mỹ phẩm', 'Nông nghiệp', 'Thời trang', 'Gia dụng', 'Ô tô', 'Decor'];

  const filteredVideos = SAMPLE_VIDEO_LIBRARY.filter((v) => {
    const matchCat = selectedCategory === 'ALL' || v.category === selectedCategory;
    const matchSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    onSelectVideo(objectUrl, file.name.replace(/\.[^/.]+$/, ''));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0e1220] border border-[#232a42] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1f263d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Thư Viện & Tìm Kiếm Video Mẫu</span>
                {targetSceneNum && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                    Áp dụng cho Cảnh {targetSceneNum}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-neutral-400">
                Tìm video review theo ngành nghề hoặc tải lên video MP4/WebM từ máy của bạn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1a2035] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Upload Action Bar */}
        <div className="p-4 border-b border-[#1f263d] space-y-3 bg-[#0a0d18]">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập từ khóa tìm video (mỹ phẩm, thời trang, đồ gia dụng, xe hơi...)"
                className="w-full bg-[#14192b] border border-[#273252] rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {/* Direct Upload Button from PC */}
            <label className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-amber-600/20 whitespace-nowrap shrink-0">
              <Upload className="w-3.5 h-3.5" />
              <span>Tải Video Từ Máy</span>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleCustomFileUpload}
              />
            </label>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 custom-scrollbar">
            <span className="text-[11px] text-neutral-500 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Ngành:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-black font-bold'
                    : 'bg-[#151a2d] text-neutral-300 hover:text-white hover:bg-[#1f2640]'
                }`}
              >
                {cat === 'ALL' ? 'Tất cả' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 space-y-2">
              <Film className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-xs">Không tìm thấy video phù hợp với từ khóa "{searchQuery}".</p>
              <label className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-[#1a2035] hover:bg-[#252e4d] text-amber-300 text-xs font-semibold cursor-pointer border border-[#2d3757]">
                Tải lên video riêng của bạn (.mp4)
                <input type="file" accept="video/*" className="hidden" onChange={handleCustomFileUpload} />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredVideos.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#121627] rounded-xl border border-[#232b45] overflow-hidden group flex flex-col justify-between hover:border-amber-400/60 transition-all shadow-md"
                >
                  <div className="relative aspect-video bg-black overflow-hidden">
                    {playingVideoId === item.id ? (
                      <video
                        src={item.videoUrl}
                        controls
                        autoPlay
                        loop
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <img
                          src={item.thumbUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={() => setPlayingVideoId(item.id)}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
                        >
                          <div className="w-9 h-9 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </button>
                      </>
                    )}

                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono text-amber-300 border border-amber-400/20">
                      {item.category}
                    </div>
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-neutral-300">
                      {item.duration}s
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    <h3 className="text-xs font-bold text-white line-clamp-1" title={item.title}>
                      {item.title}
                    </h3>

                    <button
                      onClick={() => {
                        onSelectVideo(item.videoUrl, item.title, item.thumbUrl);
                        onClose();
                      }}
                      className="w-full py-2 bg-[#1c233a] hover:bg-amber-400 hover:text-black text-amber-300 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all border border-[#2c375b]"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{targetSceneNum ? `Chọn cho Cảnh ${targetSceneNum}` : 'Sử dụng video này'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="px-5 py-3 border-t border-[#1f263d] bg-[#0a0d18] flex items-center justify-between text-[11px] text-neutral-400">
          <span>Định dạng hỗ trợ: MP4, MOV, WebM, WEBP</span>
          <span className="text-amber-300 font-medium">Auto AI Video & Face Engine</span>
        </div>
      </div>
    </div>
  );
};
