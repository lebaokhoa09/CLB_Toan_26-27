# 002 — Lập hải trình cong trên một bản đồ lớn, hữu hạn

## Implementation record — 2026-10-25

The implementation below supersedes the original planning coordinates and asset estimates. The original plan is retained as design history; `dist/route.js` is the runtime source of truth, not `preview.html` or the historical `route-spec.json`.

- One finite logical atlas of9600×3200 uses an actual6144×2048 native vector/procedural render in three2048² panels. World-atlas2.0.2/Natural Earth4.1.0 coasts replace the planning raster. Projection: X=(.10+.80*(lon+180)/360)*9600, Y=(85-lat)/180*3200; no repeat wrapping, labels, markers or route strokes.
- One C2 cubic B-spline with a30001-entry arc-length lookup uses control points refined against those actual coasts. Total distance7789.34246; ten equal legs778.93425units, six seconds each, retaining0.18s ramps. Average129.82237units/s preserves the accepted130units/s pace.
- An opaque authored three-masted vessel turns in physical world yaw, using the analytic route tangent. Its target width is260 logical units; the display quad never rolls, warps or blends poses. The model has10draw calls and70444triangles. A768² MSAA render target is independent of display DPR; a viewport double-scaling bug found at DPR2 was corrected before publication.
- Asset gates: the chart has new native coast detail rather than an upscale of the old2172×724 raster; ship heading uses real geometry rather than a rotated photograph. Both are stylized reconstructions in the navy/violet/gold, dark wood and cream palette, not an exact copy of the reference film.
- `runtime-route-check.json`:10001 route samples, zero land hits, minimum center-to-shore clearance273.75 logical units, maximum sampled heading rate21.87°/s. Adjacent leg endpoint/tangent states match exactly; camera footprints remain within the finite atlas.
- `ship-framing-check.json`:10001 route points and160 model orientations; full projected model remains inside1920×1080, including the southern camera clamp. Browser captures verify the HiDPI render target correction; algebraic framing alone did not detect that renderer viewport bug.
- Device FPS is not certified: the in-app browser can throttle its background frame loop. Do not present its throttled intervals as projector performance or claim60FPS from screenshots.
- The final supported-browser run completed questions1–10, immediate answer locking (correct and wrong), manual continuation, pause/resume, closing and Home→lobby. Black standby measured5005ms in one visible-time run; console warning/error list empty. Evidence is outside the deployment at `../motion-evidence/curved-deploy/flow-proof.json`, `final-1920.jpg`, `final-turn-1920.jpg` and `final-1440.jpg`. The large-viewport native screenshot adapter returned a cropped frame, so `final-user-2877.jpg` is not full-viewport evidence. Geometry-based framing checks remain valid independently of that capture limitation.

The following sections describe the original pre-implementation plan.

- **Status**: DONE — implementation and ten-question desktop flow verified2026-10-25; publication tracked separately.
- **Baseline commit**: e16168f (bản đường thẳng đã xuất bản trước lần sửa này).
- **Severity**: HIGH.
- **Category**: Physicality, spatial consistency, camera choreography.
- **Estimated scope**: route.js, world.js, mô tả cảnh trong index.html; tài nguyên bản đồ/hướng tàu; giữ nguyên logic câu hỏi và thời gian.

## Problem — những gì hai video và mã nguồn xác nhận

Người dùng đã chấp nhận tốc độ mới. Yêu cầu mới là tàu nhỏ hơn cả video gốc, bản đồ lớn hơn cả video gốc và hải trình cong/vòng, đủ10câu mà ít lặp cảnh. Phải thiết kế đường đi trước khi sửa chuyển động.

`dist/route.js:3` hiện đặt LEG_DISTANCE=780, LEG_DURATION=6; START=[720,620], mười điểm đều thẳng hàng theoX. Tổng quãng đường7800 trong60giây chạy tàu. `dist/world.js:16` đặt chiều rộng bản đồ từ tỷ lệ2172/724*1080=3240, rồi dùng RepeatWrapping. `dist/world.js:47` đặt shipWidth=500. Cơ chế này có thể chạy mãi nhưng sẽ lặp cùng lục địa khoảng2.4vòng trong một lượt10câu.

Mã hiện tại cần giữ làm mốc đối chiếu:

