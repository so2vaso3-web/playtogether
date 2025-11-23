import { NextRequest, NextResponse } from 'next/server';
import { Package } from '@/lib/kv-models';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import { ensureAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Danh sách tính năng hack Play Together đầy đủ (110+ tính năng) - Copy từ admin packages page
const getPlayTogetherDefaultFeatures = () => {
  return {
    chung: [
      { name: 'Tự Động Di Chuyển Thông Minh AI', description: 'Hệ thống AI tự động di chuyển thông minh, tránh người chơi khác và chướng ngại vật', enabled: true },
      { name: 'Tự Động Tới', description: 'Tự động di chuyển đến vị trí mục tiêu đã chọn', enabled: true },
      { name: 'Tăng Tốc Độ (2x, 3x, 5x, 10x)', description: 'Tăng tốc độ di chuyển lên 2x, 3x, 5x, hoặc 10x lần', enabled: true },
      { name: 'Bay / Đi Xuyên Tường', description: 'Bay và đi xuyên qua tường, địa hình', enabled: true },
      { name: 'Dịch Chuyển Đến Điểm Nhất Định', description: 'Dịch chuyển tức thì đến vị trí bất kỳ trên bản đồ', enabled: true },
      { name: 'Dịch Chuyển Theo Tọa Độ', description: 'Dịch chuyển theo tọa độ X, Y, Z chính xác', enabled: true },
      { name: 'Nhìn Xuyên Tường', description: 'Nhìn xuyên tường, thấy người chơi và NPC ẩn', enabled: true },
      { name: 'Sức Bền Vô Hạn', description: 'Sức bền vô hạn, không bao giờ mệt', enabled: true },
      { name: 'Không Có Thời Gian Chờ', description: 'Bỏ cooldown tất cả kỹ năng và hành động', enabled: true },
      { name: 'Tự Động Tránh Người Chơi', description: 'Tự động tránh các người chơi khác khi hack', enabled: true },
      { name: 'Hệ Thống Chống Ban AI', description: 'Hệ thống AI chống ban thông minh, giả lập hành vi người thật', enabled: true },
      { name: 'Chế Độ Tàng Hình', description: 'Chế độ tàng hình, người khác không thấy bạn', enabled: true },
      { name: 'Chế Độ Bất Tử', description: 'Bất tử, không nhận sát thương', enabled: true },
      { name: 'Hiện Bảng Thông Tin', description: 'Hiển thị bảng thông tin chi tiết về game và hack', enabled: true },
      { name: 'Khôi Phục Trạng Thái', description: 'Khôi phục lại trạng thái trước đó khi cần thiết', enabled: true },
      { name: 'Nhận Thành Tích', description: 'Tự động nhận tất cả thành tích có sẵn', enabled: true },
      { name: 'Tăng Kích Thước Nhân Vật', description: 'Tăng hoặc giảm kích thước nhân vật theo ý muốn', enabled: true },
      { name: 'Nhảy Cao Không Giới Hạn', description: 'Nhảy cao vô hạn, không bị giới hạn bởi vật lý', enabled: true },
      { name: 'Đi Trên Nước', description: 'Đi bộ trên mặt nước như đi trên đất', enabled: true },
      { name: 'Vượt Qua Vật Cản', description: 'Tự động vượt qua các vật cản và chướng ngại vật', enabled: true },
      { name: 'Tự Động Tránh Bẫy', description: 'Tự động phát hiện và tránh các bẫy trên bản đồ', enabled: true },
      { name: 'Hiển Thị Tọa Độ', description: 'Hiển thị tọa độ hiện tại trên màn hình', enabled: true },
      { name: 'Compass Hack', description: 'La bàn chỉ đường đến các điểm quan trọng', enabled: true },
      { name: 'Tự Động Hồi Máu', description: 'Tự động hồi máu khi máu thấp', enabled: true },
      { name: 'Máu Không Giảm', description: 'Máu luôn ở mức tối đa, không bao giờ giảm', enabled: true },
      { name: 'Năng Lượng Vô Hạn', description: 'Năng lượng không bao giờ cạn', enabled: true },
      { name: 'Tự Động Uống Thuốc', description: 'Tự động uống thuốc khi cần thiết', enabled: true },
      { name: 'Chế Độ Ban Đêm', description: 'Bật/tắt chế độ ban đêm bất cứ lúc nào', enabled: true },
      { name: 'Thay Đổi Thời Tiết', description: 'Thay đổi thời tiết theo ý muốn', enabled: true },
      { name: 'Gravity Hack', description: 'Điều chỉnh trọng lực, bay lơ lửng hoặc rơi nhanh', enabled: true },
    ],
    map: [
      { name: 'Bản Đồ Radar Hack', description: 'Hiển thị tất cả NPC, vật phẩm, sự kiện trên radar', enabled: true },
      { name: 'Đánh Dấu Vị Trí', description: 'Đánh dấu các vị trí quan trọng trên bản đồ', enabled: true },
      { name: 'Tự Động Tìm Đường', description: 'Tự động tìm đường ngắn nhất đến mục tiêu', enabled: true },
      { name: 'Dịch Chuyển Đến Người Chơi', description: 'Dịch chuyển đến người chơi bất kỳ', enabled: true },
      { name: 'Hiển Thị Tất Cả Tài Nguyên', description: 'Hiển thị tất cả tài nguyên trên bản đồ', enabled: true },
      { name: 'Tự Động Thu Thập Vật Phẩm Gần Đó', description: 'Tự động thu thập vật phẩm gần đó', enabled: true },
      { name: 'Bản Đồ Không Giới Hạn', description: 'Bỏ giới hạn di chuyển trên bản đồ', enabled: true },
      { name: 'Hiển Thị Đường Dẫn Tối Ưu', description: 'Hiển thị đường đi tối ưu nhất trên bản đồ', enabled: true },
      { name: 'Phóng To / Thu Nhỏ Bản Đồ', description: 'Phóng to thu nhỏ bản đồ không giới hạn', enabled: true },
      { name: 'Bản Đồ 3D', description: 'Xem bản đồ ở chế độ 3D chi tiết', enabled: true },
      { name: 'Đánh Dấu Nhiều Điểm', description: 'Đánh dấu nhiều điểm cùng lúc trên bản đồ', enabled: true },
      { name: 'Lưu Vị Trí Yêu Thích', description: 'Lưu các vị trí yêu thích để dịch chuyển nhanh', enabled: true },
      { name: 'Hiển Thị Khoảng Cách', description: 'Hiển thị khoảng cách đến các điểm trên bản đồ', enabled: true },
      { name: 'Bản Đồ Toàn Màn Hình', description: 'Mở bản đồ ở chế độ toàn màn hình', enabled: true },
      { name: 'Tự Động Cập Nhật Bản Đồ', description: 'Bản đồ tự động cập nhật theo thời gian thực', enabled: true },
      { name: 'Hiển Thị Mật Độ Người Chơi', description: 'Hiển thị mật độ người chơi trên từng khu vực', enabled: true },
      { name: 'Lọc Điểm Quan Trọng', description: 'Lọc và chỉ hiển thị các điểm quan trọng trên bản đồ', enabled: true },
    ],
    contrung: [
      { name: 'Tự Động Bắt Côn Trùng', description: 'Tự động tìm và bắt tất cả côn trùng gần đó', enabled: true },
      { name: 'Nhìn Thấy Côn Trùng Xuyên Tường', description: 'Nhìn thấy côn trùng xuyên tường', enabled: true },
      { name: 'Bắt Ngay Lập Tức', description: 'Bắt côn trùng ngay lập tức, không cần chờ', enabled: true },
      { name: 'Làm Nổi Bật Côn Trùng Hiếm', description: 'Làm nổi bật côn trùng hiếm trên map', enabled: true },
      { name: 'Tự Động Bán Côn Trùng', description: 'Tự động bán côn trùng khi túi đầy', enabled: true },
      { name: 'Lọc Côn Trùng Theo Độ Hiếm', description: 'Lọc và chỉ bắt côn trùng theo độ hiếm', enabled: true },
      { name: 'Dự Đoán Vị Trí Côn Trùng Hiếm', description: 'Dự đoán vị trí xuất hiện côn trùng hiếm', enabled: true },
      { name: 'Tự Động Đuổi Theo Côn Trùng', description: 'Tự động đuổi theo côn trùng khi phát hiện', enabled: true },
      { name: 'Bắt Nhiều Côn Trùng Cùng Lúc', description: 'Bắt nhiều côn trùng cùng một lúc', enabled: true },
      { name: 'Hút Côn Trùng Từ Xa', description: 'Hút côn trùng về phía mình từ khoảng cách xa', enabled: true },
      { name: 'Tự Động Phân Loại Côn Trùng', description: 'Tự động phân loại côn trùng sau khi bắt', enabled: true },
      { name: 'Thông Báo Côn Trùng Hiếm', description: 'Thông báo khi phát hiện côn trùng hiếm gần đó', enabled: true },
      { name: 'Lịch Sử Vị Trí Côn Trùng', description: 'Ghi nhớ các vị trí đã bắt được côn trùng hiếm', enabled: true },
      { name: 'Tự Động Thay Đổi Dụng Cụ Bắt', description: 'Tự động thay đổi dụng cụ bắt phù hợp', enabled: true },
      { name: 'Tăng Tỷ Lệ Bắt Trúng', description: 'Tăng tỷ lệ bắt trúng côn trùng lên 100%', enabled: true },
      { name: 'Bỏ Qua Animation Bắt', description: 'Bỏ qua animation khi bắt côn trùng', enabled: true },
      { name: 'Tự Động Nâng Cấp Lưới', description: 'Tự động nâng cấp lưới bắt côn trùng', enabled: true },
    ],
    cauca: [
      { name: 'Tự Động Câu Cá', description: 'Tự động câu cá, không cần tương tác', enabled: true },
      { name: 'Bắt Cá Ngay Lập Tức', description: 'Bắt cá ngay lập tức, bỏ qua minigame', enabled: true },
      { name: 'Làm Nổi Bật Cá Hiếm', description: 'Làm nổi bật cá hiếm trên map', enabled: true },
      { name: 'Tự Động Timing Hoàn Hảo', description: 'Tự động timing hoàn hảo khi câu', enabled: true },
      { name: 'Mồi Câu Không Giới Hạn', description: 'Mồi câu không giới hạn', enabled: true },
      { name: 'Nam Châm Thu Hút Cá', description: 'Thu hút tất cả cá trong khu vực', enabled: true },
      { name: 'Tự Động Bán Cá', description: 'Tự động bán cá khi túi đầy', enabled: true },
      { name: 'Tự Động Thả Câu', description: 'Tự động thả cần câu ở vị trí tốt nhất', enabled: true },
      { name: 'Câu Nhiều Cá Cùng Lúc', description: 'Câu nhiều cá cùng một lúc', enabled: true },
      { name: 'Tự Động Chọn Mồi Phù Hợp', description: 'Tự động chọn mồi phù hợp với từng loại cá', enabled: true },
      { name: 'Hiển Thị Thông Tin Cá', description: 'Hiển thị thông tin chi tiết về cá khi phát hiện', enabled: true },
      { name: 'Tự Động Nâng Cấp Cần Câu', description: 'Tự động nâng cấp cần câu khi đủ điều kiện', enabled: true },
      { name: 'Tăng Tỷ Lệ Câu Cá Hiếm', description: 'Tăng tỷ lệ câu được cá hiếm lên tối đa', enabled: true },
      { name: 'Tự Động Phân Loại Cá', description: 'Tự động phân loại cá sau khi câu', enabled: true },
      { name: 'Bỏ Qua Animation Câu Cá', description: 'Bỏ qua tất cả animation khi câu cá', enabled: true },
      { name: 'Câu Cá Mọi Vị Trí', description: 'Câu cá được ở mọi vị trí, không cần nước', enabled: true },
      { name: 'Hiển Thị Vị Trí Cá Hiếm', description: 'Hiển thị vị trí xuất hiện cá hiếm trên map', enabled: true },
      { name: 'Tự Động Sửa Dụng Cụ Câu', description: 'Tự động sửa chữa dụng cụ câu khi hỏng', enabled: true },
    ],
    thuthap: [
      { name: 'Tự Động Thu Thập Tài Nguyên', description: 'Tự động thu thập tất cả tài nguyên xung quanh', enabled: true },
      { name: 'Sửa Dụng Cụ', description: 'Tự động sửa chữa dụng cụ khi hư hỏng', enabled: true },
      { name: 'Bảo Quản', description: 'Tự động bảo quản vật phẩm một cách thông minh', enabled: true },
      { name: 'Mở Hộp Quà / Gói Thẻ', description: 'Tự động mở hộp quà và gói thẻ khi có', enabled: true },
      { name: 'Chức Năng Gói Bán Nhanh', description: 'Tự động bán các gói vật phẩm một cách nhanh chóng', enabled: true },
      { name: 'Túi Đồ Không Giới Hạn', description: 'Túi đồ không giới hạn', enabled: true },
      { name: 'Tự Động Sắp Xếp Túi Đồ', description: 'Tự động sắp xếp túi đồ', enabled: true },
      { name: 'Thu Hoạch Nhiều Vật Phẩm', description: 'Thu hoạch nhiều vật phẩm cùng lúc', enabled: true },
      { name: 'Thu Hoạch Ngay Lập Tức', description: 'Thu hoạch ngay lập tức, không cần đợi', enabled: true },
      { name: 'Hiển Thị Tài Nguyên Trên Bản Đồ', description: 'Hiển thị tất cả tài nguyên trên map', enabled: true },
      { name: 'Tự Động Trồng Cây', description: 'Tự động trồng và chăm sóc cây trồng', enabled: true },
      { name: 'Thu Hoạch Tự Động', description: 'Tự động thu hoạch khi cây trồng chín', enabled: true },
      { name: 'Tăng Tốc Độ Trồng Trọt', description: 'Tăng tốc độ phát triển của cây trồng', enabled: true },
      { name: 'Tự Động Chăm Sóc Động Vật', description: 'Tự động cho ăn và chăm sóc động vật', enabled: true },
      { name: 'Thu Sản Phẩm Tự Động', description: 'Tự động thu sản phẩm từ động vật', enabled: true },
      { name: 'Xây Dựng Tự Động', description: 'Tự động xây dựng các công trình', enabled: true },
      { name: 'Nâng Cấp Tự Động', description: 'Tự động nâng cấp nhà cửa và công trình', enabled: true },
      { name: 'Sản Xuất Không Giới Hạn', description: 'Sản xuất vật phẩm không giới hạn', enabled: true },
      { name: 'Tự Động Mua Bán', description: 'Tự động mua bán vật phẩm với giá tốt nhất', enabled: true },
      { name: 'Tự Động Trao Đổi', description: 'Tự động trao đổi vật phẩm với người chơi khác', enabled: true },
      { name: 'Tự Động Làm Nhiệm Vụ', description: 'Tự động nhận và hoàn thành nhiệm vụ', enabled: true },
      { name: 'Tự Động Tìm Kiếm Vật Phẩm', description: 'Tự động tìm kiếm và thu thập vật phẩm quý', enabled: true },
      { name: 'Tự Động Nâng Cấp Nhân Vật', description: 'Tự động nâng cấp level và kỹ năng nhân vật', enabled: true },
      { name: 'Tự Động Học Kỹ Năng', description: 'Tự động học và nâng cấp kỹ năng', enabled: true },
      { name: 'Tự Động Mặc Đồ', description: 'Tự động mặc đồ phù hợp cho nhân vật', enabled: true },
      { name: 'Tự Động Sửa Đồ', description: 'Tự động sửa chữa đồ đạc khi hỏng', enabled: true },
      { name: 'Tự Động Nạp Tiền', description: 'Tự động nạp tiền vào game (nếu có tích hợp)', enabled: true },
      { name: 'Bỏ Qua Tất Cả Quảng Cáo', description: 'Tự động bỏ qua tất cả quảng cáo', enabled: true },
      { name: 'Tự Động Đăng Nhập', description: 'Tự động đăng nhập vào game', enabled: true },
      { name: 'Tự Động Nhận Thưởng Hàng Ngày', description: 'Tự động nhận phần thưởng đăng nhập hàng ngày', enabled: true },
    ],
    sukien: [
      { name: 'Tự Động Tham Gia Sự Kiện', description: 'Tự động tham gia tất cả sự kiện', enabled: true },
      { name: 'Tự Động Hoàn Thành Nhiệm Vụ', description: 'Tự động hoàn thành nhiệm vụ sự kiện', enabled: true },
      { name: 'Hiển Thị Thời Gian Sự Kiện', description: 'Hiển thị thời gian sự kiện còn lại', enabled: true },
      { name: 'Tự Động Nhận Thưởng Sự Kiện', description: 'Tự động nhận thưởng sự kiện', enabled: true },
      { name: 'Hiển Thị Vị Trí Sự Kiện', description: 'Hiển thị vị trí sự kiện trên map', enabled: true },
      { name: 'Tự Động Hoàn Thành Minigame Sự Kiện', description: 'Tự động hoàn thành minigame trong sự kiện', enabled: true },
      { name: 'Thông Báo Sự Kiện Mới', description: 'Thông báo khi có sự kiện mới xuất hiện', enabled: true },
      { name: 'Tự Động Dịch Chuyển Đến Sự Kiện', description: 'Tự động dịch chuyển đến vị trí sự kiện', enabled: true },
      { name: 'Tăng Tỷ Lệ Nhận Thưởng', description: 'Tăng tỷ lệ nhận được phần thưởng cao từ sự kiện', enabled: true },
      { name: 'Nhận Tất Cả Thưởng Sự Kiện', description: 'Nhận tất cả phần thưởng từ sự kiện cùng lúc', enabled: true },
      { name: 'Lịch Sử Sự Kiện', description: 'Xem lịch sử các sự kiện đã tham gia', enabled: true },
      { name: 'Tự Động Đăng Ký Sự Kiện', description: 'Tự động đăng ký tham gia sự kiện khi có', enabled: true },
      { name: 'Hoàn Thành Nhiệm Vụ Hàng Ngày', description: 'Tự động hoàn thành nhiệm vụ hàng ngày', enabled: true },
      { name: 'Hoàn Thành Nhiệm Vụ Hàng Tuần', description: 'Tự động hoàn thành nhiệm vụ hàng tuần', enabled: true },
      { name: 'Tham Gia Sự Kiện Đặc Biệt', description: 'Tự động tham gia các sự kiện đặc biệt', enabled: true },
      { name: 'Nhận Code Quà Tặng', description: 'Tự động nhận code quà tặng từ sự kiện', enabled: true },
    ],
    minigame: [
      { name: 'Tự Động Thắng Minigame', description: 'Tự động thắng tất cả minigame', enabled: true },
      { name: 'Timing Hoàn Hảo', description: 'Timing hoàn hảo cho mọi minigame', enabled: true },
      { name: 'Bỏ Qua Animation Minigame', description: 'Bỏ qua animation, hoàn thành ngay', enabled: true },
      { name: 'Chơi Minigame Không Giới Hạn', description: 'Không giới hạn số lần chơi minigame', enabled: true },
      { name: 'Tự Động Nhận Thưởng Minigame', description: 'Tự động nhận thưởng minigame', enabled: true },
      { name: 'Điểm Số Tối Đa', description: 'Đạt điểm số tối đa trong mọi minigame', enabled: true },
      { name: 'Tự Động Chơi Minigame', description: 'Tự động chơi minigame mà không cần tương tác', enabled: true },
      { name: 'Bỏ Qua Thời Gian Chờ', description: 'Bỏ qua thời gian chờ giữa các lượt chơi', enabled: true },
      { name: 'Hack Điểm Số', description: 'Thiết lập điểm số theo ý muốn', enabled: true },
      { name: 'Tự Động Hoàn Thành Mục Tiêu', description: 'Tự động hoàn thành mục tiêu minigame', enabled: true },
      { name: 'Tăng Tốc Độ Minigame', description: 'Tăng tốc độ chơi minigame để hoàn thành nhanh hơn', enabled: true },
      { name: 'Nhận Tất Cả Thưởng', description: 'Nhận tất cả phần thưởng từ minigame', enabled: true },
      { name: 'Không Giới Hạn Mạng Sống', description: 'Không giới hạn số mạng sống trong minigame', enabled: true },
      { name: 'Chế Độ Dễ Dàng', description: 'Giảm độ khó minigame xuống mức dễ nhất', enabled: true },
    ],
    caidat: [
      { name: 'Tùy Chỉnh Phím Tắt', description: 'Tùy chỉnh phím tắt cho mọi tính năng', enabled: true },
      { name: 'Giao Diện Menu Đẹp', description: 'Giao diện menu đẹp mắt, dễ sử dụng', enabled: true },
      { name: 'Chế Độ An Toàn', description: 'Chế độ an toàn, giảm nguy cơ ban', enabled: true },
      { name: 'Tự Động Cập Nhật', description: 'Tự động cập nhật khi game update', enabled: true },
      { name: 'Lưu / Tải Cấu Hình', description: 'Lưu và tải cấu hình hack', enabled: true },
      { name: 'Hỗ Trợ Đa Ngôn Ngữ', description: 'Hỗ trợ nhiều ngôn ngữ', enabled: true },
      { name: 'Tối Ưu Hiệu Suất', description: 'Tối ưu hiệu suất, giảm lag', enabled: true },
      { name: 'Backup / Restore Settings', description: 'Sao lưu và khôi phục cài đặt', enabled: true },
      { name: 'Chế Độ Tối', description: 'Giao diện chế độ tối để bảo vệ mắt', enabled: true },
      { name: 'Thông Báo Push', description: 'Nhận thông báo push khi có sự kiện mới', enabled: true },
      { name: 'Log Hành Động', description: 'Ghi log tất cả hành động hack', enabled: true },
      { name: 'Reset Cài Đặt', description: 'Khôi phục cài đặt về mặc định', enabled: true },
      { name: 'Xuất / Nhập Cấu Hình', description: 'Xuất và nhập cấu hình hack giữa các thiết bị', enabled: true },
      { name: 'Chế Độ Tự Động', description: 'Tự động bật/tắt các tính năng theo lịch trình', enabled: true },
    ],
  };
};

// Định nghĩa 3 gói mặc định
const defaultPackages = [
  {
    name: 'VIP 1 THÁNG',
    description: 'Hack Play Together 30 ngày',
    price: 199000,
    duration: 30,
    platform: 'all' as const,
    version: 'VV2.0.0',
    banRisk: 'medium' as const,
    antiBanGuarantee: false,
    popular: false,
    detailedFeatures: getPlayTogetherDefaultFeatures(),
    features: [
      'Auto Di Chuyển Thông Minh',
      'Auto Sửa Dụng Cụ Nâng Cao',
      'Auto Bảo Quản Thông Minh',
    ],
  },
  {
    name: 'VIP PREMIUM 3 THÁNG',
    description: 'Hack Play Together 90 ngày - GIÁ KHUYẾN MÃI',
    price: 349000,
    duration: 90,
    platform: 'all' as const,
    version: 'VV2.0.0',
    banRisk: 'none' as const,
    antiBanGuarantee: true,
    popular: false,
    detailedFeatures: getPlayTogetherDefaultFeatures(),
    features: [
      'Auto Di Chuyển Thông Minh AI',
      'Auto Sửa Dụng Cụ Nâng Cao',
      'Auto Bảo Quản Thông Minh',
      'Đảm bảo không ban - Hoàn tiền nếu bị ban',
    ],
  },
  {
    name: 'LIFETIME ELITE',
    description: 'Hack Play Together vĩnh viễn',
    price: 599000,
    duration: 365,
    platform: 'all' as const,
    version: 'VV2.0.0',
    banRisk: 'none' as const,
    antiBanGuarantee: true,
    popular: true,
    detailedFeatures: getPlayTogetherDefaultFeatures(),
    features: [
      'Auto Di Chuyển Thông Minh AI',
      'Auto Sửa Dụng Cụ Nâng Cao',
      'Auto Bảo Quản Thông Minh',
      'Đảm bảo không ban - Hoàn tiền nếu bị ban',
      'Hỗ trợ trọn đời',
    ],
  },
];

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token không hợp lệ' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '').trim();
    
    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { message: 'Token không hợp lệ hoặc đã hết hạn' },
        { status: 401 }
      );
    }

    // Auto set as admin if not admin
    await ensureAdmin(decoded);

    const allPackages = await Package.findAll();
    const results: any[] = [];

    for (const defaultPkg of defaultPackages) {
      // Tìm gói có tên tương tự
      const existing = allPackages.find((p: any) => 
        p.name && p.name.toLowerCase().includes(defaultPkg.name.toLowerCase().substring(0, 10))
      );

      if (existing) {
        // Update gói hiện có với tính năng đầy đủ
        const updated = await Package.update(existing.id, {
          detailedFeatures: defaultPkg.detailedFeatures,
          features: defaultPkg.features,
        });
        results.push({ name: defaultPkg.name, action: 'updated', package: updated });
      } else {
        // Tạo gói mới
        const created = await Package.create(defaultPkg);
        results.push({ name: defaultPkg.name, action: 'created', package: created });
      }
    }

    return NextResponse.json({
      message: 'Đã tạo/cập nhật 3 gói mặc định thành công!',
      results,
    });
  } catch (error: any) {
    console.error('[Seed Packages API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi tạo/cập nhật gói', error: error.message },
      { status: 500 }
    );
  }
}

