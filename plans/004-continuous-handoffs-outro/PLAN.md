# Kế hoạch nối cảnh liên tục và outro

Ngày: 29/10/2026. Kế hoạch này đã được triển khai thành bản thử v13 theo yêu cầu thực hiện tiếp theo của người dùng. Giữ lại nội dung bên dưới làm bản thiết kế; trạng thái bàn giao và bằng chứng thực tế nằm tại `blender/ship-continuous-v13/README.md`.

## Quyết định chính

Giữ vốn góc quay đa dạng đã có, nhưng dựng chúng thành các điểm đi qua trên một đường máy liên tục. Không coi màn câu hỏi là giấy phép để đổi vị trí camera. Rà lại cả chín điểm nối, không chỉ cảnh 7–8–9.

Phần hải trình vẫn là 10 chặng × 5 giây = 50 giây. Outro riêng 8 giây chỉ chạy sau khi đã trả lời câu 10 và chọn tiếp tục. Tổng phần trình diễn là 58 giây, ngoài thời gian làm câu hỏi. Outro này đã được thực hiện trong bản thử v13 theo yêu cầu triển khai kế hoạch.

Vẫn dùng Blender render sẵn và player video. Giữ tàu, atlas, ánh sáng theo thế giới, vật liệu đơn giản, địa lý và các mốc câu hỏi. Thay đổi chính là camera, cách ghép clip/poster và luồng outro.

## Chẩn đoán có bằng chứng

- `blender/ship-multi-angle-v12/build_voyage.py` tạo mười camera độc lập và khai báo chín `world_seams` là `cut`. Tàu khớp ma trận ở điểm nối; camera không bắt buộc khớp.
- Các góc kế tiếp được đặt riêng. Ví dụ camera cảnh 7 ở cách điểm ngắm 235 đơn vị cảnh với lens 65 mm; cảnh 8 ở local `(7.15,-1.6,6.8)`, lens 28 mm, nhìn ra phía trước từ mũi. Cảnh 9 lập tức chuyển lên cao. Đây là thay đổi thật về vị trí, hướng nhìn và trường nhìn, không chỉ là easing chưa đẹp.
- `dist/app.js`: màn câu hỏi xuất hiện bằng fade 0,55 giây. Khi tiếp tục, player đặt cảnh mới dưới màn câu hỏi còn kín, fade câu hỏi 0,45 giây rồi phát clip. Cơ chế này tránh lóe poster cũ, nhưng vẫn để người xem trở lại một góc nhìn khác hẳn.
- Sau câu 10, luồng hiện tại gọi wipe rồi mở màn `complete`; chưa có một đoạn outro camera riêng.
- Các kiểm tra v12 trước đây đã đạt đúng hợp đồng “cắt góc có chủ đích”. Chúng không chứng minh cảm giác liên tục mà người dùng đang yêu cầu. Hợp đồng đó cần đổi.

Suy luận nghệ thuật: cỡ hình, trục nhìn và vật thể dẫn mắt đổi cùng lúc khiến các cảnh bị đọc thành những đoạn riêng. Chưa đo mức khó chịu của người xem; không dùng kết quả giải mã video hay kiểm tra ma trận để thay thế nhận xét này.

## Cách áp dụng năm skill

- **motion-doctrine:** lập ledger trước; giữ vật dẫn, quan hệ không gian và chiều chuyển động; không thêm wobble để lấp thời gian. Vật dẫn ở đây là chính tàu, mũi/buồm và bờ thật trên atlas.
- **cut-the-curve:** áp dụng nguyên lý nối vị trí/vận tốc và một hướng chuyển động có nguyên nhân. Không áp preset trượt toàn màn hình 12%, zoom/blur hay đổi ảnh giữa lúc mờ vào cảnh 3D chỉ để che lỗi camera.
- **build-threejs-scroll-worlds:** dùng một thế giới, trạng thái xác định, endpoint camera có chủ đích và mốc nhìn bền vững. Không chuyển dự án sang WebGL hay thêm điều khiển cuộn.
- **cinematic-director:** mỗi chặng có một chức năng và một đường máy chính; giữ hướng địa lý; đổi thứ tự góc nếu cần để tránh chạy máy vội chỉ nhằm giữ danh sách cũ.
- **cinematic-gsap-lenis-motion-system:** giao diện chuyển nhẹ, nội dung vào theo thứ tự đọc, nền ổn định khi đọc, không bounce/elastic hoặc hiệu ứng dồn dập.

