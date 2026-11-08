# Kế hoạch đa dạng góc máy — đề xuất v12, bản rà soát 2

Trạng thái: chỉ nghiên cứu và lập kế hoạch. Chưa thay camera, native, vật liệu, video hay website v11. Giữ 10 chặng × 5 giây, 30 fps, vật liệu đơn giản và lộ trình hiện có.

Đã rà lại bằng `cinematic-director` và `build-threejs-scroll-worlds`. Kết luận: giữ hướng đa góc, nhưng bỏ yêu cầu hoàn thành cung 180° qua hai câu hỏi; thêm chức năng cảnh, trạng thái đầu/cuối, mốc không gian và tiêu chí kiểm tra theo loại camera. Xem `SKILL-REVIEW.md` để đối chiếu thay đổi.

Phạm vi áp dụng: `cinematic-director` dùng cho ngôn ngữ cảnh và cắt dựng; `build-threejs-scroll-worlds` dùng cho tính nhất quán của thế giới, bố cục chiều sâu, mốc cảnh và trạng thái xác định. Dự án vẫn là video Blender chiếu sẵn. Không chuyển thành website cuộn/WebGL vì việc đó khác lựa chọn đã chốt của người dùng.

## Chẩn đoán đã xác minh

`blender/ship-cinematic-full-v11/build_voyage.py` dùng một camera 43 mm; các góc phương vị nền chỉ từ −108° tới −58°, cộng một phần nhỏ hướng tàu. Camera thay đổi khoảng cách và độ cao nhưng vẫn ở một phía tàu. Verifier còn bắt buộc không đổi phía trục chuyển động, mũi tàu luôn hướng phải trên màn hình, mọi điểm của toàn bộ tàu luôn nằm trước camera/trong khung, và camera khớp ma trận tại mọi mối nối.

Các điều kiện đó hữu ích cho một cú máy bám liên tục, nhưng không đủ linh hoạt cho một chuỗi cảnh có góc nhìn đối diện, nhìn dọc thân tàu, góc chủ quan hay cắt dựng. Đây là nguyên nhân thiết kế cần sửa, không phải vấn đề chỉ tăng/giảm zoom.

## Cơ sở tham khảo và cách áp dụng

