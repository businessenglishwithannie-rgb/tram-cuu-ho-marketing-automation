# Kết quả kiểm thử bàn giao

Ngày: 31/10/2026. Môi trường: Windows, Node.js 24.22.1. Chạy:

```powershell
node --test --test-isolation=none tests/*.test.cjs
```

Kết quả: **21/21 passed**, không gọi mạng, không dùng credentials, không đăng Facebook. Có thêm kiểm tra phục hồi publishing intent khi execution bị ngắt đột ngột.

Các ca kiểm tra: cú pháp toàn bộ module, GMT+7, ngày/giờ không hợp lệ, chưa duyệt/từ chối/lỗi/quá hạn/tương lai, nội dung đổi sau duyệt, dry run, dấu duyệt bền vững, đăng thành công, trigger lặp, journal ghi trước network, timeout UNKNOWN, Sheets outage sau receipt, reread snapshot, rewrite, chặn thử lại không an toàn, che secrets, formula injection, backoff, ảnh đổi byte, on-edit approve/invalidate, khôi phục kế hoạch append dở, chặn publish khi có lệnh viết lại, Responses JSON schema và retry 429/401.

Các kiểm tra chưa thực hiện do chưa có môi trường/credentials: setup trên Google thật, quota thực tế, Google on-edit/time trigger thật, tạo ảnh thật, quyền/phiên bản Meta thực tế, đăng lên Page thử nghiệm và CI GitHub. Chỉ bật LIVE sau nghiệm thu theo DEPLOYMENT.md.

Node test runner bị chặn spawn tiến trình con trong sandbox ở lần chạy mặc định; dùng `--test-isolation=none` để chạy test trong cùng tiến trình. Máy hiện tại không có npm trong PATH; bộ test không cần npm. Nếu đã cài đầy đủ Node/npm, `npm test` chạy cùng lệnh.
