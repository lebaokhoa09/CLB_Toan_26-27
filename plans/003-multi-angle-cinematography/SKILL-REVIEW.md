# Rà soát kế hoạch bằng hai skill

Phạm vi: audit và cập nhật kế hoạch, không triển khai phim. Bản chuẩn sau rà soát là `PLAN.md` — bản rà soát 2; sơ đồ `camera-angle-plan.png` phải đọc cùng bản này.

Skill đã đọc đúng vị trí người dùng chỉ định:

- [cinematic-director](<C:/Users/Le Bao Khoa/.codex/skills/DirectorSKILL-Windows/DirectorSKILL-Windows/skills/cinematic-director/SKILL.md>) — dùng phần shot planning và kiểm tra chuỗi cảnh, cùng shot-plan-template, cinematic-language, production-workflow và QC checklist có liên quan.
- [build-threejs-scroll-worlds](<C:/Users/Le Bao Khoa/.codex/skills/build-threejs-scroll-worlds/SKILL.md>) — dùng phần world bible, chapter/camera ledger, bố cục chiều sâu, trạng thái xác định và kiểm tra hiển thị.

## Kết luận

Hướng đa góc đúng với yêu cầu. Bản đầu vẫn nghiêng về danh mục camera; cần làm rõ cảnh cho người xem biết điều gì, và mỗi chặng có tự đủ ý sau một lần giải toán hay không. Không có cơ sở để tuyên bố các góc mới đã đẹp hoặc đủ thoải mái trước khi dựng thử.

| Phát hiện | Điều chỉnh trong kế hoạch | Cơ sở |
|---|---|---|
| Cung 180° chia thành hai cảnh phụ thuộc vào trí nhớ qua khoảng câu hỏi dài tùy ý. | Cảnh 4 đổi mạn bằng một cung qua đuôi khoảng 90° giữa hai góc sau 3/4; cảnh 5 tự đủ ý về tàu đi trên đất. 180° là tùy chọn nếu có lý do và previs chứng minh. | Director: chức năng cảnh và trạng thái kết; world: mỗi chapter là bố cục có thể khôi phục/đọc được. |
| “Đủ 10 góc” dễ trở thành mục tiêu thay cho hành trình. | Gắn 10 cảnh với establishing/relation/transition/reveal/POV/aftermath, mốc nhìn và đầu–cuối cụ thể. | Director: beat trước shot, một chức năng/cảnh. |
| Các khoảng lens khá rải rác, chưa có bộ ngôn ngữ chung. | Chọn bộ thử 28/40/65 mm; chỉ thử 24 mm nếu góc boong cần. Không dùng zoom liên tục để tạo đa dạng. | Director: visual book và lens policy. |
| Nối cảnh mới chỉ mô tả vị trí máy, chưa đủ thông tin khôi phục và kiểm. | Thêm sổ trạng thái: camera/target/lens/up/roll, landmark, vật cản, subject, world invariants, poster và loại cut/continuous. | World: chapter và camera ledger; director: continuity anchors. |
| POV và góc thấp phụ thuộc vào địa lý/mesh chưa được thấy từ đó. | Yêu cầu lớp trước–giữa–xa, bờ thật, không xuyên lan can, không lộ mép atlas; horizon đơn giản chỉ khi cần. | World: depth, near-plane, environment continuity. |
| Máy đứng yên có nguy cơ quá rộng vì tàu đi 80,3 đơn vị trong 5 giây. | Kiểm quãng đi + kích thước tàu và cỡ hình; nếu không giữ tàu rõ thì phương án dự phòng là pan nhẹ. | Director: frame content phải đọc được; world: endpoint/path QA. |
| Quy tắc camera cũ vẫn có thể đánh rớt góc đúng hoặc bỏ lọt góc sai. | Thay gate theo loại shot; giữ pose tàu/địa lý bất biến, cho phép camera khác nhau tại cut; cấm roll/target flip và crop ngẫu nhiên. | Cả hai skill. |
| Khác tỷ lệ màn hình có thể làm mất buồm/tiền cảnh. | Giữ `object-fit: contain` đã có, thêm QA nhiều tỷ lệ và poster mới cho từng shot. Không hứa video có thể tự thay FOV theo viewport. | World: responsive composition/fallback, áp dụng đúng giới hạn video. |

## Những phần không tự động áp dụng

- Không đổi video thành Three.js, không thêm scroll conductor, raycasting, particle, thư viện mới hay trải nghiệm cuộn. Người dùng đang yêu cầu rà kế hoạch camera cho bản chiếu sẵn.
- Không mở rộng vật liệu phức tạp, gió, sóng, nhân vật hoặc soundtrack chỉ vì skill có mục đó.
- Không dùng ngân sách draw-call/DPR WebGL hay điểm rủi ro AI generation làm bằng chứng chất lượng/phát mượt cho MP4 Blender. Các giá trị đó thuộc hệ triển khai khác.
- Không tự chọn phong cách một đạo diễn có tên; tham khảo phương pháp quay không đồng nghĩa sao chép shot của phim.

Đã xác minh từ source hiện có: camera v11 vẫn một phía/43 mm; verifier còn các gate một phía, mũi hướng phải, toàn tàu trong khung; player hiện dùng contain, video preload và các kiểm tra pause/restore đã có. Những thay đổi trên là quyết định trên giấy. Chưa thay đổi native, media hay runtime.
