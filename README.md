# CMAC – Website công ty

Website giới thiệu **Công ty TNHH Tư vấn Quản trị và Kế toán Miền Trung (CMAC)** – Đối tác Tài chính & Quản trị cho tăng trưởng bền vững.

> Vững Tài chính. Mạnh Tương Lai. · Strong Finances. Stronger Future.

## Cấu trúc

```
index.html          Trang chủ (HTML + CSS + JS thuần)
kien-thuc/, tin-tuc/  Trang Kiến thức, Tin tức (tạo bởi tools/build-pages.js từ content/)
content/            Nội dung bài viết (mỗi bài 1 file HTML có khối JSON ở đầu)
tools/              build-pages.js (tạo trang), serve.js (xem thử trên máy)
assets/
  cmac-logo.png     Logo lockup chính thức (nền trong suốt)
  cmac-mark.png     Biểu tượng núi M–A (favicon)
  ceo.jpg           Ảnh chân dung Tổng Giám đốc
.nojekyll           Tắt Jekyll trên GitHub Pages
```

## Xem trên máy

Mở `index.html` bằng trình duyệt.

## Nhận diện thương hiệu

Theo *CMAC Brand Guideline 2026*: Đồng Cổ `#8C654A`, Navy `#1B2A41`, Sô-cô-la `#2A1F1A`, Kem Ngà `#F5F1EC`; font Montserrat (tiêu đề) và Inter (nội dung). Logo đồng chỉ đặt trên nền sáng.

## Tên miền

Website chạy tại **https://cmac.vn** (GitHub Pages, file `CNAME`). DNS quản lý tại Vinahost: 4 bản ghi A trỏ `185.199.108-111.153`, CNAME `www` → `cmacvn.github.io`, TXT xác minh `_github-pages-challenge-cmacvn`.

---
© 2026 CMAC Co., Ltd. · MSDN 4001340408 · 814 Trần Hưng Đạo, P. Điện Bàn Đông, TP. Đà Nẵng
