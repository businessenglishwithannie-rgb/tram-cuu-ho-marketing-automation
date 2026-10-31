# Kết quả kiểm thử bàn giao

Ngày: 31/10/2026. Môi trường: Windows, Node.js 24.22.1. Chạy:

```powershell
node --test --test-isolation=none tests/*.test.cjs
```

Kết quả offline cập nhật: **22/22 passed**, không gọi mạng, không dùng credentials, không đăng Facebook. Có thêm kiểm tra phục hồi publishing intent khi execution bị ngắt đột ngột và dừng retry ngay khi OpenAI báo hết quota.

Các ca kiểm tra: cú pháp toàn bộ module, GMT+7, ngày/giờ không hợp lệ, chưa duyệt/từ chối/lỗi/quá hạn/tương lai, nội dung đổi sau duyệt, dry run, dấu duyệt bền vững, đăng thành công, trigger lặp, journal ghi trước network, timeout UNKNOWN, Sheets outage sau receipt, reread snapshot, rewrite, chặn thử lại không an toàn, che secrets, formula injection, backoff, ảnh đổi byte, on-edit approve/invalidate, khôi phục kế hoạch append dở, chặn publish khi có lệnh viết lại, Responses JSON schema và retry 429/401.

Kiểm tra live ngày 31/10/2026: setup Google thành công; tạo Content, Dashboard, Logs, Sources và thư mục ảnh. GET OpenAI model thành công, nhưng Responses API trả HTTP 429 với code credit_balance_exhausted, type insufficient_quota. Chưa tạo được ý tưởng/ảnh. Dự án người dùng cung cấp là standalone nên onOpen không tạo được menu trong Sheet. Cần dự án bound nếu muốn menu/sidebar; backend standalone có thể dùng các cột trực tiếp sau khi cấu hình trigger. Chưa bật trigger và chưa cấu hình/kiểm thử Meta. Không đăng Facebook thật. CI GitHub chưa được xác minh.

Node test runner bị chặn spawn tiến trình con trong sandbox ở lần chạy mặc định; dùng `--test-isolation=none` để chạy test trong cùng tiến trình. Máy hiện tại không có npm trong PATH; bộ test không cần npm. Nếu đã cài đầy đủ Node/npm, `npm test` chạy cùng lệnh.
