# Antigravity Project Instructions & Workspace Rules

## 1. QUY TẮC CỐT LÕI (CORE RULES) - GHI NHỚ BẮT BUỘC
- **Tự Động Đưa Lên GitHub & Triển Khai Vercel**:
  - Sau khi tạo hoặc chỉnh sửa tính năng app, phải tự động đưa toàn bộ code lên GitHub repository và kích hoạt/triển khai lên Vercel.
  - Khi gặp bất kỳ lỗi nào trong quá trình build, routing, TypeScript, hoặc triển khai trên Vercel: **Tự động kiểm tra và sửa hết tất cả các lỗi** cho tới khi ứng dụng build thành công 100% mà không cần người dùng nhắc nhở.
- **Tài Khoản Quản Trị Hệ Thống**:
  - Super Admin: `thaytiensy@gmail.com`
  - Mật khẩu mặc định: `12345678`
  - Quyền hạn: `ADMIN` · Gói: `PRO` · Quota: `9999` video/tháng.
  - Sau khi đăng nhập, Admin có thể đổi mật khẩu tại trang Cài Đặt.
- **Cơ Chế Chia Sẻ Qua Gmail (Thay Thế API Key Khóa)**:
  - Chia sẻ quyền truy cập bằng cách thêm trực tiếp Gmail của người nhận (`TeamView.tsx`).
  - Mật khẩu mặc định cấp cho thành viên: `12345678`.
  - Mở trực tiếp trình soạn thư Gmail để gửi thông tin kích hoạt cho thành viên.
  - Không bắt buộc khóa key API (ứng dụng chạy thẳng không chặn người dùng).

## 2. TÍNH NĂNG ỨNG DỤNG (APP FEATURES)
- **Bỏ hết mẫu cố định**: Không dùng 80 template mock; người dùng tự do tải video và ảnh lên để xử lý.
- **Đổi Khuôn Mặt Trong Video Tự Động (Auto AI Face Tracking)**:
  - Tự động phát hiện khuôn mặt bằng `window.FaceDetector` hoặc Skin-Tone Centroid.
  - Bám đuổi khuôn mặt qua từng khung hình với bộ lọc EMA smoothing.
- **Tạo Video Từ Ảnh & Đổi Mặt (Image-To-Video AI Animator)**:
  - Nạp ảnh tĩnh chân dung và tạo video 30fps với 4 phong cách điện ảnh (Ken Burns 3D, Breathing Pulse, Parallax Zoom, Camera Pan).
  - Khóa và hòa trộn khuôn mặt ghép với radial feather mask.
- **Chạy Thật 100% Trong Trình Duyệt**:
  - Sử dụng HTML5 Canvas 2D + `canvas.captureStream(30)` + `MediaRecorder`.
  - Xuất file `.mp4` / `.webm` thật có thể xem trực tiếp và tải về máy.

## 3. TRIỂN KHAI VERCEL (DEPLOYMENT RULES)
- **SPA Routing**: Luôn duy trì `vercel.json` ở thư mục gốc:
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```
- **Build Command**: `vite build`
- **Output Directory**: `dist`
- **Tự động sửa lỗi**: Mọi lỗi thiếu export, sai kiểu TypeScript, thiếu package trong `package.json` hoặc sai cú pháp phải được sửa dứt điểm trước khi push.
