# Hướng dẫn kết nối form "Gửi yêu cầu trao đổi" với Google Sheet + email

Thời gian: khoảng 5 phút. Dùng tài khoản **Ceo.cmac@gmail.com**.

## Bước 1 – Tạo Google Sheet
1. Mở trình duyệt, đăng nhập **Ceo.cmac@gmail.com**.
2. Vào https://sheets.new để tạo bảng tính mới.
3. Đặt tên: **CMAC – Yêu cầu tư vấn từ website**.

## Bước 2 – Dán mã Apps Script
1. Trong Google Sheet vừa tạo: menu **Tiện ích mở rộng (Extensions) → Apps Script**.
2. Xoá hết nội dung có sẵn trong file `Code.gs`.
3. Mở file `apps-script/Code.gs` trong thư mục website này, sao chép **toàn bộ** và dán vào.
4. Bấm biểu tượng **Lưu** (💾).

## Bước 3 – Chạy thử và cấp quyền
1. Ở thanh trên cùng, chọn hàm **setup** rồi bấm **Chạy (Run)**.
2. Google hỏi cấp quyền: **Xem xét quyền → chọn Ceo.cmac@gmail.com**.
3. Nếu hiện "Google chưa xác minh ứng dụng này": bấm **Nâng cao (Advanced) → Đi tới … (không an toàn)**. Đây là mã của chính CMAC nên an toàn.
4. Bấm **Cho phép (Allow)**. Quay lại Google Sheet sẽ thấy trang tính **"Yêu cầu tư vấn"** có sẵn tiêu đề cột.

## Bước 4 – Triển khai thành Web App
1. Trong Apps Script: **Triển khai (Deploy) → Tùy chọn triển khai mới (New deployment)**.
2. Bấm biểu tượng bánh răng ⚙ → chọn **Ứng dụng web (Web app)**.
3. Điền:
   - **Mô tả:** Form website CMAC
   - **Thực thi dưới dạng (Execute as):** **Tôi (Ceo.cmac@gmail.com)**
   - **Người có quyền truy cập (Who has access):** **Bất kỳ ai (Anyone)**
4. Bấm **Triển khai (Deploy)**, rồi **sao chép URL Web App** (dạng `https://script.google.com/macros/s/…/exec`).
5. Gửi URL này cho Claude để gắn vào website.

## Sau khi hoạt động
- Mỗi yêu cầu mới: một dòng trong Sheet + một email về Ceo.cmac@gmail.com (tiêu đề bắt đầu bằng `[CMAC Website]`).
- Cột **Trạng thái** mặc định "Mới". Anh cập nhật "Đã liên hệ", "Đã báo giá"… để theo dõi khách.
- Có thể chia sẻ Sheet cho tanquangaac@gmail.com hoặc nhân sự CMAC để cùng theo dõi.
- Giới hạn của Gmail miễn phí: khoảng 100 email báo mỗi ngày, quá đủ cho website công ty.

## Khi sửa mã Apps Script về sau
**Triển khai → Quản lý các bản triển khai → ✏ Chỉnh sửa → Phiên bản: Phiên bản mới → Triển khai.** Làm như vậy URL giữ nguyên, không cần sửa website.