Điểm cần điều chỉnh theo bối cảnh: quy tắc “cắt giữa chuyển động, không bắt đầu từ nghỉ” trong motion-doctrine dành cho một phim đang chạy. Câu hỏi ở đây là khoảng dừng tương tác có chủ đích và dài tùy ý. Chọn **vận tốc bằng 0 ở cả hai phía**, giữ cùng camera, rồi tăng tốc lại nhẹ nhàng; không cố truyền đà qua hàng chục giây đọc câu hỏi. Khoảng nghỉ kết bài cũng là end state có ý nghĩa, không phải idle motion để lấp thời gian.

## Hợp đồng mới của mỗi điểm dừng

Mỗi điểm dừng có một trạng thái chung `K1…K10`, thay vì hai trạng thái camera đầu/cuối tính độc lập:

`cuối clip i = poster giữ i = ảnh lộ lại sau câu hỏi i = đầu clip i+1`

Trạng thái chung chứa camera position, orientation/quaternion, target, up/roll, FOV/sensor/lens shift, vị trí/hướng tàu, ánh sáng và trạng thái môi trường. Nội suy các đại lượng đó cùng một tiến trình. Không chỉ lerp vị trí máy còn target/FOV nhảy riêng.

- Dùng một camera rig toàn hành trình để author; các MP4 chỉ là những đoạn cắt kỹ thuật trên cùng timeline.
- Tại mỗi mốc câu hỏi, tàu và camera giảm tốc về nghỉ. Không thực hiện việc quay sang góc mới trong lúc người dùng đang đọc.
- Khi tiếp tục, lộ lại đúng trạng thái vừa dừng. Đường máy sang góc mới bắt đầu trong clip kế tiếp, để người xem thấy được quá trình đổi góc.
- Tiêu cự thay đổi khi có lý do bố cục và đi qua một đường cong liên tục; không đổi 65 → 28 mm ngay tại seam. Tránh bù dolly/zoom làm kích thước tàu phập phồng.
- Bắt đầu bằng việc giữ điểm dẫn mắt ở vị trí gần như cũ; sau khi khung đã được nhận diện mới đổi quan hệ không gian.
- Không xoay Sun theo camera. Kiểm góc tối bằng bố cục/ánh sáng bù nhất quán nếu cần.

Nhịp thử trong mỗi 5 giây: 0–0,5 s rời trạng thái nghỉ; 0,5–3,9 s thực hiện đường máy chính; 3,9–4,8 s giảm tốc; 4,8–5 s giữ ảnh. Đây là mốc khởi đầu cho previs, không phải timing đã được duyệt. Camera có thể phân phối quãng đường khác tàu nhưng phải cùng dừng ở mốc câu hỏi.

## Sắp xếp góc để nối được trong 50 giây

Giữ các nhóm góc đã duyệt; có thể đổi thứ tự điểm nhấn camera, không đổi thứ tự địa điểm/câu hỏi. Góc máy trở thành điểm đi qua trên đường đi, thay vì một góc hoàn toàn mới xuất hiện ngay đầu chặng. Bảng dưới là phương án để dựng thử, chưa phải khóa vị trí/lens.

| Chặng | Chức năng / điểm nhấn | Đường máy và trạng thái bàn giao |
|---|---|---|
| 1 | Xác lập tàu và bờ, 3/4 sau mạn phải | Tiến gần vừa phải, kết gần phía đuôi để chuẩn bị góc sau. K1 vẫn thấy tàu và bờ. |
| 2 | Nhìn từ đuôi, thấy chiều sâu boong | Từ K1 đi qua trục đuôi có nhìn thấy, kết chếch sau mạn trái tại K2. |
| 3 | Quan hệ tàu và không gian rộng | Từ K2 mở ra mạn trái; có thể có một đoạn máy gần tĩnh để tàu tự tạo chuyển động. K3 chuẩn bị góc ngang. |
| 4 | Đường bờ châu Phi được mở ra | Tiếp nối cùng phía, cung máy ngắn để lộ bờ, kết ngang/chếch trước mạn trái tại K4. |
| 5 | Tàu trên lục địa, thân tàu và bóng | Từ K4 tiến về 3/4 trước mạn trái; điểm nhấn là quan hệ tàu–đất. K5 chuẩn bị góc nhìn mũi. |
| 6 | Máy đi trước nhìn ngược về mũi, rồi nhường tuyến nhìn phía trước | Đưa điểm nhấn nhìn ngược vào giữa chặng nếu đường máy cho phép; cuối chặng dịch sang bên mũi và chuyển target dần về tuyến đi. Nếu cần quay quá nhiều thì dời điểm nhấn sang chặng 5, không tăng tốc để ép đủ. K6 không kết chính diện ngược hướng với POV kế tiếp. |
| 7 | Tiếp cận vị trí trên tàu | Đi cùng bên mũi, đã nhìn chếch về phía trước; giảm khoảng cách/độ cao theo một đường cong. K7 ở ngay ngoài khu vực mũi, thấy boong thật và bờ trước tàu. |
| 8 | Góc trên mũi tàu | Từ K7 vào vị trí đã kiểm clearance, hướng nhìn đổi ít; giữ trải nghiệm nhìn ra phía trước đủ lâu. K8 là POV ổn định, không thoát ra vào cuối chặng chỉ để chuẩn bị cắt. |
| 9 | Rời điểm nhìn trên tàu | Bắt đầu đúng K8; nâng máy và lùi theo cung lệch mạn để vượt buồm an toàn, dần thấy toàn tàu. Một đường rút ra có chủ đích, không vừa lao vào vừa xoay ngược. K9 là góc cao chếch đủ rộng. |
| 10 | Xác lập vùng đích, chuẩn bị kết | Từ K9 tiếp tục mở rộng; chuyển dần lên góc cao hướng Bắc. K10 là khung chung cho câu hỏi cuối và đầu outro. Không tuyên bố hoàn thành trước khi câu 10 được trả lời. |