```js
// dist/route.js
export const LEG_DISTANCE=780;
export const LEG_DURATION=6;
export const RAMP_SECONDS=.18;
export const START=[720,620];
// STOPS: START.x + 780 * (i + 1), START.y

// dist/world.js
const tileWidth=chartTexture.image.width/chartTexture.image.height*1080;
chartTexture.wrapS=THREE.RepeatWrapping;
// ...
const shipWidth=500;
```

`dist/app.js:80` đã có đúng đồng hồ dùng GSAP, pause/visibility holds và chuyển sang câu hỏi ở onComplete. Không thay đồng hồ bằng10tween tọa độ độc lập.

## Target — tỷ lệ, thời gian và ranh giới rõ ràng

| Thành phần | Hiện tại | Mục tiêu kế hoạch |
| --- | --- | --- |
| Tàu ở khung1920×1080 | Rộng500đơn vị, khoảng26%khung | Rộng260đơn vị, khoảng13.5%khung; nhỏ hơn48%theo bề ngang hiện tại |
| Mặt bản đồ | Một ô3240×1080lặp ngang | Một bản9600×3200hữu hạn; chiều ngang và dọc đều gần2.96lần |
| Tài nguyên bản đồ | Native2172×724 | Cần master có chi tiết thật ít nhất6144×2048 hoặc vật liệu nhiều mức chi tiết đã kiểm chứng; không đổi nhãn file để gọi ảnh cũ là4K |
| Quãng đường toàn tuyến | 7800đơn vị | Khoảng7790.68đơn vị, khác khoảng−0.12% |
| Mỗi chặng | 780đơn vị/6s | Khoảng779.068đơn vị/6s, chia theo độ dài cung |
| Tốc độ trung bình | 130đơn vị/s | Khoảng129.84đơn vị/s; giữ cảm giác tốc độ đã được chấp nhận |
| Khởi hành/dừng | Ramp0.18s ở mỗi đầu | Giữ nguyên0.18s mỗi đầu, cruise5.64s |
| Nền khi đi qua câu hỏi | Giữ world coordinate | Giữ nguyên cả độ dài cung, vị trí tàu, hướng tàu và vị trí máy quay |

Đơn vị trên là tọa độ cảnh quy chiếu khung1920×1080, không phải pixel nguồn hoặc kilomet. Bản đồ lớn hơn không có nghĩa thấy nhiều lục địa hơn trong cùng một khung: máy quay nhìn một phần nhỏ hơn của bản đồ, với tàu nhỏ hơn bên trên. Các khung liền nhau vẫn có vùng chồng lấn để tạo chuyển động liên tục; mục tiêu bỏ vòng lặp atlas, không hứa mỗi khung đều hoàn toàn khác nhau.

## Route — tuyến đường đã tính trước

Xuất phát ngoài khơi phía tây Nam Mỹ → vòng dưới mũi Horn → uốn lên giữa Nam Đại Tây Dương → vòng xuống dưới châu Phi → đi ngang Nam Ấn Độ Dương → vòng phía nam châu Úc/New Zealand → kết thúc ở Nam Thái Bình Dương. Không nối điểm đầu với điểm cuối và không quay vòng bản đồ.

| Đến câu | Khu vực minh họa | Tọa độ cảnhX,Y, làm tròn để đọc | Dạng chuyển động |
| --- | --- | --- | --- |
|0|Xuất phát|1901,1591|Vào tuyến từ vùng biển trống|
|1|Ven phía tây Nam Mỹ|2222,2294|Cung xuôi xuống, tiến về phía nam|
|2|Vòng mũi Horn|2696,2873|Cua lớn dưới cực nam Nam Mỹ|
|3|Nam Đại Tây Dương|3381,2666|Thoát cung, uốn lên hướng đông bắc|
|4|Uốn lên giữa Đại Tây Dương|3871,2103|Đỉnh cung phía bắc, đổi hướng trơn tru|
|5|Vòng tây nam châu Phi|4444,2562|Cung xuống, tránh thân lục địa|
|6|Nam Ấn Độ Dương|5155,2831|Cung đáy rộng, không gập góc|
|7|Tiếp cận phía tây châu Úc|5892,2611|Cung lên trước khi vòng xuống dưới Úc|
|8|Vòng phía nam châu Úc|6600,2869|Cung xuống tránh lục địa|
|9|Phía nam New Zealand|7368,2952|Cung đáy rộng, chuyển hướng dần|
|10|Nam Thái Bình Dương|8133,2807|Thoát cung và đến câu cuối|

