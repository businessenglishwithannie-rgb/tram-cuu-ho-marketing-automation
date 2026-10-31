# Triển khai và kiểm thử từng bước

## 1. Chuẩn bị Google và OpenAI

- Dùng Google Sheet/dự án Apps Script mới, chủ sở hữu là tài khoản vận hành lâu dài. Bật MFA tài khoản. Không public Sheet hoặc thư mục Drive.
- Tạo project OpenAI với billing, API key riêng và giới hạn ngân sách theo nhu cầu. Nhập key vào Script Properties. ChatGPT subscription không thay thế quyền truy cập/billing API.
- TEXT_MODEL phải hỗ trợ Responses + JSON schema; IMAGE_MODEL phải hỗ trợ Images generations + b64_json, size 1024x1024, quality low. Mặc định là gpt-4.1-mini và gpt-image-1; thay nếu tài khoản không có quyền/model ngừng hỗ trợ.
- Chạy setup; xem SPREADSHEET_ID/DRIVE_FOLDER_ID đã tạo. Không có token nào được ghi ra log.
- Điền Sources nếu muốn bài về xu hướng hoặc case study có thật. Ô A là nội dung đã kiểm chứng, B là URL chính thức. URL đơn lẻ không làm AI tự đọc trang.
- ADMIN_EMAIL chỉ nhập khi muốn gửi thông báo. Không thiết lập sẽ không gửi mail.

## 2. Cấu hình Meta

1. Dùng tài khoản có quyền quản lý nội dung Page **Trạm Cứu Hộ Marketing**. Tạo/chọn Meta developer app có use case Pages phù hợp.
2. Đối chiếu quyền `pages_show_list`, `pages_read_engagement`, `pages_manage_posts` và yêu cầu tác vụ Page trong tài liệu hiện hành. App Review, Advanced Access, business verification và app Live mode có thể cần tùy vai trò/tài khoản/người dùng. App Development chỉ dùng đối tượng được Meta cho phép, không coi là triển khai production.
3. Qua flow Facebook Login/Graph API Explorer chính thức lấy user token với quyền cần thiết; thực hiện exchange sang long-lived user token theo quy trình Meta, rồi lấy **Page Access Token** cho đúng Page qua `/me/accounts`. Không dùng user token thay Page token.
4. Nhập META_PAGE_ID và META_PAGE_TOKEN vào Script Properties. Chọn META_GRAPH_VERSION từ phiên bản được hỗ trợ trong dashboard; không để giá trị placeholder. Chạy `checkConnections()` với DRY_RUN=false chỉ khi đã sẵn sàng kiểm tra GET tới Meta; hàm này không đăng bài.
5. Kiểm tra token bằng Access Token Debugger chính thức: đúng app, Page, scopes, thời hạn/data access expiration. Không đăng token vào chat hoặc issue.
6. Token có thể bị thu hồi do đổi mật khẩu, mất quyền Page, thay đổi app hoặc hết data access. Không có flow refresh-token chung như OAuth refresh token cho mọi Page token. Khi cần, đăng nhập/ủy quyền lại qua flow Meta hỗ trợ, lấy Page token mới và thay Script Property; chạy lại kiểm tra. Không cam kết token tồn tại vĩnh viễn.
7. Đặt TOKEN_REVIEW_DATE để nhận nhắc hàng ngày tới ADMIN_EMAIL khi đến hạn; kiểm tra sớm nếu publisher báo lỗi token. Không lưu app secret trong mã nguồn.

## 3. Kiểm thử offline

```powershell
npm test
```

Tests dùng Node VM và mocks, không gọi OpenAI/Google/Meta, không cần credentials. Kiểm tra lịch GMT+7, chặn chưa duyệt, hash sau chỉnh sửa, DRY_RUN, dấu duyệt trong Properties, receipt, timeout UNKNOWN, đọc lại hàng mới, rewrite, backoff, redaction và formula injection. Không thay thế kiểm thử API thật.

## 4. Nghiệm thu trên Google ở DRY_RUN