Cách sắp xếp này giữ góc đuôi, hai mạn, nhìn ngược từ trước mũi, nhìn trên tàu, góc cao và cú rút xa. Nó thay đổi thứ tự của một số điểm nhấn. Nếu đường máy vẫn quá dài trong 5 giây, giảm biên độ hoặc đổi vị trí điểm nhấn; không giữ mọi key pose cũ bằng mọi giá. Không cam kết giữ một cảnh máy tĩnh trọn 5 giây nếu điều đó lại làm hỏng đầu/cuối nối cảnh.

## Vào và rời màn câu hỏi

1. Camera và tàu đã giảm tốc trước cuối clip, còn khung đủ rõ để nhớ mốc nhìn.
2. Hiện lớp câu hỏi trên khung giữ. Giữ bố cục/chữ/đáp án hiện có; nội dung đi vào theo thứ tự câu hỏi rồi đáp án. Không kéo cả bản đồ sang một bên để giả chuyển cảnh.
3. Trong lúc trả lời, giữ nguyên trạng thái thế giới. Màn câu hỏi có thể kéo dài tùy ý, không chạy camera bí mật phía sau.
4. Sau thao tác tiếp tục, chuẩn bị clip kế tiếp đúng trạng thái chung. Chỉ rời câu hỏi khi clip/poster đầu đã sẵn sàng.
5. Lộ lại đúng khung cũ, sau đó chuyển động tăng tốc dần vào đường máy kế tiếp. Không lộ góc mới rồi mới phát video.

Fade của lớp giao diện có thể giữ gần timing hiện tại trong lượt thử đầu. Chỉ tăng/giảm sau khi camera đã nối đúng. Fade ở đây là độ che phủ giao diện trên cùng một thế giới, không phải dissolve giữa hai góc tàu. Không thêm blur/whoosh tại mọi câu hỏi.

## Outro đề xuất — 8 giây sau câu 10

Ý tưởng: **từ một con tàu đến toàn bộ hành trình**. Cảnh kết mở rộng chính thế giới đang có, thay vì nhảy sang một màn kết trang trí không liên quan.

Điều kiện bắt đầu: đã trả lời câu 10, đã có thời gian đọc phản hồi, người điều khiển chọn tiếp tục/kết thúc. Không tự chuyển khi vừa bấm đáp án.

| Thời gian outro | Hình và chuyển động | Nội dung |
|---|---|---|
| 0–0,7 s | Rời màn câu hỏi cuối, lộ đúng K10; video đầu giữ cùng khung | Chưa hiện tiêu đề kết. |
| 0,7–3,7 s | Camera tiếp tục nâng–lùi nhẹ từ K10 để mở atlas; tàu vẫn ở mốc cuối | Lộ tuyến thực đã đi và mười điểm dừng bằng lớp nét vàng đơn giản. Chỉ dùng dữ liệu route hiện có, không vẽ đường trang trí khác đường tàu. |
| 3,7–4,2 s | Camera vào khung kết rồi nghỉ có chủ đích | Một nhịp thở ngắn trước tiêu đề. |
| 4,2–5,3 s | Tiêu đề vào nhẹ, một hướng, khoảng dịch nhỏ | “Hành trình đã trọn vẹn.” Sau đó “Mười điểm dừng, mười điều được khám phá.” |
| 5,3–6,8 s | Khung giữ; không orbit/pulse nền liên tục | Giữ đủ thời gian đọc. Trong chế độ game thường, có thể hiện số câu đúng sau tiêu đề; số liệu luôn từ state thật. |
| 6,8–8 s | Ổn định thành màn kết tương tác, giữ khung atlas cuối làm nền | Game thường hiện “Xem lại đáp án” và “Chơi lại”. Chế độ trình chiếu giữ chính sách hiện tại về ẩn điểm/nút; không ép hiện scoreboard. |

