# Trạm Cứu Hộ Marketing — AI Content Automation

MVP Google Apps Script: tạo kế hoạch 3 bài/ngày → viết caption → tạo ảnh Drive riêng tư → quản trị duyệt trên Sheets → đăng ảnh và caption lên Facebook → ghi kết quả. Mặc định **DRY_RUN=true**. Không có credentials trong repository. Chưa triển khai lên tài khoản Google/Meta; kiểm thử cục bộ dùng mocks, không xác nhận tích hợp live.

## Bắt đầu

1. Tạo Google Sheet mới, đặt chế độ chia sẻ **Restricted**. Vào Extensions → Apps Script (dự án gắn với Sheet).
2. Trong Apps Script, tạo các file theo `src/`, chép nội dung tương ứng. File `.js` có thể đặt tên `.gs` trong editor. Bật “Show appsscript.json manifest file” ở Project Settings và chép manifest.
3. Project Settings → Script Properties: nhập các tên/giá trị trong `config.example.json`. Nhập khóa trực tiếp tại đây; **không gửi khóa qua chat, không commit khóa**. Để `DRY_RUN=true`.
4. Chạy `setup()` bằng tài khoản chủ sở hữu, cấp các quyền Google được yêu cầu. Script tạo Content, Dashboard, Logs, Sources và thư mục ảnh. `SPREADSHEET_ID`, `DRIVE_FOLDER_ID` tự được lưu trong Script Properties.
5. Reload Sheet. Menu **Trạm Cứu Hộ Marketing** xuất hiện. Chạy `installTriggers()` đúng một lần từ tài khoản chủ sở hữu. Không cài trigger dưới nhiều tài khoản.
6. Chạy `tick()` vài lần hoặc chờ trigger để kiểm tra quy trình. Mỗi lượt xử lý một giai đoạn: tạo 3 ý tưởng, viết một bài, tạo một ảnh. Để mặc định chuẩn bị bài cho **ngày mai**.
7. Chọn hàng rồi dùng menu **Xem ảnh hàng chọn** để xem ảnh riêng tư trong sidebar, hoặc mở Link ảnh trong Drive. Đọc và sửa caption, hashtag, ngày giờ nếu cần. Chọn **Đã duyệt** tại cột L sau khi hoàn tất. Chờ on-edit trigger ghi dấu duyệt cột U. Không chỉnh các cột kỹ thuật.
8. Hoàn thành [kiểm thử triển khai](docs/DEPLOYMENT.md), rồi chuyển `DRY_RUN=false` khi sẵn sàng đăng thật. Bài đã duyệt và đến hạn sẽ được đăng; bài cũ quá cửa sổ 120 phút phải đổi lịch và duyệt lại.

## Quản trị hàng ngày

| Thao tác | Cách thực hiện |
| --- | --- |
| Duyệt | Chọn `Đã duyệt` trong cột L; cần giai đoạn READY và có ảnh |
| Từ chối | Chọn `Từ chối` trong cột L |
| Viết lại | Ghi yêu cầu vào M, chọn `Viết lại` tại X; ảnh cũng sẽ được tạo lại |
| Tạo lại ảnh | Sửa prompt I hoặc ghi yêu cầu vào prompt, chọn `Tạo lại ảnh` tại X |
| Thử lại lỗi tạo nội dung/ảnh | Chọn `Thử lại` tại X; chạy lại giai đoạn lỗi, cần duyệt lại |
| Đổi giờ | Nhập B dạng `yyyy-MM-dd`, C dạng `HH:mm`, sau đó duyệt lại |
| Dừng đăng | Đặt `DRY_RUN=true`; `removeTriggers()` dừng toàn bộ lịch |
| Đăng lỗi/chưa rõ kết quả | Đối soát theo hướng dẫn; không xóa journal hoặc ID |

Định dạng caption đăng: tiêu đề + hai dòng trống + nội dung + hai dòng trống + hashtag. Nội dung phải được quản trị kiểm chứng trước khi duyệt, đặc biệt là hướng dẫn quảng cáo và xu hướng mới.

## Cấu hình