Tên khu vực mô tả vị trí trên tranh bản đồ, không gán thêm sự kiện lịch sử hoặc thay đổi nội dung PDF. Không hiển thị tên khu vực/số điểm/đường sáng trên bản trình chiếu. Đường sáng và số0–10chỉ dùng trong bản kế hoạch.

## Curve specification — không nối10điểm bằng đoạn thẳng

**Nguồn duy nhất:** `plans/002-curved-voyage/route-spec.json`. Các tọa độ trong bảng trên chỉ để đọc; executor dùng số đầy đủ trong JSON. File `build-plan.py` tái tạo đường và kiểm tra. `arc-samples.json` là1001mẫu đối chiếu, không phải một atlas ảnh.

Đường là open clamped cubic B-spline, degree3,16control points ở hệ tọa độ nguồn2172×724:

```text
(430,360) (480,420) (500,550) (580,660)
(730,665) (780,580) (830,470) (950,470)
(1000,610) (1170,650) (1280,620) (1350,540)
(1430,600) (1510,665) (1670,680) (1840,635)
```

Knot vector: bốn số0, các số1/13đến12/13, bốn số1. Nhân tọa độ với9600/2172 và3200/724. Spline có độ trơnC2ở các knot nội bộ, không có điểm nhọn; không dùng đường đi ngẫu nhiên, sin chồng lên vị trí tàu, hoặc Catmull-Rom mặc định có nguy cơ vọt quá hành lang đã tính. Không bắt buộc đường đi qua từng control point. Điểm câu hỏi được lấy trên đường sau khi tính tổng độ dài.

Tạo bảng arc-length ít nhất30001mẫu ở initialization. Dùng tìm nhị phân bảng tích lũy để đổi độ dài cung thành tham số spline; không dùng trực tiếp tiến độ thời gian làm tham sốu vì tốc độ sẽ thay đổi theo mật độ control point.

Chặngi dùng độ dài cung:

```js
const s = (i + travelProgress(progress)) * totalArcLength / 10;
const point = sampleAtArcLength(s);
// progress vẫn do một tween GSAP6s,ease:'none' điều khiển.
```

Giữ nguyên hàm travelProgress hiện có với ramp0.18/6ở mỗi đầu; không thêm ease dài làm cảm giác tốc độ chậm trở lại. Cả10điểm lấy từ cùng một spline và cùng bảngarc-length; không tạo lại một curve riêng khi bấm Tiếp tục. Sample cuối chặngi và sample đầu chặngi+1phải đồng nhất, gồm vị trí, tangent/hướng và máy quay.

## Camera choreography

- Giữ góc nghiêng bản đồ, camera orientation và zoom cố định trong mỗi lượt; không xoay máy quay theo từng khúc cua hoặc zoom vào/ra khi đến câu hỏi.
- Camera target dựa trên điểm nhìn trước120đơn vị theo **độ dài cung**, không theo thời gian khung hình. Đặt điểm nhìn trước tại anchor[800,650]trong khung1920×1080.
- Camera top-left giới hạnX[0,7680],Y[0,2120]. Trong dải180đơn vị gần mép, dùng clamp trơnC2: `180*(6*t^3-8*t^4+3*t^5)`ở mép dưới, đối xứng ở mép trên. Ngoài ranh giới giữ tại biên.
- Đây là hàm thuần của vị trí toàn tuyến, không dùng lerp phụ thuộcFPS hoặc một camera tween chạy lệch đồng hồ tàu. Dừng/tiếp tục không tạo quỹ đạo máy quay khác.
- Ở gần mép nam bản đồ, tàu được phép dịch nhẹ trong khung thay vì ép máy quay vượt nền. Kiểm tra hiện cho thấy anchor tàu nằm trongX[680,800],Y[520,843]; còn chỗ cho toàn bộ ảnh tàu rộng260.
- Giữ tọa độ camera ở sau slide. Không gọi reset về đầu tuyến hoặc đầu ô texture khi quay lại.

## Ship heading — phải giải quyết trước khi coi là hoàn thành

Tàu hiện là một ảnh1254×1254có góc nhìn cố định. Dời ảnh theo đường cong **không tự tạo được yaw3Dđúng**. Không xoay cả tấm ảnh quanh trục màn hình để giả quay hướng: sẽ làm cột buồm nghiêng như tờ giấy, tái tạo cảm giác sai mà người dùng đã phản ánh. Cũng không crossfade hai pose trong suốt hoặc warp optical-flow, vì đã gây hiện tượng liquid glass trước đây.

