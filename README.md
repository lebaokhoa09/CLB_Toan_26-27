# Kỳ Thư Đại Hải

Website cho trò chơi câu lạc bộ Toán — kho dự án CLB_Toan_26-27.

## Tải về và mở offline cho team

Chọn **Code → Download ZIP** trên GitHub, giải nén toàn bộ rồi bấm đúp **OPEN.cmd**. Bản đầy đủ kèm Node.js portable cho Windows x64, không cần cài thêm hoặc chạy npm. Giữ cửa sổ mở local trong lúc chiếu; nếu trình duyệt không tự mở, dùng địa chỉ được in trong cửa sổ.

**Cần tải sẵn khi còn Internet.** Sau khi tải và giải nén, toàn bộ video, nhạc, hiệu ứng, font và thư viện chạy trên máy, không cần mạng. Có thể chép nguyên thư mục sang máy khác bằng USB.

Xem [hướng dẫn từng bước và xử lý lỗi](HUONG-DAN-OFFLINE.md). Bản trình chiếu hiện tại là v21 Full HD, gồm 10 câu hỏi và bản âm thanh mới nhất có hải âu lặp xuyên suốt các cảnh hành trình.

Các mục bên dưới ghi lại thay đổi và những bản thử trước đây; mở bằng **OPEN.cmd** luôn dùng bản v21 hiện tại.

## Bản trình chiếu Full HD — v21

**Hải âu v21-gull-14:** hai tiếng kêu ngắn từ bản thu Seagull của AlienXXX (Freesound 798340, CC0), có fade và khoảng nghỉ, lặp trong cảnh mở đầu và toàn bộ hành trình, kể cả outro. Giữ gain 0,16; không phát khi màn hình còn đen. Tạm dừng ngay khi chuyển vào câu hỏi, phát tiếp khi trở lại hành trình. Tạm dừng/đổi tab/M điều khiển chung; bắt đầu hành trình mới đặt lại vị trí phát. Dùng chung AudioContext, tài nguyên có sẵn cho bản offline.

**Âm thanh tàu v21-ambience-11:** ghép N2 (Pfannkuchn, Freesound 360630, CC0) và G3 (jimsim, Freesound 411087, CC BY 4.0) từ các bản MP3 preview chất lượng cao công khai. Hai file đã cân gần −24 LUFS, nối chồng 0,75 giây để làm điểm lặp; gain khi phát là 0,18 cho nước và 0,17 cho gỗ. So với nhạc cảnh tàu, cả hai lớp có độ lớn tích hợp thấp hơn khoảng 16 dB; mức gain gỗ bằng khoảng 94% nước sau khi đã cân file nguồn. Chỉ phát trong cảnh tàu/đoạn kết, tắt hẳn ngay lúc bắt đầu hiện câu hỏi, fade khi kết thúc; không phát ở màn đen hoặc intro. Phím M tắt/bật cả ba lớp; đổi tab, tạm dừng và hộp cài đặt dừng toàn bộ âm thanh. Dùng chung một AudioContext, không phát lại từ đầu ở từng chặng, có sẵn tài nguyên để chạy offline. Ghi công trong dist/music-credits.html.

**Trang đầu v21-lobby-8:** khi tải xong chỉ hiển thị nút Bắt đầu trình chiếu, căn chính giữa màn đen. Bỏ nhãn phiên bản phim; chuyển nút tiếp tục đã lưu và liên kết nguồn nhạc/giấy phép vào hộp cài đặt. Thông báo tải/lỗi và nút thử lại vẫn xuất hiện khi cần.

**Căn giữa v21-centered-5:** cụm số câu, phần dẫn, câu hỏi, đáp án và lời giải được căn giữa theo chiều cao nội dung thực tế của từng câu. Nút tiếp tục nằm riêng bên dưới, không kéo tâm cụm đọc lên trên. Trình duyệt tự tính lại khi đổi câu, hiện/xóa đáp án, tải font hoặc đổi kích thước màn hình; không đặt tọa độ riêng theo số câu và không đổi cỡ chữ.

