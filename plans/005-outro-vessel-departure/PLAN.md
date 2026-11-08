# Outro: tàu tiếp tục đi và rời khung

Ngày 29/10/2026. Đã triển khai thành bản thử v14 theo yêu cầu thực hiện kế hoạch tiếp theo của người dùng. Phạm vi chỉ là chuyển động rời khung của tàu trong outro; phần thiết kế dưới đây được giữ làm tham chiếu. Bằng chứng bàn giao thực tế tại `blender/ship-departure-v14/README.md`.

## Ý đồ

Kết thúc trò chơi nhưng con tàu vẫn tiếp tục hành trình. Camera mở ra bản đồ đã đi qua; tàu rời mép hình, còn tuyến đường và lời kết ở lại. Đây là một hành động kết bài, không phải hiệu ứng làm tàu biến mất.

Hiểu “phóng to góc nhìn” là camera đang lùi ra để nhìn rộng hơn như outro v13. Không đổi sang zoom tiến lại gần tàu.

## Phần đã khóa

- 50 giây hải trình, cả mười câu hỏi và chín điểm nối đã duyệt.
- Khung K10 khi rời câu hỏi cuối và 0–0,7 giây đầu outro: cùng camera, vị trí/hướng tàu, ánh sáng và lớp route như v13.
- Ưu tiên giữ nguyên toàn bộ đường camera outro, tiêu cự, nhịp mở atlas, chữ và thời lượng 8 giây. Thử bằng chuyển động tàu riêng trước khi cân nhắc chỉnh camera.
- Tuyến vàng và mười mốc biểu diễn lịch sử đã hoàn thành, vẫn kết tại mốc 10. Không tạo câu hỏi 11 hay kéo đường vàng chạy theo tàu ra ngoài.
- Ánh sáng, vật liệu, tỷ lệ tàu–atlas, giao diện câu hỏi và chính sách điểm/nút của chế độ trình chiếu giữ như bản duyệt.

## Ràng buộc cần kiểm bằng previs

V13 khóa tàu tại `evaluate(9,5)` trong cả outro; camera nâng từ khoảng 105 lên 820 đơn vị cảnh và đổi tâm ngắm về tuyến đường. Vì vậy, thêm chuyển động tàu không tự bảo đảm nó rời khung: khung đang rộng ra và có thể bắt lại con tàu vừa ra mép.

Mục tiêu đầu tiên là giữ camera hiện tại, cho tàu đi tiếp theo tiếp tuyến cuối tuyến đường, ra phía phải màn hình ở góc cao hướng Bắc. Hướng có thể hơi chếch xuống theo tiếp tuyến thật, không bẻ lái sang hướng khác chỉ để thoát hình.

Không ép tàu phải ra hết trước giây 3,7 hoặc trước khi tiêu đề xuất hiện. Cho tàu nhỏ dần, tiếp tục đi ở vùng phải trong lúc chữ hiện là nhịp kết hợp lý hơn việc lao đi trong ba giây. Mốc rời hết hình dự kiến khoảng 6,5–7,2 giây; đây là mục tiêu bố cục, chưa phải kết quả render.

Tốc độ được chọn bằng phép chiếu camera và previs. Ưu tiên cảm giác gần với tốc độ hải trình; có thể tăng vừa phải khi khung đã mở rộng nếu vẫn đọc như tàu đang đi. Không tăng vọt để giữ một mốc thời gian cứng. Nếu cần tốc độ quá lớn hoặc khung vẫn bắt lại tàu, xem phương án thay thế bên dưới.

Đã kiểm sơ bộ bằng ma trận camera/root/FOV v13 và bounds của 88 phần tàu. Giả định giữ 0,7 giây, tăng tốc mềm trong 0,6 giây, rồi đi thẳng theo hướng cuối khoảng −19,6°. Tốc độ cruise hải trình khoảng 19,1 đơn vị cảnh/giây. Đây là phép chiếu hình học, chưa phải đánh giá cảm giác tốc độ bằng video.

