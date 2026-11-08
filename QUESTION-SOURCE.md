# Nguồn và biên tập bộ câu hỏi

## Lời giải được duyệt ngày 06/11/2026

- Người dùng duyệt bản lời giải mở rộng cho câu 1, 2, 6, 7, 8; yêu cầu bỏ câu cuối nói về các chữ số thập phân của pi ở câu 1. Năm câu còn lại dùng bản xem trước trước đó.
- Số 0 và quy tắc tính của Brahmagupta năm 628: https://mathshistory.st-andrews.ac.uk/HistTopics/Zero/ và https://mathshistory.st-andrews.ac.uk/Biographies/Brahmagupta/.
- Fibonacci, bài toán thỏ và Liber Abaci năm 1202: https://math.oxford.emory.edu/site/math125/fibonacciRabbits/.
- Các liên kết phục vụ đối chiếu nội dung, không chèn vào lời giải trên màn hình trình chiếu.

## Nguồn nội dung

- PDF do người dùng cung cấp: `C:/Users/Le Bao Khoa/Downloads/Câu_hỏi_cho_phần_trò_chơi.pdf`, 3 trang, tiêu đề trích xuất “Câu Hỏi Trò Chơi”, dòng đầu “Tài liệu CLB TOÁN 2026 Ngô Vĩnh Hưng”.
- Bản văn bản dùng để đối chiếu: `work/questions-pdf.txt`, đã trích xuất toàn bộ PDF.
- `dist/questions.js` giữ đủ 10 câu, toàn bộ phần dẫn chuyện có ý nghĩa và các phương án theo đúng thứ tự A–D. Phần dẫn chuyện ở `story`, yêu cầu trả lời ở `prompt`. Câu 8 không có dẫn chuyện trong nguồn nên `story` là chuỗi rỗng.

## Phần suy luận và bổ sung

PDF không cung cấp đáp án hay lời giải. Trường `correct` là đáp án do biên tập suy luận, đánh số từ 0; `explanation` là lời giải do biên tập viết. Các tiêu đề ngắn cũng do biên tập thêm, không phải tên câu hỏi trong PDF.

| Câu | Đáp án suy luận | `correct` | Căn cứ |
| --- | --- | --- | --- |
| 1 | B — Số pi (π) | 1 | 3,14159… và công thức hình tròn |
| 2 | B — Số 0 | 1 | Đáp án được ngụ ý bởi nội dung và lựa chọn của câu hỏi |
| 3 | B — 11 lần | 1 | Một người bắt tay với 12 − 1 người còn lại |
| 4 | A — 25 % | 0 | Hai lần tung độc lập, đồng xu cân bằng: (1/2)² |
| 5 | A — Thế kỉ XX | 0 | 1921 nằm trong khoảng 1901–2000 |
| 6 | A — Số 16 | 0 | Quy luật nhân 2 được ngụ ý: 1, 2, 4, 8, 16 |
| 7 | A — Định lý Pytago | 0 | Cạnh huyền bình phương bằng tổng bình phương hai cạnh góc vuông |
| 8 | A — 13 | 0 | Quy luật tổng hai số trước: 5 + 8 = 13, 8 + 13 = 21 |
| 9 | A — Khối lập phương | 0 | 6 mặt vuông bằng nhau của một khối đa diện đều |
| 10 | A — 5 cm | 0 | √(3² + 4²) = 5 cm |

## Chỉnh sửa cách trình bày

- Bỏ đầu trang, số trang và nhãn A/B/C/D dính vào nội dung phương án; nối các dòng bị ngắt do dàn trang PDF.
- Chuẩn hóa dấu cách, dấu trích dẫn, dấu ba chấm; thêm dấu cách sau dấu phẩy trong dãy số câu 8 và sau dấu chấm trước câu hỏi ở câu 5. Dấu phân cách “kỳ lạ−một” ở câu 9 thành “kỳ lạ — một”.
- Câu 1: sửa khoảng trắng bên trong tên riêng “A vogadro” thành “Avogadro”, viết hoa “Euler”, thêm dấu cách trước các ký hiệu trong ngoặc. Giữ ký hiệu “N” của phương án A theo nguồn.
- Câu 3: sửa lỗi gõ “thỉ” thành “thì”.
- Câu 6: sửa cụm thiếu từ rất rõ “có mật là số 4” thành “có mật khẩu là số 4”; tách “cứ theo quy luật đó…” sang `prompt` và viết hoa đầu câu. Không thêm quy luật mới vào đề.
- Câu 7: PDF chỉ có dẫn chuyện, phát biểu định lý và các lựa chọn; thêm câu hỏi rõ nghĩa “Định lý được nhắc đến có tên gọi là gì?”. Giữ nguyên đầy đủ phát biểu định lý trong `story`.
- Câu 10: giữ toàn bộ gợi ý trong ngoặc kép, gồm hai cạnh góc vuông 3 cm, 4 cm và yêu cầu cắt thanh gỗ thứ ba làm cạnh huyền; thêm ngắt đoạn để dễ đọc.

## Giới hạn và điểm mơ hồ

- Câu 2: cách dẫn chuyện lịch sử của nguồn khá khái quát. Bộ dữ liệu giữ nguyên câu chuyện; lời giải chỉ viết “Theo nội dung câu hỏi, đáp án là số 0.” Đây không phải kết luận rằng lịch sử phát triển số 0 có thể quy về một phát minh đơn lẻ đã được tài liệu này kiểm chứng.
- Câu 4: nguồn không nói rõ hai đồng xu cân bằng và hai lần tung độc lập. Đáp án 25 % phụ thuộc các giả định này, đã nêu ngay trong lời giải.
- Câu 6: ba giá trị đầu không xác định duy nhất mọi số hạng sau. Đáp án 16 dựa trên quy luật nhân 2 được ngụ ý, không phải hệ quả duy nhất từ ba số 1, 2, 4.
- Câu 7: giữ nguyên lời dẫn lịch sử theo PDF, nhưng lời giải chỉ nhận diện phát biểu định lý. Không kiểm chứng hay bổ sung khẳng định về người đầu tiên phát minh định lý.
- Câu 8: giống mọi bài điền dãy hữu hạn, có thể tạo những quy luật khác. Quy luật tổng hai số trước phù hợp toàn bộ dãy và đáp án được cho.
- Câu 9: khối lập phương là một trường hợp đặc biệt của hình hộp chữ nhật, nên phương án B rộng hơn cũng có thể bao hàm hình được mô tả nếu hiểu theo phân loại tập hợp. A là tên cụ thể và chính xác nhất cho khối đa diện đều có sáu mặt vuông. Giữ thứ tự và nội dung lựa chọn theo PDF.
- Không sử dụng nguồn web để bổ sung sự kiện lịch sử; nguồn câu chuyện là PDF, còn đáp án/lời giải là suy luận như phân biệt ở trên.
