// Nội dung lấy từ PDF được cung cấp; đáp án và lời giải do biên tập suy luận.
export const QUESTIONS = [
  {
    id: 1,
    title: 'Dãy số sau bức ảnh',
    story: 'Trong lúc lục lọi chiếc rương của ông nội, nhân vật Adrian tìm thấy được một bức ảnh. Phía sau của bức ảnh này có một dòng số 3-1-4-1-5-9, biết rằng dòng số này đã được nghiên cứu từ rất lâu bởi các nhà toán học ở thời cổ đại cho việc tính toán diện tích và chu vi của hình tròn.',
    prompt: 'Hỏi số này có tên gọi là gì?',
    options: ['Hằng số Avogadro (N)', 'Số pi (π)', 'Số Euler (e)', 'Số phi (ϕ)'],
    correct: 1,
    explanation: 'Dãy 3-1-4-1-5-9 gợi các chữ số đầu của số pi: π ≈ 3,14159. Với mọi hình tròn, lấy chu vi chia cho đường kính đều được cùng một giá trị là π. Vì vậy, hình tròn có đường kính 1 m sẽ có chu vi khoảng 3,14 m.'
  },
  {
    id: 2,
    title: 'Con số từ Ấn Độ',
    story: 'Trong những chuyến đại hải trình trải dài khắp thế giới của mình, thuyền trưởng Wilson đã đi qua vô số vùng biển. Đặc biệt trong đó có vùng biển của Ấn Độ, ở quốc gia này ở thời cổ đại người ta đã tìm ra một con số có đóng góp quan trọng cho sự hiểu biết về các con số của con người sau này.',
    prompt: 'Người Ấn Độ xưa đã tìm ra số gì?',
    options: ['Số 1', 'Số 0', 'Số vô tỉ', 'Số âm'],
    correct: 1,
    explanation: 'Các nhà toán học Ấn Độ có đóng góp quan trọng trong việc xem số 0 là một số có thể dùng để tính toán. Năm 628, Brahmagupta đã nêu các quy tắc cộng, trừ và nhân với số 0, chẳng hạn 5 + 0 = 5 và 5 × 0 = 0. Số 0 còn giữ vị trí trong cách viết số: ở 105, nó cho biết hàng chục không có đơn vị nào.'
  },
  {
    id: 3,
    title: 'Những cái bắt tay',
    story: 'Giả sử rằng trên con tàu có tổng cộng 12 người gồm cả thuyền trưởng và các thủy thủ.',
    prompt: 'Hỏi khi 1 thủy thủ muốn bắt tay hết tất cả thành viên trên tàu mỗi người 1 lần thì tổng cộng người thủy thủ đó sẽ bắt tay bao nhiêu lần?',
    options: ['12 lần', '11 lần', '1 lần', '10 lần'],
    correct: 1,
    explanation: 'Trên tàu có 12 người, nhưng thủy thủ không bắt tay với chính mình. Vì vậy, người đó cần bắt tay 12 − 1 = 11 lần.'
  },
  {
    id: 4,
    title: 'Hai đồng xu trên biển',
    story: 'Trên chuyến đi, các thuyền viên nhặt được 2 đồng xu và nảy ra 1 ý tưởng trò chơi tung lần lượt 2 đồng xu rồi đoán ra mặt sấp hay mặt ngửa.',
    prompt: 'Một thủy thủ cược rằng sẽ ra 2 lần mặt sấp, hỏi tỉ lệ thắng của người này là bao nhiêu?',
    options: ['25%', '50%', '100%', '0%'],
    correct: 0,
    explanation: 'Với hai đồng xu cân bằng, tung độc lập, có 4 kết quả có khả năng như nhau: sấp–sấp, sấp–ngửa, ngửa–sấp, ngửa–ngửa. Chỉ 1 kết quả có cả hai mặt sấp, nên xác suất là 1/4 = 25%.'
  },
  {
    id: 5,
    title: 'Lạc đến năm 1921',
    story: 'Sau tiếng ‘rắc’, nhân vật Adrian đã hoảng loạn và nhắm mắt lại sau đó mở ra thì cậu đã ở một nơi hoàn toàn xa lạ vào năm 1921.',
    prompt: 'Hỏi năm này là vào thế kỉ bao nhiêu?',
    options: ['Thế kỉ XX', 'Thế kỉ XIX', 'Thế kỉ XVIII', 'Thế kỉ XIV'],
    correct: 0,
    explanation: 'Thế kỉ XX kéo dài từ năm 1901 đến hết năm 2000. Năm 1921 nằm trong khoảng này nên thuộc thế kỉ XX.'
  },
  {
    id: 6,
    title: 'Mật khẩu chiếc rương thứ năm',
    story: 'Những chiếc rương quý trên những chuyến đại hải trình đều được đặt mật khẩu theo những con số. Rương thứ nhất có mật khẩu là số 1, rương thứ hai có mật khẩu là số 2, rương thứ ba có mật khẩu là số 4,...',
    prompt: 'Cứ theo quy luật đó hỏi mật khẩu của rương thứ năm sẽ là số bao nhiêu?',
    options: ['Số 16', 'Số 8', 'Số 32', 'Số 10'],
    correct: 0,
    explanation: 'Theo quy luật gấp đôi, muốn tìm mật khẩu của rương tiếp theo, ta lấy mật khẩu của rương ngay trước nhân với 2. Từ ba mật khẩu đã biết là 1, 2, 4, ta tính tiếp: rương thứ tư có mật khẩu 4 × 2 = 8; rương thứ năm có mật khẩu 8 × 2 = 16. Dãy đầy đủ là 1 → 2 → 4 → 8 → 16, nên đáp án là 16.'
  },
  {
    id: 7,
    title: 'Định lý về tam giác vuông',
    story: 'Để đo đạc lại các góc sao cho thật vuông vức, một định lý hình học nổi tiếng đã được tìm ra do một nhà toán học thời Cổ Đại phát minh. Định lý này khẳng định: “Trong một tam giác vuông, bình phương của cạnh huyền bằng tổng bình phương của hai cạnh góc vuông.”',
    prompt: 'Định lý được nhắc đến có tên gọi là gì?',
    options: ['Định lý Pytago', 'Định lý Thales', 'Định lý Euclid', 'Định lý Archimedes'],
    correct: 0,
    explanation: 'Định lý Pytago phát biểu: “Trong một tam giác vuông, bình phương của cạnh huyền bằng tổng bình phương của hai cạnh góc vuông.”\nGọi a, b là hai cạnh góc vuông và c là cạnh huyền, ta có c² = a² + b². Cạnh huyền nằm đối diện góc vuông và là cạnh dài nhất. Ví dụ, tam giác có ba cạnh dài 3, 4, 5 thỏa mãn 3² + 4² = 5², tức 9 + 16 = 25.'
  },
  {
    id: 8,
    title: 'Con số còn thiếu',
    story: '',
    prompt: 'Hãy điền số thích hợp vào chỗ trống sau: 1, 1, 2, 3, 5, 8, ?, 21',
    options: ['13', '10', '20', '9'],
    correct: 0,
    explanation: 'Đây là dãy Fibonacci. Với hai số đầu là 1 và 1, từ số thứ ba trở đi, mỗi số được tạo bằng cách cộng hai số đứng ngay trước: 1 + 1 = 2; 1 + 2 = 3; 2 + 3 = 5; 3 + 5 = 8. Vì vậy, số còn thiếu là 5 + 8 = 13; tiếp theo, 8 + 13 = 21. Dãy này nổi tiếng qua bài toán về số cặp thỏ trong sách Liber Abaci của Fibonacci, xuất bản năm 1202.'
  },
  {
    id: 9,
    title: 'Khối đá trong sổ tay',
    story: 'Trong lúc tìm kiếm thông tin trong cuốn sổ tay nghiên cứu cũ của ông nội, Adrian bắt gặp hình vẽ của một khối đá đa diện đều kỳ lạ — một khối không gian được tạo thành từ các mặt là những đa giác đều bằng nhau. Ông nội có ghi chú rằng đây là khối đa diện đều gồm có 6 mặt đều là hình vuông bằng nhau.',
    prompt: 'Hỏi khối đa diện này có tên gọi là gì?',
    options: ['Khối lập phương', 'Hình hộp chữ nhật', 'Khối tứ diện đều', 'Khối cầu'],
    correct: 0,
    explanation: 'Khối lập phương có 6 mặt đều là hình vuông bằng nhau, 12 cạnh bằng nhau và 8 đỉnh.'
  },
  {
    id: 10,
    title: 'Chiếc chìa khóa tam giác',
    story: 'Trong lúc lục lọi dưới đáy rương gỗ cũ của ông nội, Adrian tìm thấy một chiếc hộp kho báu nhỏ bị khóa chặt bằng một ổ khóa là hình tam giác vuông. Trên nắp hộp có ghi gợi ý:\n\n“Để mở khóa, hãy ghép 3 thanh gỗ tạo thành một tam giác vuông. Hiện tại đã có sẵn 2 thanh gỗ làm cạnh góc vuông với độ dài lần lượt là 3 cm và 4 cm. Hãy cắt thêm một thanh gỗ thứ ba làm cạnh huyền để hoàn thiện chiếc chìa khóa hình tam giác vuông này.”',
    prompt: 'Hỏi Adrian cần cắt thanh gỗ thứ ba có độ dài bằng bao nhiêu để mở được rương kho báu?',
    options: ['5 cm', '4 cm', '10 cm', '25 cm'],
    correct: 0,
    explanation: 'Theo định lý Pytago: cạnh huyền² = 3² + 4² = 25. Vì 5² = 25 nên cạnh huyền dài 5 cm; Adrian cần cắt thanh gỗ dài 5 cm.'
  }
];