| Tốc độ rời đi so với cruise | Toàn bộ thân/buồm rời hình, ước tính | Bóng nắng trên mặt phẳng rời hình, ước tính |
|---|---|---|
| 1,0× | Chưa ra hết trước giây 8; bbox cuối X xấp xỉ 0,977–1,010 | Chưa ra hết trước giây 8 |
| 1,4× | Khoảng 7,0 s | Khoảng 7,6 s |
| 1,5× | Khoảng 6,6 s | Khoảng 7,1 s |
| 1,6× | Khoảng 6,2 s | Khoảng 6,7 s |

Phương án previs đầu tiên là **1,5×**, giữ nguyên camera và nhịp chữ. Nếu nhìn vội thì giảm về 1,4× rồi so sánh trực tiếp. Phép chiếu đã kiểm không thấy trường hợp ra rồi lọt trở lại khung ở các ứng viên trên. Bóng mềm thật và các pixel dây/buồm sát mép vẫn cần render để duyệt; mô hình bóng ở đây là ước lượng bảo thủ theo Sun trên mặt phẳng.

## Nhịp outro dự kiến

| Thời gian | Camera / tàu | Trọng tâm |
|---|---|---|
| 0–0,7 s | Lộ lại đúng K10, tàu giữ nguyên | Nối liền với câu hỏi cuối như bản đã duyệt. |
| 0,7–1,3 s | Camera bắt đầu mở như cũ; tàu tăng tốc mềm từ nghỉ theo hướng tiến cuối | Người xem nhận ra tàu đang đi tiếp, không phải bị kéo ngang hình. |
| 1,3–3,7 s | Tàu duy trì chuyển động; camera nâng–lùi và lộ tuyến vàng như cũ | Từ tàu sang toàn bộ hải trình. Camera không chuyển sang bám theo tàu. |
| 3,7–4,2 s | Camera vào khung atlas cuối, tàu tiếp tục về mép phải | Nhịp nghỉ của camera trước tiêu đề. |
| 4,2 / 4,8 s | Giữ thời điểm hiện tiêu đề/phụ đề như v13 | Tàu lúc này ở vùng phải, không chạy cắt ngang chữ ở giữa. |
| Khoảng 6,5–7,2 s | Toàn bộ tàu đi qua mép phải; kiểm cả đuôi, buồm và bóng | Đọc được một cuộc rời đi thật, không biến mất bằng opacity. |
| Đến 8 s | Giữ bản đồ, tuyến đường và lời kết; tàu không trở lại khi khung đã rộng | Khung kết sạch, vẫn giữ các thao tác game/trình chiếu hiện có. |

Các thời điểm của chuyển động tàu là dự kiến để thử. Tiêu đề 4,2 giây, phụ đề 4,8 giây và thao tác kết 6,8 giây là nhịp v13 được ưu tiên bảo toàn.

## Quy tắc chuyển động

1. Tàu di chuyển bằng transform trong thế giới 3D, cùng kích thước thật của mô hình. Không trượt một ảnh tàu 2D trên mặt video.
2. Camera và target lấy từ đường máy đã duyệt, độc lập với vị trí mới của tàu. Không vô tình cập nhật target theo root mới rồi làm máy bám tàu, khiến nó không rời được hình.
3. Chỉ có một đường rời đi chính. Không thêm vòng quay 180°, đổi mạn, bật lùi hoặc tăng–giảm tốc lặp lại.
4. Không dùng fade-out, thu scale riêng hoặc `hide_render` khi tàu vẫn còn trong khung. Cắt một phần tàu tại mép hình là giai đoạn rời khung có chủ đích.
5. Kiểm toàn bộ các frame sau lúc ra hết hình. Không cho tàu xuất hiện lại vì camera tiếp tục mở rộng hoặc vì đổi sang poster kết.
6. Chỉ giảm tốc/giữ root nếu đã ở đủ xa ngoài vùng nhìn. Có thể giữ 0,2 giây cuối để tương thích đoạn nghỉ đã xác minh của player, nhưng sự dừng đó không được nhìn thấy.