| Script Property | Ý nghĩa |
| --- | --- |
| OPENAI_API_KEY | Khóa project OpenAI có billing và quyền model |
| TEXT_MODEL | Mặc định `gpt-4.1-mini`; model phải hỗ trợ Responses + structured outputs |
| IMAGE_MODEL | Mặc định `gpt-image-1`; cần quyền tạo ảnh, có thể cần xác minh tổ chức |
| META_GRAPH_VERSION | Bắt buộc khi LIVE, dạng `vXX.X`; chọn phiên bản được hỗ trợ từ Meta dashboard |
| META_PAGE_ID / META_PAGE_TOKEN | ID Page và Page Access Token đúng Page |
| DRY_RUN | Chỉ đúng chuỗi `false` mới bật đăng thật; thiếu giá trị mặc định chạy thử |
| PREPARE_DAYS_AHEAD | Mặc định 1, giá trị 0–7 |
| MAX_LATENESS_MINUTES | Mặc định 120; tránh đăng dồn bài quá hạn |
| ADMIN_EMAIL | Tùy chọn, nhận email khi bài sẵn sàng duyệt |
| BRAND_COLORS | Màu dùng trong prompt ảnh |
| TOKEN_REVIEW_DATE | Ngày nhắc kiểm tra token, dạng yyyy-MM-dd |

Không import trực tiếp file cấu hình mẫu vào code. Giá trị placeholder phải được thay trong Script Properties.

## Cấu trúc

```text
src/Core.js        Dữ liệu, khóa, hash duyệt, lịch GMT+7, log
src/Setup.js       Tạo CMS, dashboard, menu và trigger
src/OpenAI.js      Ý tưởng, caption JSON schema, tạo ảnh và Drive
src/Approval.js    Duyệt trực tiếp, hủy duyệt khi thay đổi, lệnh chỉnh sửa
src/Publisher.js   Meta publisher, journal trước gửi, receipt và đối soát
src/Scheduler.js   Bộ điều phối từng bước, backoff và email
tests/            Kiểm thử offline bằng Node.js
docs/             Kiến trúc, triển khai, kiểm thử và vận hành
```

## Phát triển và GitHub

Node.js 24+. Chạy `npm test` (không cần cài dependency để test). CI GitHub chạy cùng bộ tests. Clasp là công cụ triển khai tùy chọn:

```powershell
npm install
npx clasp login
Copy-Item .clasp.example.json .clasp.json
# Sửa scriptId bằng ID của bound script tại Project Settings
npx clasp push
```

Không dùng `clasp create` để thay thế bound script nếu muốn menu xuất hiện trên Sheet. `clasp push` ghi đè mã remote, hãy dùng với dự án mới dành cho hệ thống này.

Nếu chưa có remote repository, tạo repo **private** tên `tram-cuu-ho-marketing-automation` trên tài khoản `businessenglishwithannie-rgb`, không chọn README khởi tạo. Trong thư mục dự án:

```powershell
git remote add origin https://github.com/businessenglishwithannie-rgb/tram-cuu-ho-marketing-automation.git
git push -u origin main
```

Git sẽ yêu cầu đăng nhập qua cơ chế của máy bạn; không đưa token vào URL. Các Script Properties không nằm trong Git. Xem thêm [kiến trúc và giới hạn](docs/ARCHITECTURE.md) trước khi vận hành dài hạn.

## Tài liệu chính thức

Tích hợp OpenAI dựa trên [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) và [Image generation](https://developers.openai.com/api/docs/guides/image-generation). Scheduler cần tuân thủ [quota Apps Script](https://developers.google.com/apps-script/guides/services/quotas); trigger không đảm bảo chạy chính xác từng giây. Các model cấu hình là mặc định có thể thay đổi theo quyền tài khoản, không phải tuyên bố model mới nhất.

Đối chiếu [Meta Pages posts](https://developers.facebook.com/docs/pages-api/posts/), [Getting started](https://developers.facebook.com/docs/pages-api/getting-started/) và [long-lived tokens](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived/) trong Meta dashboard trước khi bật LIVE. Meta trả HTTP 429 khi truy cập tài liệu từ môi trường phát triển lần này; quyền và phiên bản thực tế cần xác minh khi triển khai.