Khi dựng, trước tiên làm một thử nghiệm hướng tàu tại ba tangent đại diện: xuôi nam ở chặng1, thoát cua hướng đông bắc ở chặng3, và hướng đông ở chặng6. Mũi tàu phải cùng hướng tiếp tuyến; cột buồm giữ thẳng đứng theo thế giới; hình thân và dây buồm phải kín, không double exposure. Chỉ dùng mô hình/pose có các góc nhìn thật sự phù hợp với vật liệu tàu hiện tại. Không thay tàu bằng mô hình đơn giản hơn để né vấn đề.

**Gate:** nếu tài nguyên hiện có chưa biểu diễn được các hướng này, báo rõ giới hạn và hoàn thiện tài nguyên hướng tàu trước khi xuất bản; không đánh dấu fixed-heading preview là bản tàu đã quay đúng. Bản `preview.html` cố ý giữ pose cũ để kiểm tra riêng hình học/tỷ lệ/camera, và đã ghi giới hạn này ngay trong trang.

## Asset gate — tránh phóng bản đồ rồi đồ họa lại mờ

Tranh hiện chỉ có2172×724pixel native. Khi trải lên cảnh9600×3200, mỗi texel phủ khoảng4.42đơn vị cảnh. Cần tài nguyên chi tiết hơn hoặc bộ vật liệu nhiều mức chi tiết được kiểm chứng ở khung1920×1080. Mục tiêu master tối thiểu6144×2048native, giữ cùng navy/violet/gold, bề mặt bản đồ và ánh sáng. Nếu quy trình tạo ảnh chỉ trả output nhỏ hơn, ghi kích thước thật và không đánh dấu gate này đạt.

Không coi upscale thông thường là phục hồi chi tiết mới. Khi dùng mipmap/anisotropy hoặc shader hạt bề mặt, phải phân biệt độ sắc của bờ biển với hạt trang trí; hạt không thay thế được chi tiết bờ biển. Không đưa texture lặp cả thế giới trở lại. Không còn cần shader vá đường nối đại dương của phiên bản RepeatWrapping. Giữ3draw calls nếu dùng cùng mô hình2.5D; nếu đổi tài nguyên tàu3D, đo lại ngân sách thực, không giữ số cũ trong báo cáo.

## Repo conventions to follow

- `dist/app.js` giữ một GSAP tween progress, pause/visibility holds, epoch guards và onComplete→arrive. Không thêmLenis/ScrollTrigger vì đây là trình chiếu theo thời gian, không cuộn.
- `dist/route.js` vẫn là module lấy mẫu hình học thuần; exportSTOPS,START,LEG_DURATION tương thích logic câu hỏi. Bổ sung pose/tangent/arc-length trong cùng module, tránh hai định nghĩa tuyến khác nhau.
- `dist/world.js` tiếp nhận trạng thái rồi đặt vị trí/hướng; không khởi tạo texture, curve hoặc material trong mỗi frame. Tạo bảngarc-length và dữ liệu hướng một lần.
- Reduced motion: dùng endpoint tĩnh và chuyển slide nhẹ, không chạy spline không cần thiết. Tạm dừng nền khi tab ẩn. Không thêm lắc, nhấp nhô, biển động hoặc hover effect.
- Giữ thư viện local, câu hỏi, phông chữ, phần mở đầu và kiểu phản hồi hiện tại.

## Steps — thứ tự triển khai có cổng kiểm tra

