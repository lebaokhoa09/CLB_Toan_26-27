# Mở Kỳ Thư Đại Hải khi không có Internet

Tải dự án và chạy thử **trước buổi trình chiếu, khi vẫn còn mạng**. GitHub cũng cần Internet để tải; sau khi đã tải đầy đủ, trình chiếu trên máy không cần kết nối mạng.

## Windows 10/11 64-bit

1. Trên trang GitHub của dự án, chọn **Code → Download ZIP**.
2. Bấm chuột phải vào file ZIP → **Extract All / Giải nén tất cả**. Chờ giải nén xong; không chạy trực tiếp bên trong file ZIP.
3. Mở thư mục đã giải nén, bấm đúp **OPEN.cmd**. File **MO-TRO-CHOI.cmd** cũng mở cùng bản này.
4. Trình duyệt mặc định sẽ mở trang local. Nếu không tự mở, sao chép địa chỉ `http://127.0.0.1:.../` được in trong cửa sổ vào Chrome hoặc Edge.
5. Bấm **Bắt đầu trình chiếu**; nhấn **F11** để toàn màn hình. Màn đen 5 giây đầu là chủ ý.
6. Giữ cửa sổ mở local trong suốt buổi chiếu. Khi xong, đóng cửa sổ đó hoặc nhấn **Ctrl+C**.

Bản tải đầy đủ có sẵn Node.js portable trong `runtime/win-x64/`, không cần cài Node.js, không cần `npm install`, không cần quyền quản trị. Giữ nguyên toàn bộ thư mục dự án. Bộ chạy kèm dành cho Windows x64.

Máy chủ chỉ nghe tại `127.0.0.1`, phục vụ trình duyệt trên chính máy đang mở. Mặc định dùng cổng 54824; nếu cổng này đang bận, chương trình tự chọn cổng trống và in địa chỉ thực tế.

## Phím sử dụng

| Phím | Chức năng |
| --- | --- |
| A, B, C, D hoặc 1–4 | Chọn đáp án |
| Enter | Tiếp tục sau khi đã trả lời |
| Backspace | Xóa đáp án; bấm thêm lần nữa để về câu trước chưa trả lời. Khi tàu chạy, quay lại câu vừa rời |
| Space | Tạm dừng / đi tiếp khi tàu đang chạy |
| M | Tắt / bật toàn bộ âm thanh |
| F11 | Toàn màn hình trình duyệt |
| Home | Từ màn kết về trang đầu |

## Kiểm tra trước buổi chiếu

- Tải và giải nén trên máy sẽ trình chiếu, hoặc chép toàn bộ thư mục qua USB.
- Tắt Wi-Fi / ngắt mạng thử, mở `OPEN.cmd`, kiểm tra hình, nhạc và ít nhất một câu hỏi.
- Giữ nguyên `dist/`, `runtime/`, `serve.mjs` và các file mở nhanh. Nhạc, tiếng nước, gỗ, hải âu, video Full HD, font và thư viện đều nằm trong dự án.
- Hải âu lặp qua các cảnh hành trình, dừng ở câu hỏi; nhạc nền giảm nhỏ trong phần câu hỏi.

## Nếu chưa mở được

- **Thiếu file / thiếu bộ chạy:** giải nén lại toàn bộ bản tải đầy đủ, không chỉ lấy riêng `OPEN.cmd`.
- **Trình duyệt không tự mở:** dùng địa chỉ local được in trong cửa sổ. Không mở trực tiếp `dist/index.html`.
- **Không có tiếng:** bấm Bắt đầu, kiểm tra loa / âm lượng Windows và phím M; nhạc chỉ phát khi màn mở đầu hiện lên.
- **Mở ra tiến độ cũ:** tiến độ lưu trong trình duyệt; chọn bắt đầu lại trên trang đầu nếu cần trình chiếu mới.
- **Máy dùng macOS/Linux:** cài sẵn Node.js 22 trở lên, mở Terminal tại thư mục dự án và chạy `node serve.mjs 54824`, rồi mở địa chỉ được in ra. Bộ chạy Windows đi kèm không dùng trên macOS/Linux.

## Nguồn âm thanh và thư viện

Giữ nguyên thông tin ghi công trong `ASSET-SOURCES.md`, `dist/music-credits.html` và các file giấy phép đi kèm. Thông tin bộ chạy Node.js nằm ở `runtime/README.md` và `runtime/win-x64/LICENSE`.