**Lời giải v21-explanations-4:** cập nhật lời giải cả 10 câu theo bản người dùng đã duyệt; mở rộng câu 1, 2, 6, 7, 8, bỏ câu cuối về chữ số pi theo yêu cầu. Giữ cỡ chữ trình chiếu, đưa nội dung lên đầu vùng đọc và mở rộng chiều ngang để dành chỗ cho lời giải. Phương án hiển thị dạng A., B., C., D.; phần trăm viết 25%, 50%, 100%, 0%. Nguồn đối chiếu lịch sử được ghi trong QUESTION-SOURCE.md, không hiển thị trên slide.

**Bản màn hình lớn v21-projector-3:** phần dẫn và câu hỏi dùng cùng font Be Vietnam Pro, cùng màu kem và cỡ chữ; đáp án và lời giải được phóng lớn. Cỡ câu hỏi/đáp án tại Full HD là 38,4 px, lời giải 36,48 px, tăng theo độ phân giải đến 4K. Lớp tối phủ toàn vùng đọc giúp chữ rõ cả ở bên phải. Nút tiếp tục chỉ hiện tên thao tác; Enter vẫn hoạt động.

**Nhạc nền:** dùng bản loop 10 phút từ đoạn hạ nhạc cuối bài Adventure (remaster) của Alexander Nakarada. Bấm Bắt đầu mở AudioContext; tệp nhạc vẫn tạm dừng ở giây 0 trong toàn bộ màn đen 5 giây. Nhạc chỉ bắt đầu sau khi màn mở đầu đã vẽ lên. Mức nhạc cảnh tàu là 0,70; khi tới câu hỏi và sau khi chốt đáp án giảm còn 0,07, bằng 1/10 gain cảnh tàu. Nhạc tiếp tục trong lúc chờ trả lời, không phát lại từ đầu ở từng câu. Khi bấm Enter đi tiếp, nhạc tăng lại trong 1,2 giây. Đổi tab, tạm dừng hoặc mở hộp cài đặt sẽ tạm dừng nhạc; trở lại giữ vị trí cũ. Cuối hành trình nhạc fade rồi dừng. Phím **M** tắt/bật nhạc. Nguồn và ghi công ở `dist/music-credits.html`, có liên kết trên màn chờ; tài nguyên đều có sẵn để dùng offline.

**Backspace:** sau khi trả lời, bấm một lần để xóa lựa chọn ở câu hiện tại, bấm thêm lần nữa để về câu trước ở trạng thái chưa trả lời. Khi tàu đang chạy hoặc đang chuyển vào câu mới, Backspace quay về câu vừa rời, chưa trả lời. Các đáp án từ câu quay lại trở đi được xóa và điểm số được tính lại. Ở câu đầu chưa trả lời hoặc trước điểm dừng đầu tiên, phím không lùi quá giới hạn. Giữ phím không lùi liên tục.

Trang mặc định dùng bản Blender v21 đã sửa buồm, ánh sáng và hiệu ứng cuối cùng. Mười clip 5 giây và outro 8 giây được mã hóa trực tiếp từ 1.740 ảnh render gốc ở 1920×1080, 30 fps; không mã hóa lại từ MP4 tổng. Các clip không có chữ kết thúc sẵn: chữ được hiển thị trên web, đồng bộ với outro sau câu 10.

Các video review tổng của v11–v14 được giữ trong `reference-media/` ngoài gói website. Các clip chơi và manifest của từng bản vẫn ở `dist/assets/`.

Bấm **Bắt đầu trình chiếu**: giữ màn đen 5 giây, chạy intro, rồi bắt đầu hành trình. Bấm **A, B, C hoặc D** chốt đáp án ngay; đáp án đã chọn không thể đổi. Bấm **Enter** sau kết quả để tới chặng/câu tiếp theo; sau câu 10 sẽ chạy outro. Enter trước khi trả lời không chọn nhầm đáp án đang có focus. Giữ phím không được bỏ qua nhiều câu.