Sau giây 8 giữ end state; không tự về lobby, không tự đen màn hình hay phát lại outro. Tên CLB, logo bổ sung, danh sách thành viên/credit chưa có nội dung được chốt nên chưa đưa vào.

Âm thanh là tùy chọn nhỏ: nếu đang bật âm, chốt một hợp âm nhẹ ở thời điểm tiêu đề/kết quả xuất hiện. Tôn trọng mute; chưa cần gió, sóng, nhạc nền mới hay voice-over để giải quyết chuyển cảnh.

## Kế hoạch kỹ thuật khi triển khai

- Lưu endpoint chung trong một kho key pose. `ledger.json` cùng thư mục là ledger kế hoạch cho chín mối nối + outro; chưa có tọa độ và chưa phải bằng chứng render.
- Author một rig camera liên tục; kiểm look direction, quaternions/up-vector và lens curve, đặc biệt đoạn vào boong, vượt buồm và lên gần thẳng đứng.
- Cắt thành 10 clip từ timeline chung. Dùng lại cùng file poster cho `rest-i` và đầu clip tiếp theo, thay vì mã hóa hai JPEG độc lập. Dùng hold frame chung để kiểm khác biệt MP4 do nén.
- Manifest các mối nối mới là `continuous`, không mượn lại xác nhận `cut` của v12. Giữ v12 như một bản đối chiếu riêng.
- Đổi verifier: kiểm liên tục camera/FOV/target và screen anchor, không tiếp tục dùng “đủ mười camera riêng” hoặc “chín intentional cuts” làm điều kiện thành công. Giữ kiểm đường tàu, hình học, ánh sáng, clearance, cỡ hình và nghỉ câu hỏi.
- Outro có video nền và poster riêng; tiêu đề/điểm/nút là DOM để nội dung động không bị bake sai. Thêm state `outro` có progress, pause/hidden/reload phù hợp; không gọi màn complete ngay khi câu 10 được trả lời.
- Prefetch outro trong chặng/câu 10. Nếu chưa sẵn sàng, giữ K10; nếu lỗi media, vẫn có kết bài tĩnh và kết quả thật. Không để tải video làm mất câu trả lời hoặc kẹt trò chơi.
- Giảm chuyển động: bỏ đường bay vào/ra và nâng máy, dùng khung giữ phù hợp; các câu hỏi và kết quả vẫn hoàn thành. Không buộc chờ đủ 8 giây chỉ để xem outro tĩnh.

Các script Seam Gate của motion-doctrine kiểm selector/timeline HyperFrames/DOM. Chúng không trực tiếp chứng minh camera Blender trong MP4. Khi triển khai cần verifier theo native/media/player; không ghi “Seam Gate pass” khi chưa có phép kiểm tương ứng.

## Thứ tự dựng thử và duyệt

1. Khóa ledger endpoint và thứ tự điểm nhấn; không khóa tọa độ từ cảm tính.
2. Dựng previs thấp chi tiết cho 7→8→9 và 2→3/5→6 trước. Kiểm tốc độ quay, khoảng cách, vật che và giữ cùng mốc nhìn.
3. Dựng cửa sổ quanh cả chín seam, xem từng cặp trước/sau rồi xem có màn câu hỏi ở giữa. Kiểm cả khoảng trả lời ngắn và dài; không chỉ xem MP4 liền 50 giây.
4. Duyệt bản 50 giây có đầy đủ nhịp dừng; sau đó duyệt outro 8 giây từ chính câu hỏi cuối.
5. Chỉ render đủ chất lượng bản test khi đường máy đã được duyệt. Không làm lại vật liệu để chữa một lỗi nối cảnh.

Tiêu chí chấp nhận: đầu cảnh sau không đổi góc khi vừa rời câu hỏi; mỗi lần đổi góc đều có đường đi nhìn thấy; không xuyên tàu/buồm/đất; không target flip/roll bất ngờ; không giật tiêu cự/cỡ hình hay flash đen/trắng; buffer/reload/ẩn tab không làm timeline vượt ảnh; outro bắt đầu đúng K10 và chỉ sau câu 10. Duyệt bằng cả trạng thái số, video và lượt chơi thật; cảm giác mượt vẫn cần đánh giá trực tiếp, không được suy ra chỉ từ việc ma trận khớp.

## Đầu ra của bước này

Chỉ có tài liệu kế hoạch và ledger. Chưa sửa các file runtime, chưa thay thế v12, chưa render animation mới, chưa xuất hay gửi video mới.