- [ACMI — Exploring camera movement](https://www.acmi.net.au/education/school-program-and-resources/exploring-camera-movement/): máy tĩnh, pan, tilt và tracking có vai trò khác nhau. Áp dụng bằng một cảnh máy đứng yên và các cảnh theo tàu, thay vì mọi cảnh đều trượt quanh tàu.
- [American Cinematographer — Russell Boyd về Master and Commander](https://theasc.com/article/hell-high-water-master-commander/): Boyd mô tả phối hợp góc tổng và góc chặt, góc ngoài tàu và trên tàu; chuyển động tàu/máy có nhịp trôi, không giật. Áp dụng vào nhịp toàn cảnh → gần tàu → nhập vai → xác lập địa lý; không sao chép rung sóng hay thêm gió trong đợt này.
- [Lehigh University — Crossing the Line](https://lehigh.atlassian.net/wiki/spaces/LKB/pages/26682755/Crossing%2Bthe%2BLine%2B-%2BVideo%2BBasics): cắt bất ngờ sang phía đối diện có thể đảo quan hệ trên màn hình; quay cho người xem thấy máy đi qua trục là một cách chuyển phía. Áp dụng một cung vòng qua đuôi tàu có chủ đích.
- [Film Education — Terminology](https://www.filmeducation.org/resources/secondary/teaching_with_film/film_in_the_classroom/terminology/): góc chủ quan giúp người xem nhận vị trí của người đang nhìn. Áp dụng một góc ở mũi tàu, có lan can/mũi tàu làm tiền cảnh để người xem nhận biết chỗ đứng.

Các lựa chọn cảnh dưới đây là đề xuất nghệ thuật cho dự án, không phải công thức bắt buộc của điện ảnh. Thông số tiêu cự và cung máy là điểm xuất phát để duyệt previs, chưa được kiểm nghiệm bằng render.

## Quy tắc chung cho cả hành trình

Luân phiên ba mức tiếp cận: nhìn tàu trong địa lý rộng, nhìn rõ cấu trúc và chuyển động tàu, rồi đứng ở điểm nhìn trên tàu trước khi trở lại bản đồ. Mỗi góc phải cho thấy một quan hệ không gian mới; tên góc hoặc một con số vòng quay không tự tạo thành lý do dựng cảnh.

- Giữ cùng tàu, số cột/bộ buồm, tỷ lệ tàu–atlas, đường đi, điểm dừng và chiều tiến thật. Đơn vị là đơn vị cảnh đã dùng ở v9, không phải khoảng cách địa lý thực; không đổi scale giữa các shot.
- Sun giữ hướng trong thế giới; vật liệu, phơi sáng và bảng màu giữ nhất quán. Kiểm tra mạn đối diện có đủ chi tiết thay vì quay nắng theo camera.
- Dùng bộ lens dự kiến 28 / 40 / 65 mm trên cảm biến rộng 36 mm. 24 mm chỉ là phương án thử cho góc boong nếu 28 mm không đủ trường nhìn. Chọn khoảng cách máy để đạt cỡ cảnh; không xem đổi lens đơn thuần là đổi phối cảnh.
- Một hành động chính của tàu và một hành vi camera chủ đạo mỗi shot. Cảnh 10 dùng một đường nâng–lùi chéo liên tục, không xếp thêm orbit, zoom hay tilt riêng vào cùng 5 giây.
- Không thêm nhân vật để giải thích góc boong. Đây là điểm nhìn giả định của người xem trên tàu, không phải cảnh nhìn qua mắt một nhân vật đã có diễn xuất.
- Mỗi cảnh chọn một mốc nhìn chính và quan hệ trước–giữa–xa. Không chuyển bờ, đảo hoặc bóng sang tọa độ khác để chiều theo góc máy.

## Danh sách 10 cảnh đã chỉnh

Quy ước mạn trái/phải theo người đứng trên tàu nhìn về mũi. Giữ 16:9. Các cỡ cảnh và lens sau là điểm xuất phát, chưa phải thông số đã được render chứng minh. Chức năng cảnh dùng nhóm của skill; rủi ro được ghi bằng lỗi cần tìm, không tự chấm điểm an toàn khi chưa có keyframe.

| Chặng / chức năng | Khung, camera và lens dự kiến | Đầu cảnh → hành động → trạng thái kết | Mốc nhìn và rủi ro cần kiểm chứng |
|---|---|---|---|
| 1 — Peru / Establishing | Toàn cảnh 3/4 sau mạn phải, bám theo; 40 mm. | Tàu và bờ cùng đọc được → tiếp cận bờ → tàu dừng, còn khoảng trống phía trước. | Bờ Peru ở lớp giữa; tránh mở quá rộng khiến tàu giống một dấu chấm. |
| 2 — Brazil / Relation | Nhìn gần trục đuôi về trước, bám theo; 40 mm. | Đuôi ở tiền cảnh → thấy boong và tuyến đi phía trước → khung dừng vẫn đọc được chiều sâu thân tàu. | Mốc là đuôi–boong–nền Brazil; lệch nhẹ trục nếu các cột buồm chồng kín nhau. |
| 3 — Đại Tây Dương / Transition | Máy trước mũi nhìn ngược về tàu, lùi theo; 40 mm. | Nhận ra mũi tàu → tàu tiến theo chiều sâu, bờ phía sau rời dần → mũi vẫn rõ khi dừng. | Bờ Nam Mỹ phía sau tàu nếu nằm trong khung thực tế; không dựng một bờ giả để lấp nền. |
| 4 — Tây Phi / Reveal | Một cung ngắn qua đuôi từ 3/4 phải sang 3/4 trái, dự kiến khoảng 90°; 28 mm. | Khung 3/4 phải → nhìn thấy máy qua trục đuôi và đường bờ mở ra → dừng ở 3/4 trái, cả tàu và bờ rõ. | Mốc là bờ Tây Phi. Ví dụ góc tương đối từ −135° qua −180° tới −225°: đổi mạn bằng 90°, không cần quay 180°. Nếu không tạo được reveal địa lý, giảm cung hoặc chọn đường máy khác. |
| 5 — Trung Phi / Relation | Bám 3/4 mạn trái, cỡ gần hơn cảnh 4; 40 mm. | Mạn trái đã được thiết lập → thấy tàu đi trên atlas lục địa → dừng với thân tàu và bóng trên đất rõ. | Mốc là quan hệ tàu–bóng–lục địa. Đây là cảnh tự đủ ý, không phải nửa sau của một vòng quay còn dang dở trước câu hỏi. |
| 6 — Đông Phi / Transition | Bám ngang mạn trái, góc thấp vừa phải; 40 mm. | Tàu trên nền đất → đường bờ trôi về sau → tàu dừng trên biển với bờ cũ còn làm mốc. | Mốc là mép Đông Phi. Kiểm tra silhouette buồm/thân, độ sáng mạn trái và đường chân trời. |
| 7 — Biển Ả Rập / Relation | Máy cố định trong thế giới, cùng phía mạn trái; 65 mm. | Tàu ở vùng phải → tự đi qua khung → dừng trong vùng trái, chưa ra ngoài hình. | Tàu là mốc chuyển động; nếu bờ Ấn Độ thực sự vào khung thì dùng làm mốc phụ. FOV phải chứa quãng đường, không được thu tàu quá nhỏ chỉ để giữ camera tĩnh. |
| 8 — Andaman / Point-of-view | Điểm nhìn trên mũi tàu, theo cứng vị trí/hướng tàu; 28 mm, thử 24 mm nếu cần. | Thấy mũi/lan can ở mép dưới và bờ phía trước → tiến giữa các lớp cảnh → dừng với mục tiêu bờ/đảo còn rõ. | Tiền cảnh là boong thật, lớp giữa là bờ/đảo đã có, lớp xa là nền biển/horizon. Tránh xuyên lan can, lộ mặt mesh khuất hoặc chỉ thấy một mảng biển trơn. |
| 9 — Biển Đông / Establishing | Góc cao 65–80°, dịch chéo nhẹ; 28 mm. | Tàu và cụm đảo hiện đồng thời → tuyến qua quần đảo đọc được → dừng ở một toàn cảnh có thể định hướng. | Mốc là bố cục đảo; giữ hướng Bắc nhất quán, tránh roll/lật target khi máy gần thẳng đứng. |
| 10 — Tây Thái Bình Dương / Aftermath | Góc thấp 3/4 trước mạn trái, một đường nâng–lùi chéo; 40 mm. | Tàu là chủ thể rõ → mở dần không gian → dừng tại mốc 10, có khoảng thở trước câu hỏi cuối. | Dùng nhóm đảo hiện có nếu thật sự thấy, nếu không dùng tàu trên khoảng biển rộng. Không tự thêm bến cảng hoặc coi đây là màn kết trò chơi trước khi câu 10 được trả lời. |

Không ép mọi cảnh phải khác nhau bằng mọi giá. Chỉ tránh các cảnh cạnh nhau lặp cả góc, cỡ hình và thông tin. Mỗi cảnh phải xem hiểu độc lập sau một khoảng làm câu hỏi dài tùy ý; sự liền mạch của bản review 50 giây không được là điều kiện để hiểu bản trò chơi.

## Cắt dựng và hướng di chuyển

Không yêu cầu 50 giây phải là một cú máy liên tục. Mỗi chặng thường là một shot 5 giây; màn câu hỏi tạo điểm ngắt để cảnh tiếp theo có thể bắt đầu bằng góc mới. Tuy vậy, thời gian chờ câu hỏi không tự giải quyết việc mất phương hướng: góc dọc trục, mốc bờ và chuyển trục nhìn thấy được vẫn phải được bố trí.

Đề xuất các mối nối:

- 1→2: cắt từ toàn cảnh sang đuôi tàu; giữ cùng vị trí/hướng tàu và mốc bờ.
- 2→3: đổi từ nhìn theo sang nhìn ngược trên/gần trục tiến; chốt bằng mũi tàu và khoảng không phía trước, không dùng đảo ảnh ngang.
- 3→4: cắt từ chính diện sang mạn phải rồi mới bắt đầu cung máy; đây là cú đổi góc lớn có chủ đích.
- 4→5: cắt từ cảnh reveal ở 3/4 trái sang cảnh tàu trên đất cùng phía; đổi góc đủ rõ hoặc cỡ hình đủ rõ, không tạo một cú nhảy nhỏ trên cùng trục. Không còn nghĩa vụ nối tiếp một orbit.
- 5→6: cắt sang profile mạn trái để thấy chuyển tiếp đất–biển; giữ vị trí/hướng tàu và đường bờ tương thích.
- 6→7: cắt sang cảnh máy đứng yên ở cùng phía trục đã thiết lập.
- 7→8: cắt vào góc chủ quan có mũi tàu/lan can nhận diện; giữ hướng địa lý qua bờ/đảo trước tàu.
- 8→9: cắt ra góc cao để khán giả xác lập lại toàn cảnh.
- 9→10: cắt từ góc cao sang góc thấp mạn trái, rồi mới thực hiện cú nâng/lùi kết.

Vị trí, hướng, tốc độ và mốc câu hỏi của tàu không đổi. Camera chỉ phải khớp ma trận ở các mối nối được khai báo là liên tục; một cú cắt dựng phải khớp ý nghĩa không gian, không cần khớp ma trận camera.

Khi triển khai, dùng camera theo shot và mốc cắt rõ ràng, thay vì kéo một camera đi vòng để ép mọi góc nối liên tục. Mỗi mối nối phải ghi `cut` hoặc `continuous`; nếu chọn `continuous` thì kiểm tra khớp camera thật sự. Tiêu cự giữ ổn định trong mỗi shot; đổi lens tại mốc cắt. Kiểm tra projection chuyển từ “cả phim luôn 43 mm” thành “mỗi shot đúng lens đã khai báo”. Hướng chạy trên màn hình có thể đổi sau một lần chuyển trục đã được nhìn thấy; hướng tiến thật trên bản đồ vẫn giữ nguyên.

## Cung quay và nhịp 5 giây — đã sửa

180° vẫn là phương án phụ, không phải quota phải đạt. Việc chia 90° + 90° qua hai câu hỏi có thể mượt trong bản xem liền nhưng mất mạch khi người xem dành nhiều thời gian giải toán. Phương án chính mới là đổi mạn ngay trong cảnh 4 bằng cung ngắn qua đuôi, bắt đầu/kết thúc ở hai góc 3/4 phía sau. Cảnh 5 làm công việc khác: cho thấy tàu di chuyển trên lục địa.

Khoảng quay chủ động tương đương 4,2 giây cho tốc độ góc cruise khởi điểm khoảng 21°/giây ở cung 90°. Đây chỉ là tính toán ngân sách, không phải ngưỡng dễ chịu đã chứng nhận; tốc độ góc tương đối tàu cũng không bằng tốc độ ảnh trên màn hình. Đo chuyển động nền, target và gia tốc khi thử. Nếu cần giảm tốc, rút ngắn cung thay vì làm vòng cung kỳ dị hoặc kéo dài chặng quá 5 giây.

Các cảnh khác: khoảng 0–0,5 giây để đọc bố cục trong lúc tàu bắt đầu chạy, phần giữa cho một động tác chính, phần cuối giảm tốc; giữ 4,8–5,0 giây đứng yên đúng như hiện tại. Máy đứng yên ở cảnh 7 không cần tự động thêm chuyển động trang trí. Góc POV chỉ chuyển cùng tàu; gió/sóng/rung máy vẫn để sau.

Nhịp 5 giây là ràng buộc của trò chơi, không phải một quy tắc dựng phim. Tạo nhịp khác nhau bằng thời điểm thông tin lộ ra, cỡ cảnh, độ sâu và camera tĩnh/động; không thêm nhiều cú cắt trong 5 giây để bù sự đồng đều về thời lượng.

## Sổ trạng thái của thế giới và player

Mỗi cảnh phải ghi trước khi đặt keyframe: `id`, chức năng, mốc chính, lớp trước/giữa/xa, subject cần thấy, camera đầu/cuối, lens/FOV và aspect, target/up/roll, vật cản, near/far, trạng thái tàu/ánh sáng đầu–cuối, kiểu nối, ảnh nghỉ và rủi ro riêng. Không điền tọa độ máy tưởng tượng rồi coi là đã đo; các giá trị cụ thể phải lấy từ native và ảnh previs.

- **Nguồn điều khiển:** `leg + videoTime` / frame là trạng thái chính xác. Pause, seek, phát lại và reload cùng vị trí phải khôi phục cùng cảnh và ảnh; không dùng thời gian đồng hồ hệ thống hay easing DOM để quyết định đã tới câu hỏi hay chưa.
- **Thế giới chung:** camera có thể cắt, nhưng tàu và atlas vẫn là cùng một không gian. Không nhân bản địa lý, đảo hướng bản đồ hoặc dịch landmark theo shot để che một mối nối sai.
- **Nền cho góc thấp:** rà vùng gần và xa trước. Nếu lộ mép atlas, chỉ thêm phần nền/horizon đơn giản phù hợp phong cách khi thật sự cần; không dùng blur, bloom hay sương dày để giấu bố cục yếu.
- **Khung hiển thị:** đích chính là 16:9 / 720p hiện có. CSS đang dùng `object-fit: contain`, nên giữ cách đó ở màn khác tỷ lệ; kiểm tra 16:10, tablet và điện thoại để tránh cắt buồm/lan can. Video không thể tự thay FOV theo màn như camera Three.js.
- **Luồng câu hỏi:** phim giảm tốc rồi giữ hình trước khi hiện nội dung toán. Không vừa quay mạnh vừa yêu cầu đọc bài. Ảnh nghỉ và khung cuối phải cùng góc, grade và landmark; không dùng lại poster v11 cho góc v12.
- **Tải và lỗi:** giữ cơ chế sẵn có về preload clip sau, media theo manifest, pause/restore và giảm chuyển động. Bộ v12 chỉ thay mặc định sau khi đủ 10 clip và poster được kiểm tra. Có ảnh nghỉ đúng cảnh khi clip chưa sẵn sàng hoặc lỗi.

## Những điều cần kiểm tra trước khi triển khai render đầy đủ

1. **Mô hình và khung cảnh:** góc đuôi/mũi có thể làm cột buồm chồng nhau; kiểm tra từng vị trí thay vì cưỡng ép chính giữa. POV có thể lộ mặt khuất, xuyên lan can hoặc mép atlas/đường chân trời giả; dùng vị trí mắt hợp lý, tiền cảnh có chủ đích và nền/horizon đơn giản khi cần. Chưa hứa các góc này đã đẹp với mesh hiện có.
2. **Tiêu chí theo shot:** cảnh ngoài tàu cần silhouette/hull/buồm rõ; cảnh POV chủ động chỉ có phần tàu trong khung. Bỏ yêu cầu “mọi điểm của tàu luôn nằm trước camera” đối với POV, thay bằng không xuyên hình học, mốc nhìn rõ và khung hình có chủ đích.
3. **Trục và hướng màn hình:** đánh dấu cùng phía, dọc trục, hoặc chuyển trục có nhìn thấy. Không tiếp tục dùng một assertion “mũi luôn hướng phải” cho cả 10 cảnh, cũng không tắt toàn bộ kiểm tra hướng.
4. **Ánh sáng:** giữ hướng Sun cố định trong thế giới. Rà mạn trái, mặt trước và đuôi để giữ thân tàu rõ; không quay mặt trời theo camera để mọi góc đều có cùng một mảng sáng.
5. **Duyệt bố cục trước:** storyboard khoảng 20–30 khung, gồm đầu/giữa/cuối và điểm chuyển trục. Rà như ảnh nhỏ và ảnh xám để tìm chủ thể. Cảnh 4 phải thực sự lộ thông tin địa lý, không chỉ đổi mặt tàu.
6. **Ba phép thử ưu tiên:** cung đổi mạn 4; boong 8; máy tĩnh 7. Ở cảnh 7, quãng đi 80,3 đơn vị cộng chiều dài tàu khoảng 23,8 đã cần vùng nhìn hơn 104 đơn vị trước khi thêm margin. Tính này chỉ là ước lượng không phối cảnh. Nếu khung đủ rộng làm tàu quá nhỏ, dùng một pan nhẹ có kiểm soát thay vì cố giữ máy tĩnh.
7. **Kiểm tra theo shot:** cảnh ngoài tàu kiểm silhouette/cỡ hình; boong kiểm mốc nhìn và xuyên hình học; góc cao kiểm up-vector/roll; orbit kiểm tốc độ ảnh, target flip và che khuất trên toàn đường chứ không chỉ ở hai đầu. Các thông số chưa đo được phải ghi là chưa kiểm chứng.
8. **Duyệt đúng cách sử dụng:** xem bản liền và thử quay lại sau khoảng câu hỏi ngắn/dài. Không được cần nhớ nửa orbit trước đó mới hiểu được cảnh mới. Kiểm 9 điểm nối theo loại `cut/continuous`, 10 khoảng nghỉ, poster, pause/restore, tab ẩn, giảm chuyển động và khung khác tỷ lệ.

Chưa chấm điểm “đạt điện ảnh” hoặc Gate PRE/SEQUENCE của skill vì chưa có keyframe/previs mới. Rubric lỗi sinh AI về khuôn mặt, tay hoặc model hallucination không được biến thành điểm tin cậy cho Blender. Ở đây kiểm trực tiếp geometry, camera, khung hình, trạng thái và bản phát thật.

Đầu ra của bước lập kế hoạch này: tài liệu và sơ đồ vị trí camera. Chưa chạy Blender, chưa xuất storyboard render, chưa sửa bản v11 đang dùng.
