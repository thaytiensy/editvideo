# Nexus Video Pro — Production-Grade AI Video Studio & Non-Linear Video Editor (NLE)

[![CI Build](https://github.com/thaytiensy/editvideo/actions/workflows/ci-build.yml/badge.svg)](https://github.com/thaytiensy/editvideo/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-22%20LTS-green)](https://nodejs.org/)
[![Python Version](https://img.shields.io/badge/Python-3.10%2B-blue)](https://python.org/)
[![Docker Support](https://img.shields.io/badge/Docker-Ready-blue)](https://docker.com/)

> **TOOL ĐA NĂNG AI — PHIÊN BẢN BIG UPDATE 2026**
> **REVIEW ĐA NGÀNH NGHỀ — 1 TOOL LÀM TẤT CẢ**
> Đồng nhất nhân vật và giọng nói đạt tỉ lệ 95-100%, hỗ trợ cả **Phiên bản Ver3 : PC** và **Phiên bản Ver1 : Mobile**.

---

## 1. TỔNG QUAN HỆ THỐNG & TÍNH NĂNG NỔI BẬT

Nexus Video Pro là hệ thống phòng dựng phim phi tuyến tính (NLE) và studio sản xuất video ứng dụng trí tuệ nhân tạo (Generative AI) thế hệ mới, chạy trực tiếp trên nền tảng Web:

- ✅ **Tạo video AI siêu nhanh:** Kết xuất phân cảnh 1080p/4K 30fps trực tiếp trên trình duyệt hoặc máy chủ GPU.
- ✅ **Nhân vật đồng nhất 95-100%:** Khóa khuôn mặt và phong cách bằng InsightFace (`buffalo_l` + `inswapper_128`), bộ lọc làm mờ viền cạnh 25px (`feather mask blur`), và IP-Adapter FaceID Plus v2.
- ✅ **Giọng nói đồng nhất 95-100%:** Tích hợp Text-to-Speech đa vùng miền (Bắc / Nam) và LivePortrait / Wav2Lip đồng bộ khẩu hình môi theo giọng nói.
- ✅ **Làm sản phẩm đa ngành nghề:** Nạp sẵn 10+ ngành nghề lớn (Nông nghiệp, Mỹ phẩm, Thời trang, Gia dụng, Phụ kiện, Decor, Kiến trúc, Xây dựng, Ô tô...).
- ✅ **Giao diện 2 chế độ:**
  - **Phiên bản Ver3 : PC:** Bàn dựng phân cảnh 4 cột, Sidebar 6 slot sản phẩm, thanh công cụ NLE timeline chuyên nghiệp.
  - **Phiên bản Ver1 : Mobile:** Tối ưu tỉ lệ màn hình smartphone với 3 tab: Cài Đặt (⚙️), Phân Cảnh (📑), Dựng Phim (🎬).

---

## 2. KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

```text
nexus-video-pro/
├── .github/workflows/ci-build.yml       # GitHub Actions CI tự động kiểm tra code & build
├── apps/
│   ├── web/                             # Next.js 15 App Router + React 19 + Tailwind v4 + Zustand
│   │   ├── src/app/                     # Dashboard & NLE Studio Page (/editor/[projectId])
│   │   ├── src/components/timeline/     # Multi-track Ruler, Tracks, Clips, Playhead, Snapping
│   │   ├── src/components/viewport/     # Canvas 2D/WebGL2 player, Safe Area Guides
│   │   ├── src/components/panels/       # MediaBin, Inspector, Effects, Audio Mixer, Subtitles
│   │   ├── src/components/ai-modal/     # FaceSwap, I2V, ConsistentFace, Inpainting, Export
│   │   ├── src/hooks/                   # useTimelineShortcuts, useWebCodecs, useAudioEngine
│   │   ├── src/stores/                  # useEditorStore (Zustand + Immer + Temporal History)
│   │   ├── src/lib/                     # Math SMPTE, WebGL Shaders, LUT .cube Parser, FFmpeg
│   │   └── src/types/                   # Timeline JSON Schema (Clips, Keyframes, Tracks)
│   ├── server/                          # Fastify REST/WebSocket Server + BullMQ + Fluent-FFmpeg
│   │   ├── src/routes/                  # /api/projects, /api/render, /api/storage, /api/ai
│   │   ├── src/services/                # StorageService (S3/MinIO), RenderService, ProjectService
│   │   └── src/queues/                  # BullMQ renderQueue & aiTaskDispatcher
│   └── ai-engine/                       # Python FastAPI Inference Gateway (CUDA Accelerated)
│       ├── adapters/                    # FalAIClient (Wan 2.1, Kling), ReplicateClient, RunPod
│       ├── pipelines/                   # face_swap.py, i2v_runner.py, consistent_face.py, sam2_inpainting.py
│       └── main.py                      # FastAPI microservice
├── docker/                              # Multi-stage Dockerfiles & docker-compose.yml
├── .env.example
├── LICENSE                              # MIT License
└── README.md
```

---

## 3. PHÍM TẮT DỰNG PHIM CHUẨN NLE (KEYBOARD SHORTCUTS)

| Phím tắt | Chức năng | Mô tả chi tiết |
| :--- | :--- | :--- |
| `Space` | **Play / Pause** | Phát hoặc dừng phát video trên timeline |
| `V` | **Selection Tool** | Chế độ con trỏ chọn và di chuyển clip |
| `C` | **Razor / Cut Tool** | Cắt lát clip tại vị trí con trỏ playhead |
| `Delete` / `Backspace` | **Delete Clip** | Xóa clip đang chọn |
| `Shift + Delete` | **Ripple Delete** | Xóa clip và tự động dồn các clip phía sau sang trái |
| `J` / `K` / `L` | **Shuttle Playback** | Tua lùi (J), Dừng (K), Tua tiến (L) |
| `I` / `O` | **Mark In / Mark Out** | Đặt điểm bắt đầu (In) và điểm kết thúc (Out) |
| `Ctrl + Z` / `Cmd + Z` | **Undo** | Hoàn tác thao tác vừa thực hiện |
| `Ctrl + Shift + Z` | **Redo** | Làm lại thao tác vừa hoàn tác |

---

## 4. HƯỚNG DẪN KHỞI CHẠY (QUICK START)

### Cách 1: Chạy Ứng Dụng Web Trực Tiếp (Vite / Next.js)

```bash
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Khởi chạy máy chủ phát triển
npm run dev
# Truy cập: http://localhost:3000
```

### Cách 2: Khởi Chạy Toàn Bộ Cụm Dịch Vụ Bằng Docker Compose

```bash
# Di chuyển vào thư mục docker và chạy docker-compose
cd docker
docker compose up -d --build

# Các cổng dịch vụ mở tự động:
# - Web Studio:     http://localhost:3000
# - Fastify API:    http://localhost:8000
# - Python AI API:  http://localhost:8001
# - MinIO S3 UI:    http://localhost:9001 (User: minioadmin / Pass: minioadmin)
# - Redis:          localhost:6379
```

---

## 5. THÔNG TIN BẢN QUYỀN & QUẢN TRỊ VIÊN

- **Tài khoản Quản trị Super Admin:** `thaytiensy@gmail.com`
- **Mật khẩu mặc định:** `12345678`
- **Quyền hạn:** `ADMIN` · **Gói:** `PRO UNLIMITED` · **Quota:** `9999 video/tháng`
- **Hotline hỗ trợ:** `0988-658-050`
- **Giấy phép phần mềm:** MIT License.
