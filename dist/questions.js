// Bộ câu hỏi do người dùng cung cấp.
export const QUESTIONS = [
  {
    id: 1,
    title: "Dãy số sau bức ảnh",
    story: "Trong lúc lục lọi chiếc rương của ông nội, nhân vật Adrian tìm thấy được một bức ảnh. Phía sau của bức ảnh này có một dòng số 3-1-4-1-5-9, biết rằng dòng số này đã được nghiên cứu từ rất lâu bởi các nhà toán học ở thời cổ đại cho việc tính toán diện tích và chu vi của hình tròn.",
    prompt: "Hỏi số này có tên gọi là gì?",
    options: ["Hằng số Avogadro (N)", "Số pi (π)", "Số Euler (e)", "Số phi (ϕ)"],
    correct: 1
  },
  {
    id: 2,
    title: "Con số từ Ấn Độ",
    story: "Trong những chuyến đại hải trình trải dài khắp thế giới của mình, thuyền trưởng Wilson đã đi qua vô số vùng biển. Đặc biệt trong đó có vùng biển của Ấn Độ, ở quốc gia này ở thời cổ đại người ta đã tìm ra một con số có đóng góp quan trọng cho sự hiểu biết về các con số của con người sau này.",
    prompt: "Người Ấn Độ xưa đã tìm ra số gì?",
    options: ["Số 1", "Số 0", "Số vô tỉ", "Số âm"],
    correct: 1
  },
  {
    id: 3,
    title: "Hai đồng xu trên biển",
    story: "Trên chuyến đi, các thuyền viên nhặt được 2 đồng xu và nảy ra 1 ý tưởng trò chơi tung lần lượt 2 đồng xu rồi đoán ra mặt sấp hay mặt ngửa.",
    prompt: "Một thủy thủ cược rằng sẽ ra 2 lần mặt sấp, hỏi tỉ lệ thắng của người này là bao nhiêu?",
    options: ["25%", "50%", "100%", "0%"],
    correct: 0
  },
  {
    id: 4,
    title: "Gấp ngôi sao năm cánh",
    story: "Trong một chuyến hải trình, các thủy thủ tổ chức một trò chơi gấp giấy tạo hình không gian. Họ sử dụng một tấm bìa có đường bao dạng ngôi sao năm cánh, gồm một đa giác đều ở giữa và năm tam giác cân bằng nhau gắn liền với các cạnh xung quanh. Bằng cách gấp các tam giác lên theo những cạnh chung sao cho năm đỉnh nhọn cùng gặp nhau tại một điểm, họ tạo thành một khối đa diện.",
    prompt: "Hỏi khối đa diện được tạo thành có tên gọi là gì?",
    options: ["Khối chóp lục giác đều", "Khối lập phương", "Khối lăng trụ tứ giác đều", "Khối chóp ngũ giác đều"],
    correct: 3
  },
  {
    id: 5,
    title: "Chiếc chìa khóa tam giác",
    story: "Trong lúc lục lọi dưới đáy rương gỗ cũ của ông nội, Adrian tìm thấy một chiếc hộp kho báu nhỏ bị khóa chặt bằng một ổ khóa là hình tam giác vuông. Trên nắp hộp có ghi gợi ý:\n“Để mở khóa, hãy ghép 3 thanh gỗ tạo thành một tam giác vuông. Hiện tại đã có sẵn 2 thanh gỗ làm cạnh góc vuông với độ dài lần lượt là 12 cm và 16 cm. Hãy cắt thêm một thanh gỗ thứ ba làm cạnh huyền để hoàn thiện chiếc chìa khóa hình tam giác vuông này.”",
    prompt: "Hỏi Adrian cần cắt thanh gỗ thứ ba có độ dài bằng bao nhiêu để mở được rương kho báu?",
    options: ["5 cm", "4 cm", "10 cm", "20 cm"],
    correct: 3
  },
  {
    id: 6,
    title: "Mật khẩu chiếc rương thứ năm",
    story: "Những chiếc rương quý trên những chuyến đại hải trình đều được đặt mật khẩu theo những con số. Rương thứ nhất có mật khẩu là số 1, rương thứ hai có mật khẩu là số 2, rương thứ ba có mật khẩu là số 4,…",
    prompt: "Cứ theo quy luật đó, hỏi mật khẩu của rương thứ năm sẽ là số bao nhiêu?",
    options: ["Số 20", "Số 8", "Số 16", "Số 10"],
    correct: 2
  },
  {
    id: 7,
    title: "Kim phút trong ngày Đông chí",
    story: "Trong ngày Đông chí (ngày ngắn nhất trong năm ở Bắc bán cầu), một nhà thiên văn học bắt đầu quan sát mặt trời từ lúc 6:15 sáng và kết thúc khi mặt trời lặn lúc 5:45 chiều.",
    prompt: "Hỏi trong khoảng thời gian mặt trời chiếu sáng đó, kim phút của chiếc đồng hồ đeo tay của ông đã quay được tổng cộng bao nhiêu vòng?",
    options: ["11,5 vòng", "12 độ", "12 vòng", "23 vòng"],
    correct: 0
  },
  {
    id: 8,
    title: "Những cái bắt tay",
    story: "Giả sử rằng trên con tàu có tổng cộng 12 người gồm cả thuyền trưởng và các thủy thủ.",
    prompt: "Hỏi khi 1 thủy thủ muốn bắt tay hết tất cả thành viên trên tàu mỗi người 1 lần thì tổng cộng người thủy thủ đó sẽ bắt tay bao nhiêu lần?",
    options: ["12 lần", "1 lần", "11 lần", "10 lần"],
    correct: 2
  },
  {
    id: 9,
    title: "Hai ngọn hải đăng",
    story: "Thuyền trưởng Wilson chuẩn bị cho tàu rời cảng. Anh quan sát hai chiếc hải đăng: hải đăng A cứ 6 giây lại phát sáng một lần, hải đăng B cứ 8 giây lại phát sáng một lần.",
    prompt: "Nếu cả hai hải đăng vừa cùng phát sáng lúc 8:00 tối, hỏi sau ít nhất bao nhiêu giây nữa chúng lại cùng phát sáng?",
    options: ["14 giây", "24 giây", "48 giây", "12 giây"],
    correct: 1
  },
  {
    id: 10,
    title: "Tấm gỗ cân bằng",
    story: "Trong lúc thư giãn trên thuyền, Adrian nghĩ ra một thử nghiệm giữ thăng bằng với một tấm gỗ mỏng, đồng chất, được cắt từ một tấm gỗ lớn thành hình tam giác với hình dạng bất kỳ. Anh đặt tấm gỗ lên một chiếc trụ nhỏ và nhận thấy rằng vị trí đặt trụ để tấm gỗ cân bằng chính là giao điểm của ba đường thẳng đặc biệt trong tam giác, mỗi đường thẳng đều đi qua một đỉnh của tam giác.",
    prompt: "Vậy ba đường thẳng đặc biệt đó được gọi là gì?",
    options: ["Đường trung tuyến", "Đường trung trực", "Đường phân giác", "Đường cao"],
    correct: 0
  }
];
