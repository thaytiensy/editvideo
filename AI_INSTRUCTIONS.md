# Các quy tắc phát triển và vận hành dự án (AI Instructions)

Tài liệu này ghi lại các quy tắc đã được thống nhất để AI hoặc các nhà phát triển sau này tuân thủ khi chỉnh sửa dự án.
Tôi đang triển khai ứng dụng từ github qua vercel, hãy kiểm tra giúp tôi các file vercel.json, index.html có tham chiếu đúng chưa và hướng dẫn tôi setup api key gemini để người dùng tự nhập API key của họ để chạy app

## 1. Cấu hình Model AI & Cơ chế Fallback
- **Model mặc định**: `gemini-3-pro-preview`
- **Model dự phòng**: Tự động chuyển đổi nếu model hiện tại gặp lỗi/quá tải:
  1. `gemini-3-flash-preview`
  2. `gemini-3-pro-preview`
  3. `gemini-2.5-flash`
- **Cơ chế Retry**:
  - Nếu một bước xử lý (Step 1, 2, hoặc 3) gặp lỗi API, hệ thống **tự động** thử lại ngay lập tức với model tiếp theo trong danh sách.
  - Vẫn giữ nguyên kết quả của các bước trước đó, chỉ retry bước đang lỗi.

## 2. Quản lý API Key
- **Cơ chế**:
  - Người dùng nhập API key vào Modal hoặc qua nút Settings trên Header.
  - Lưu vào `localStorage` của trình duyệt.
  - Ưu tiên sử dụng key từ `localStorage`.
- **Giao diện**:
  - **Thiết lập Model & API Key**: Cần hiển thị như hình mẫu.
    - Hiển thị danh sách chọn Model AI (dạng thẻ/Cards).
    - Thứ tự hiển thị: `gemini-3-flash-preview` (Default), `gemini-3-pro-preview`, `gemini-2.5-flash`.
  - Nút **Settings (API Key)** kèm dòng chữ màu đỏ "Lấy API key để sử dụng app" phải luôn hiển thị trên Header để người dùng dễ dàng thay đổi key khi hết quota. 
  - Khi chưa có key, hiển thị Modal bắt buộc nhập.
  - Việc nhập key ban đầu trước khi dùng app, hướng dẫn người dùng vào https://aistudio.google.com/api-keys để lấy key API

## 3. Quản lý Trạng thái & Lỗi (State Management)
- **Hiển thị lỗi**:
  - Nếu tất cả các model đều thất bại -> Hiện thông báo lỗi màu đỏ, hiển thị nguyên văn lỗi từ API (VD: `429 RESOURCE_EXHAUSTED`).
  - Trạng thái các cột đang chờ phải chuyển thành **"Đã dừng do lỗi"**, tuyệt đối không được hiện "Hoàn tất" hoặc checkmark xanh nếu quy trình bị gián đoạn.
- **Tiến trình**:
  - Progress bar chỉ hiển thị trạng thái hoàn thành (xanh) khi bước đó thực sự thành công.

## 4. Triển khai (Deployment)
- **Nền tảng**: Vercel.
- **File bắt buộc**: `vercel.json` ở root để xử lý SPA routing.
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

## 5. Quy Định Tự Động Đưa Lên GitHub & Triển Khai Vercel (Auto Deploy & Self-Healing)
- **LỆNH BẮT BUỘC GHI NHỚ**: Sau khi tạo app hoặc hoàn thiện chỉnh sửa bất kỳ tính năng nào:
  1. **Tự động đưa lên GitHub**: Khởi tạo Git repository (nếu chưa có), commit toàn bộ mã nguồn với thông điệp rõ ràng, và tự động push lên remote repository trên GitHub.
  2. **Triển khai lên Vercel**: Tự động liên kết và kích hoạt deploy lên Vercel.
  3. **Tự Động Sửa Lỗi (Self-Healing)**: Nếu gặp bất kỳ lỗi nào trong quá trình build, routing, export/import, hoặc deployment trên Vercel:
     - Tự động phân tích nguyên nhân lỗi (compile, type check, missing packages, syntax).
     - Tự động sửa chữa dứt điểm toàn bộ các lỗi phát sinh.
     - Kiểm tra và đảm bảo ứng dụng chạy thật 100% trước khi hoàn tất.
- **Tài khoản Admin Quản Trị**:
  - Super Admin: `thaytiensy@gmail.com`
  - Mật khẩu mặc định: `12345678` (Admin có thể đổi mật khẩu sau khi đăng nhập).
  - Quyền hạn: `PRO UNLIMITED` (9,999 video/tháng).
- **Cơ chế chia sẻ**:
  - Quản trị qua Gmail, chia sẻ quyền truy cập bằng cách thêm Gmail của người nhận. Mật khẩu cấp: `12345678`.
  - Không khóa key API đối với người dùng.