1. Giữ DRY_RUN=true; chạy `setup()` hai lần để xác nhận không tạo thêm Sheet/thư mục, không mất dữ liệu.
2. Chạy `installTriggers()` bằng owner. Mở trang Triggers kiểm tra chỉ một tick và một approvalEdit thuộc owner. Múi giờ manifest và spreadsheet đều GMT+7.
3. Chạy tick lần đầu: có đúng ba hàng ngày mai tại 08:00, 12:00, 19:30. Chạy lại nhiều lần không thêm bản sao ID.
4. Chạy các tick tiếp theo đến khi ba hàng READY. Kiểm tra caption 150–350 từ, ảnh Drive mở được, Link ảnh riêng tư, trạng thái Chờ duyệt. API thật có phát sinh chi phí dù không đăng Facebook.
5. Đặt một bài về thời điểm hiện tại GMT+7 (không quá cửa sổ trễ), giữ Chờ duyệt; chạy tick, không có log DRY_RUN cho bài đó.
6. Chọn Đã duyệt; chờ dấu duyệt U. Chạy tick: có log DRY_RUN, không có post ID, không chuyển Đã đăng, Page không có bài mới.
7. Sửa caption/ảnh/lịch sau duyệt: dấu duyệt bị hủy hoặc không khớp nên không đủ điều kiện. Duyệt lại sau khi sửa xong.
8. Chọn Từ chối: không đăng. Thử lệnh Viết lại/Tạo lại ảnh: quy trình quay lại Chờ duyệt, không dùng phê duyệt cũ.
9. Đặt giờ tương lai hoặc quá hạn 120 phút: không xử lý đăng. Thử lỗi khóa OpenAI giả ở DRY_RUN trên dự án test: ghi lỗi, backoff, dừng sau ba lần; khôi phục key rồi dùng Thử lại.
10. Dashboard tổng số và lịch bảy ngày khớp dữ liệu. Nếu không có quyền on-edit trigger, chưa có dấu duyệt nên publisher tiếp tục chặn.

## 5. Nghiệm thu đăng thật có kiểm soát

1. Dùng Page thử nghiệm hoặc một bài đã được chủ Page duyệt rõ ràng; xác minh không có bài cũ khác đang Đã duyệt và đến hạn. Dừng trigger trong lúc cấu hình nếu cần.
2. Cấu hình Meta, chạy checkConnections. Hàm chỉ kiểm tra GET Page và text model, không chứng minh được permission đăng hoặc model ảnh. Kiểm tra thực tế ở bước kế tiếp.
3. Duyệt đúng một hàng READY và đặt giờ gần hiện tại. Đặt DRY_RUN=false, chạy tick.
4. Xác minh Page có đúng một bài với ảnh/caption đã duyệt; Sheet lưu post ID, URL, thời gian thực tế, Đã đăng. Chạy tick nhiều lần không thêm bài.
5. Nếu lỗi UNKNOWN/INTENT, dừng thử lại, xem Page và Meta activity. Áp dụng mục đối soát. Không cố tình tạo timeout trên Page production.
6. Sau nghiệm thu, cài trigger và theo dõi Executions, Logs và token trong vài ngày đầu. Tạo bài cho ngày mai để đủ thời gian duyệt trước 08:00.

## 6. Đối soát khi Meta trả kết quả chưa rõ

Script Properties `publish:<ID>` chứa INTENT/UNKNOWN hoặc DONE. DONE là receipt thành công; script tự phục hồi Sheet. Không xóa receipt để thử lại.

- Nếu thấy bài trên Page: lấy full post ID dạng `PAGEID_POSTID`. Trong Apps Script tạo một hàm tạm gọi `reconcilePublished('ID_BAI','PAGEID_POSTID')`, chạy thủ công rồi xóa hàm tạm. Script kiểm tra Page prefix và caption từ Meta trước khi ghi receipt. Nếu caption trên Facebook đã chỉnh, cần kiểm tra thủ công sâu hơn; không xóa journal vì so sánh không khớp.
- Nếu đã kiểm tra Page, Meta activity và xác nhận không có bài: tạo hàm tạm gọi `confirmNotPublished('ID_BAI','DA_KIEM_TRA_META_KHONG_CO_BAI')`. Hàm bỏ chặn, hủy duyệt; đổi lịch và duyệt lại trước khi thử. Xác nhận này phải do quản trị thực hiện sau đối soát; hệ thống không tự chứng minh bài không tồn tại.
- Nếu không thể kết luận, giữ journal nguyên trạng và liên hệ người có quyền Meta. Không có auto retry cho Meta POST, kể cả HTTP error rõ ràng, để ưu tiên tránh bản sao.

## 7. Sao lưu và khôi phục

Sao lưu Sheet, ảnh Drive và Script Properties bằng quy trình nội bộ có kiểm soát truy cập. Properties chứa secrets, không commit bản export. Dùng journal đã backup để khôi phục, không chỉ copy Sheet sang script khác rồi bật LIVE. Dừng trigger cũ trước khi chuyển dự án. Làm mới key/token nếu nghi bị lộ. Không public logs chứa thông tin vận hành.