**F11** dùng chế độ toàn màn hình của trình duyệt. Con trỏ bị ẩn trên toàn bộ phần trình chiếu, kể cả nút đáp án và khi rê chuột; không phụ thuộc việc trình duyệt có gửi sự kiện F11 hay không. Màn chờ trước khi bắt đầu vẫn có chuột khi ở cửa sổ thường. **F** tiếp tục hỗ trợ toàn màn hình bằng API, **Space** tạm dừng phim.

**Bản sửa chọn nguồn v21-only-2:** trang chỉ nhận phim v21 Full HD có mã nguồn model đã được duyệt. Các tham số cũ như `?film=v13`, `?film=v14` hoặc `?mode=3d` không được chuyển sang bản thử. Nếu manifest/media v21 không tải được hoặc metadata không đúng, nút bắt đầu/tiếp tục bị khóa và hiện nút thử tải lại. Không tự đổi sang v14/v13, renderer 3D hay ảnh dự phòng. Màn chờ xác nhận “Phim v21 · Full HD” chỉ sau khi kiểm tra thành công. Những phần mô tả v9–v14 bên dưới là lịch sử bản thử, không phải cơ chế chọn nguồn hiện tại.

## Bản thử liền mạch và đoạn kết — v13

Chạy `MO-BAN-LIEN-MACH-V13.cmd` để mở bản cục bộ ở `http://127.0.0.1:54837/?film=v13`. Hải trình vẫn là 10 đoạn × 5 giây; đoạn kết riêng 8 giây chỉ bắt đầu sau khi đã trả lời câu 10 và chọn tiếp tục. Media test 960×540, 30 fps, vật liệu đơn giản.

Các chặng v13 dùng chung ảnh dừng: cuối chặng trước cũng là ảnh đầu chặng sau. Đoạn kết tiếp tục từ điểm dừng 10, mở toàn hành trình rồi hiện tiêu đề bằng DOM trên chính nền phim. Space tạm dừng cả nền lẫn nhịp chữ; tiến độ đoạn kết được lưu để tải lại. Chế độ giảm chuyển động và lỗi phát đoạn kết đi thẳng tới kết bài tĩnh. Điểm/nút vẫn ẩn trong chế độ trình chiếu.

Giữ đủ `dist/assets/voyage-v13/` khi sao chép offline. Manifest chỉ được công bố sau khi đủ media; các kiểm tra player bằng fixture tổng hợp không chứng minh chất lượng camera của bản render thật.

## Bản thử đa góc đủ 10 chặng — v12

Chạy `MO-BAN-DA-GOC-V12.cmd` để mở bản cục bộ ở `http://127.0.0.1:54836/?film=v12`. Bản này gồm 10 đoạn × 5 giây, 1280×720 ở 30 fps, thử các góc mạn trái/phải, sau đuôi, trước mũi, vòng qua đuôi, máy tĩnh, trên mũi tàu và góc cao. Giữ vật liệu đơn giản để duyệt ngôn ngữ máy quay.

Các camera có thể cắt có chủ đích giữa hai chặng. Mỗi chặng v12 có ảnh đầu riêng (`start-XX.jpg`) để góc mới được chuẩn bị dưới màn câu hỏi trước khi phát; ảnh cuối (`rest-XX.jpg`) vẫn giữ đúng điểm dừng. `manifest.json` chỉ được tạo khi đủ bộ media đã kiểm tra. Khi sao chép bản offline, giữ toàn bộ `dist/assets/voyage-v12/`.

Trang mặc định chọn bộ hoàn chỉnh theo thứ tự v13 → v12 → v11 → v9. `?film=v13`, `?film=v12`, `?film=v11`, `?film=v9` chọn riêng từng bản; các launcher cũ giữ nguyên nguồn đã chọn. Bản cục bộ không tự xuất bản lên website công khai.

## Bản cinematic đủ 10 chặng — v11

Chạy `MO-BAN-CINEMATIC-V11.cmd` để mở bản cục bộ ở `http://127.0.0.1:54835/?film=v11`. Hành trình gồm 10 đoạn, mỗi đoạn 5 giây, 1280×720 ở 30 fps; tàu đi qua cả biển và lục địa. Vật liệu dùng màu phẳng đơn giản; ánh nắng và bóng được render sẵn trong video. Mỗi chặng dừng ở điểm đến và chờ trả lời câu hỏi rồi mới khởi hành tiếp.