1. **Khóa hình học:** xem overview, kiểm tra tuyến thực sự ngoài lục địa; cập nhật bờ biển/mask bảo thủ. Mẫu30001điểm phải qua các assert; điểm có bờ gần phải kiểm tra cả footprint thân tàu, không chỉ tâm. Mốc mong muốn: thân tàu còn ít nhất80đơn vị trống tới bờ; nếu thiếu, chỉnh control point rồi tính lại toàn bộarc-length/điểm dừng/camera.
2. **Chốt tài nguyên:** qua hai gate về độ nét bản đồ và hướng tàu. Không sửa world renderer trước khi các mẫu kiểm tra cho ra chất lượng chấp nhận được.
3. **Đổi route sampler:** xâyC2spline vàarc-lengthLUT, giữ6s và ramp0.18s; STOPS lấy từ cùng đường.
4. **Đổi world:** bỏRepeatWrapping và shader vá mép; đặt một atlas9600×3200, tàu260và shadow cùng tỷ lệ. CameraXYtheo hàm đã đặc tả, giữorientation/zoom.
5. **Ghép câu hỏi:** giữ endpoint/heading/camera sau mỗi slide; A–Dchốt ngay; Tiếp tục đi đúng chặng kế tiếp. Không thêm dấuX, đường route hoặc nhãnCâu lên màn hình khán giả.
6. **Xem trước ba chặng đại diện:**1,3,6ở tốc độ thật và quay chậm để tìm cú giật, cua sai hướng, cột buồm nghiêng, clipping mép hoặc nhòe.
7. **Kiểm tra toàn bộ10câu:** mouse/keyboard, pause/resume, tabẩn, chốt sai, bấmContinuelặp, câu10, kết thúc, khởi động lại. Không giữ view cũ bị crop làm bằng chứng toàn khung.
8. **Chỉ xuất bản sau QA:** giữ quyềnriêngtư hiện tại, lưu bản trước để đối chiếu/khôi phục. Cập nhật DESIGN,PRODUCT,WORLD-BIBLE và provenance theo tài nguyên thực tế. Bản kế hoạch này tự nó không phải bằng chứng bản mới đã chạy.

## Boundaries

Không đổi nội dungPDF, thời lượng chặng6s, màn đen5s, thứ tự10câu, cách chốtA–Dhoặc thao tác Tiếp tục. Không thêm giao diện điện thoại, HUD, nút chỉnh sửa khán giả, marker, đường kẻ đứt hoặc lặp atlas. Không cài thêm thư viện cuộn. Không hứa giống100%video3Dnếu chưa có tài nguyên quay hướng tương ứng.

## Verification — kết quả đã có và các mục chưa đạt

Bản nháp đầu có một cung quá gắt (bán kính ước tính khoảng148đơn vị); đã sửa control point trước khi lập đặc tả cuối. Tuyến hiện có bán kính cua nhỏ nhất ước tính khoảng340đơn vị, lớn hơn ngưỡng kiểm330đơn vị. Tốc độ đổi hướng lớn nhất tại cruise ước tính22.55độ/s. Đây là tính toán trên đường, chưa chứng minh tài nguyên tàu đã quay đúng.

**Đã tính/kiểm:** `python plans/002-curved-voyage/build-plan.py`pass.30001mẫu, X tăng nghiêm ngặt nên tuyến không tự cắt, không có đoạn có độ dài0, toàn bộ tuyến trong atlas,10điểm phân biệt; khoảng cách thẳng nhỏ nhất giữa hai điểm kế tiếp khoảng715.41. Camera footprint luôn trong atlas, tàu không ra mép khung. Mỗi chặng bằng1/10độ dài cung, nên tốc độ trung bình bằng nhau.

**Đã xem bằng mắt:** overview trên bản đồ hiện tại; đường đi vòng dưới ba lục địa và các cung đủ rộng. Tên khu vực là minh họa, không độ chính xác hàng hải. Mô phỏng trong `preview.html` có các nút chạy từng chặng6s để kiểm tra góc máy/tỷ lệ.

Đã mở mô phỏng bằng trình duyệt được hỗ trợ, chạy thử chặng1 và chặng6; chặng6 kết thúc tại trạng thái “6.0/6 giây · đến điểm dừng”, không có log warning/error. Nút play chống tạo hai vòng animation, pause/select hủy frame đang chờ, tab ẩn giữ trạng thái. Mô phỏng có nhánh giảm chuyển động. Đây là kiểm tra bản mô phỏng kế hoạch, không thay thế QA của renderer trình chiếu.

**Chưa thể kết luận:** khoảng cách chính xác tới mọi bờ biển từ một tranhAIchưa có mask; chi tiết của master độ phân giải cao mới; yaw của tài nguyên tàu; FPS của renderer sau khi tích hợp. Không gọi các mục này làpasschỉ từ kiểm tra spline.

**Done when implemented:** cả10chặng dùng một bản đồ khônglặp; mỗi chặng6s với pace gần hiện tại; hướng thân tàu hợp cung cua, cột buồm thẳng; không xuyên bờ, méo/nhòe, nhảy vị trí hoặc hụt nền; trả lời/chuyển cảnh giữ chính xác trạng thái. Captures và video thực ở1920×1080,1440×900,2877×1604; đo FPS/frame time và chi phí render theo môi trường, không cam kết60FPSchỉ bằng thiết lập mã hóa video.