## Phương án nếu 8 giây không đủ tự nhiên

Ưu tiên thử một điều chỉnh nhỏ trong cách camera nhường khung về phía tuyến đã đi, vẫn giữ các mốc địa lý và tránh cắt mất vùng đích. Không mặc định thay toàn bộ góc kết hoặc crop bản đồ chỉ để ép tàu ra mép.

Nếu giữ cả camera, cỡ hình, tốc độ tự nhiên và mốc 8 giây không cùng đạt được, cần trình bày rõ lựa chọn: tăng nhẹ tốc độ rời đi, chỉnh nhẹ khung kết, hoặc thêm 1–2 giây outro. Chưa chọn kéo dài thời lượng trong bước lập kế hoạch này.

## Áp dụng năm skill

- `cinematic-director`: hành động rời khung có chức năng kết chuyện; bản đồ trống tàu là kết quả của chuyển động đã thấy.
- `motion-doctrine`: tiếp tục đúng hướng có nguyên nhân, tàu là vật dẫn rồi nhường trọng tâm cho bản đồ/chữ. Không dùng loop trôi lơ lửng để kéo dài kết bài.
- `cut-the-curve`: giữ đà và chiều chuyển động; đây là một hành động trong cùng cảnh nên không thêm một cú cắt/zoom-through/blur-cut mới.
- `cinematic-gsap-lenis-motion-system`: giữ nhịp chữ nhẹ đã duyệt; chuyển động tàu không cạnh tranh với chữ hoặc chạy dưới các nút ở cuối.
- `build-threejs-scroll-worlds`: giữ cùng thế giới và mốc địa lý; trạng thái rời khung phụ thuộc đúng thời gian video, pause/reload tái tạo đúng vị trí. Vẫn xuất video sẵn, không thêm WebGL/scroll.

## Phạm vi triển khai và kiểm tra khi được thực hiện

- Tạo bản riêng, giữ v13 đã duyệt để so sánh. Ưu tiên tái sử dụng nguyên 1.500 frame và mười clip hải trình; chỉ dựng/render lại 240 frame outro và các bản review/poster liên quan.
- Đo hình chiếu của bbox tàu theo camera đã duyệt, với tốc độ/hướng dự kiến. Tìm lần rời hết hình cuối cùng, không chỉ lần chạm mép đầu tiên.
- Xem trước các frame đầu, tăng tốc, lúc camera mở rộng mạnh, trước/sau khi ra mép và frame kết. Kiểm bóng bằng render thật; bbox mô hình không chứng minh bóng đã ra hết.
- Hợp đồng cũ “tàu đứng yên suốt outro” và “toàn bộ tàu luôn trong hình” cần đổi thành hợp đồng rời khung có chủ đích. Kiểm camera/ánh sáng/route vẫn liên tục, K10 vẫn khớp và khung kết sạch. Không tắt hết kiểm framing để cho qua.
- Cập nhật `outro.mp4`, poster kết và review 58 giây; không dùng lại poster v13 còn tàu. Khung mở đầu outro vẫn là poster K10 cũ.
- Kiểm player sau câu 10, pause/reload giữa lúc tàu rời đi, sau lúc đã ra hình, giảm chuyển động và chuyển sang màn kết. Camera/route/chữ không được nhảy khi phục hồi.
- Xem ở tỷ lệ gốc và các khung `contain` hiện có. Điện thoại letterbox cùng khung phim, không tự tạo một hướng rời tàu khác.

Không tuyên bố đã đạt “rời khung tự nhiên” trước khi có previs và lượt phát thật. Bước lập kế hoạch ban đầu chỉ gồm tài liệu và ledger; sau đó bản thử v14 đã được dựng, render và kiểm tra theo bằng chứng tại README bàn giao nêu ở đầu tài liệu.