Media nằm trong `dist/assets/voyage-v11/`. File mở bản v11 sẽ báo nếu quá trình xuất chưa tạo xong manifest. Cần giữ đủ các clip, ảnh nghỉ và manifest trong thư mục này khi sao chép bản offline.

Đường dẫn `?film=v11` chọn riêng v11, `?film=v9` chọn riêng v9. Khi v12 chưa có hoặc thiếu file, trang mặc định vẫn có thể dùng v11 làm nguồn dự phòng.

## Bản thử chuyển động Blender v9

Chạy `MO-BAN-THU-V9.cmd` để xem bản cục bộ mới: 10 chặng × 5 giây, tàu qua cả biển và lục địa, camera riêng. Đây là bản Workbench để duyệt chuyển động, chưa phải phim Full HD có vật liệu/ánh sáng cuối. Cần giữ thư mục `blender/ship-voyage-v9/previs-media` cạnh dự án như hiện tại. Bản thử chưa được xuất bản lên website công khai.

## Mở trên máy tính

Mở đường dẫn website đã xuất bản. Bản tải về: giải nén toàn bộ, mở thư mục và chạy OPEN.cmd hoặc MO-TRO-CHOI.cmd. Bản Windows x64 đầy đủ đã kèm Node.js portable. Hoặc chạy `node serve.mjs 54824` rồi mở http://127.0.0.1:54824/. Hình ảnh, thư viện và phông chữ có sẵn trong thư mục; không cần mạng khi chạy bản tải về. Không mở trực tiếp index.html.

## Trình chiếu

- Mở Chrome/Edge, bấm F11 trước buổi chiếu nếu muốn ẩn khung trình duyệt.
- Bấm Bắt đầu trình chiếu một lần: màn hình đen 5 giây, intro tự chạy, rồi tàu khởi hành. Mỗi chặng mặc định 5 giây. Bản thử Blender dùng nhịp tăng/hãm mới; khi chưa có phim, renderer 3D cũ vẫn là nền dự phòng.
- Chọn A–D hoặc phím 1–4 chốt ngay. Sau kết quả, bấm Tiếp tục hành trình, Enter, mũi tên phải hoặc PageDown.
- Space tạm dừng/đi tiếp khi tàu đang chạy. F đổi toàn màn hình. Home sau trang kết quay về màn chờ.
- Không có dấu X, đường đứt, nhãn Câu trên bản đồ, thanh công cụ hay điểm số khán giả. Điểm dừng được giữ trong nội dung trò chơi.
- Ưu tiên 1920×1080; tỷ lệ máy tính khác giữ khung 16:9 bằng dải trống ở viền. Không thiết kế giao diện điện thoại.

## Hình ảnh

Bản đồ mới là một mặt hữu hạn 9600×3200 đơn vị cảnh, không lặp lại cả thế giới. Ảnh bản đồ được dựng ở độ phân giải thật 6144×2048 từ đường bờ dạng vector và vật liệu minh họa, chia thành ba tấm 2048×2048 để tải nhanh. Hải trình cong đi vòng dưới các lục địa, chia đều theo độ dài cung; trả lời xong giữ đúng vị trí cũ để đi tiếp.

Tàu là mô hình 3D nhỏ hơn, thân gỗ, buồm kem và ba cột buồm; quay quanh trục đứng theo đường đi, không nghiêng cả tấm ảnh, không lắc/nhấp nhô hay trộn ảnh gây liquid glass. Đây là bản dựng minh họa theo phong cách tham chiếu, không phải bản sao chính xác từng chi tiết của video. Nguồn bản đồ và giới hạn nằm trong dist/assets/atlas/provenance.json và ASSET-SOURCES.md. Các ảnh tàu/bản đồ cũ còn được giữ làm tham chiếu hoặc nền dự phòng.

Mười câu hỏi lấy từ PDF. Đáp án suy ra từ câu hỏi vì PDF không có khóa đáp án riêng; xem QUESTION-SOURCE.md.
