import { NextRequest, NextResponse } from 'next/server';
import { Package } from '@/lib/kv-models';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import { ensureAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Tính năng Play Together tháng 11/2025 - Bản mới nhất
const vip1MonthFeatures = {
  chung: [
    { name: 'Tự Động Tới', description: 'Tự động di chuyển đến vị trí chỉ định' },
    { name: 'Sửa Dụng Cụ', description: 'Tự động sửa chữa dụng cụ khi bị hỏng' },
    { name: 'Bảo Quản', description: 'Tự động bảo quản vật phẩm' },
    { name: 'Mở Hộp Quà/Gói Thẻ', description: 'Tự động mở hộp quà và gói thẻ' },
    { name: 'Tự Động Mua Đồ', description: 'Tự động mua đồ từ cửa hàng' },
    { name: 'Tự Động Sắp Xếp Kho', description: 'Tự động sắp xếp kho đồ gọn gàng' },
    { name: 'Tự Động Nấu Ăn', description: 'Tự động nấu ăn khi có nguyên liệu' },
    { name: 'Tự Động Dọn Dẹp', description: 'Tự động dọn dẹp nhà cửa' },
  ],
  map: [
    { name: 'Xem Bản Đồ Toàn Cảnh', description: 'Hiển thị toàn bộ bản đồ' },
    { name: 'Đánh Dấu Vị Trí Quan Trọng', description: 'Đánh dấu các vị trí cần thiết' },
    { name: 'Tìm Đường Ngắn Nhất', description: 'Tự động tìm đường đi ngắn nhất' },
    { name: 'Hiển Thị NPC Trên Bản Đồ', description: 'Hiển thị vị trí NPC trên bản đồ' },
  ],
  contrung: [
    { name: 'Tự Động Bắt Côn Trùng', description: 'Tự động tìm và bắt côn trùng' },
    { name: 'Hiển Thị Vị Trí Côn Trùng', description: 'Hiển thị vị trí côn trùng trên bản đồ' },
    { name: 'Lọc Côn Trùng Theo Loại', description: 'Chỉ bắt loại côn trùng đã chọn' },
    { name: 'Tự Động Bán Côn Trùng', description: 'Tự động bán côn trùng khi đầy túi' },
  ],
  cauca: [
    { name: 'Tự Động Câu Cá', description: 'Tự động câu cá khi có cần câu' },
    { name: 'Bỏ Qua Cá Nhỏ', description: 'Chỉ câu cá lớn, bỏ qua cá nhỏ' },
    { name: 'Câu Cá Theo Thời Gian', description: 'Tự động câu cá theo thời gian trong ngày' },
    { name: 'Tự Động Thay Mồi', description: 'Tự động thay mồi khi hết' },
  ],
  thuthap: [
    { name: 'Tự Động Thu Thập Tài Nguyên', description: 'Tự động thu thập tài nguyên xung quanh' },
    { name: 'Ưu Tiên Tài Nguyên Quý', description: 'Ưu tiên thu thập tài nguyên quý hiếm' },
    { name: 'Thu Thập Theo Khu Vực', description: 'Thu thập tài nguyên theo khu vực chỉ định' },
    { name: 'Tự Động Trồng Cây', description: 'Tự động trồng và chăm sóc cây' },
  ],
  sukien: [
    { name: 'Tham Gia Sự Kiện Tự Động', description: 'Tự động tham gia các sự kiện' },
    { name: 'Nhận Phần Thưởng Sự Kiện', description: 'Tự động nhận phần thưởng sự kiện' },
    { name: 'Hoàn Thành Nhiệm Vụ Sự Kiện', description: 'Tự động hoàn thành nhiệm vụ sự kiện' },
  ],
  minigame: [
    { name: 'Hỗ Trợ Mini Game Cơ Bản', description: 'Hỗ trợ một số mini game' },
    { name: 'Tự Động Chơi Mini Game', description: 'Tự động chơi mini game để nhận thưởng' },
  ],
  caidat: [
    { name: 'Cài Đặt Tốc Độ', description: 'Điều chỉnh tốc độ hack' },
    { name: 'Cài Đặt An Toàn', description: 'Cài đặt mức độ an toàn' },
    { name: 'Cài Đặt Tự Động Hóa', description: 'Cài đặt các tính năng tự động hóa' },
  ],
};

const vip3MonthFeatures = {
  chung: [
    { name: 'Tự Động Tới', description: 'Tự động di chuyển đến vị trí chỉ định' },
    { name: 'Sửa Dụng Cụ', description: 'Tự động sửa chữa dụng cụ khi bị hỏng' },
    { name: 'Bảo Quản', description: 'Tự động bảo quản vật phẩm' },
    { name: 'Mở Hộp Quà/Gói Thẻ', description: 'Tự động mở hộp quà và gói thẻ' },
    { name: 'Hiện Bảng Thông Tin', description: 'Hiển thị bảng thông tin chi tiết' },
    { name: 'Khôi Phục Trạng Thái', description: 'Tự động khôi phục trạng thái khi bị lỗi' },
    { name: 'Tự Động Mua Đồ', description: 'Tự động mua đồ từ cửa hàng' },
    { name: 'Tự Động Sắp Xếp Kho', description: 'Tự động sắp xếp kho đồ gọn gàng' },
    { name: 'Tự Động Nấu Ăn', description: 'Tự động nấu ăn khi có nguyên liệu' },
    { name: 'Tự Động Dọn Dẹp', description: 'Tự động dọn dẹp nhà cửa' },
    { name: 'Tự Động Tắm Rửa', description: 'Tự động tắm rửa cho nhân vật' },
    { name: 'Tự Động Ngủ', description: 'Tự động ngủ khi mệt' },
    { name: 'Tự Động Ăn Uống', description: 'Tự động ăn uống khi đói' },
    { name: 'Tự Động Mặc Đồ', description: 'Tự động mặc đồ đẹp nhất' },
    { name: 'Tự Động Trang Điểm', description: 'Tự động trang điểm cho nhân vật' },
  ],
  map: [
    { name: 'Xem Bản Đồ Toàn Cảnh', description: 'Hiển thị toàn bộ bản đồ' },
    { name: 'Đánh Dấu Vị Trí Quan Trọng', description: 'Đánh dấu các vị trí cần thiết' },
    { name: 'Tự Động Tìm Đường', description: 'Tự động tìm đường đi tối ưu' },
    { name: 'Teleport Nhanh', description: 'Dịch chuyển nhanh đến vị trí' },
    { name: 'Hiển Thị NPC Trên Bản Đồ', description: 'Hiển thị vị trí NPC trên bản đồ' },
    { name: 'Hiển Thị Tài Nguyên Trên Bản Đồ', description: 'Hiển thị vị trí tài nguyên trên bản đồ' },
    { name: 'Bản Đồ 3D', description: 'Xem bản đồ ở chế độ 3D' },
    { name: 'Phóng To/Thu Nhỏ', description: 'Phóng to thu nhỏ bản đồ linh hoạt' },
  ],
  contrung: [
    { name: 'Tự Động Bắt Côn Trùng', description: 'Tự động tìm và bắt côn trùng' },
    { name: 'Hiển Thị Vị Trí Côn Trùng', description: 'Hiển thị vị trí côn trùng trên bản đồ' },
    { name: 'Lọc Côn Trùng Quý', description: 'Chỉ bắt côn trùng quý hiếm' },
    { name: 'Tự Động Bán Côn Trùng', description: 'Tự động bán côn trùng khi đầy túi' },
    { name: 'Nuôi Côn Trùng', description: 'Tự động nuôi và chăm sóc côn trùng' },
    { name: 'Lai Tạo Côn Trùng', description: 'Tự động lai tạo côn trùng quý' },
    { name: 'Thu Thập Mật Ong', description: 'Tự động thu thập mật ong từ tổ ong' },
    { name: 'Bắt Côn Trùng Theo Thời Gian', description: 'Bắt côn trùng theo thời gian xuất hiện' },
  ],
  cauca: [
    { name: 'Tự Động Câu Cá', description: 'Tự động câu cá khi có cần câu' },
    { name: 'Bỏ Qua Cá Nhỏ', description: 'Chỉ câu cá lớn, bỏ qua cá nhỏ' },
    { name: 'Câu Cá Quý Hiếm', description: 'Ưu tiên câu cá quý hiếm' },
    { name: 'Tự Động Bán Cá', description: 'Tự động bán cá khi đầy túi' },
    { name: 'Nuôi Cá', description: 'Tự động nuôi và chăm sóc cá' },
    { name: 'Lai Tạo Cá', description: 'Tự động lai tạo cá quý' },
    { name: 'Câu Cá Theo Thời Gian', description: 'Tự động câu cá theo thời gian trong ngày' },
    { name: 'Tự Động Thay Mồi', description: 'Tự động thay mồi khi hết' },
    { name: 'Câu Cá Tự Động 24/7', description: 'Câu cá tự động cả ngày đêm' },
  ],
  thuthap: [
    { name: 'Tự Động Thu Thập Tài Nguyên', description: 'Tự động thu thập tài nguyên xung quanh' },
    { name: 'Ưu Tiên Tài Nguyên Quý', description: 'Ưu tiên thu thập tài nguyên quý hiếm' },
    { name: 'Thu Thập Tự Động 24/7', description: 'Thu thập tự động cả ngày' },
    { name: 'Tự Động Chế Tạo', description: 'Tự động chế tạo vật phẩm' },
    { name: 'Tự Động Nâng Cấp', description: 'Tự động nâng cấp vật phẩm' },
    { name: 'Quản Lý Kho', description: 'Tự động quản lý kho vật phẩm' },
    { name: 'Tự Động Trồng Cây', description: 'Tự động trồng và chăm sóc cây' },
    { name: 'Tự Động Thu Hoạch', description: 'Tự động thu hoạch cây trồng' },
    { name: 'Tự Động Tưới Nước', description: 'Tự động tưới nước cho cây' },
    { name: 'Tự Động Bón Phân', description: 'Tự động bón phân cho cây' },
    { name: 'Thu Thập Theo Khu Vực', description: 'Thu thập tài nguyên theo khu vực chỉ định' },
  ],
  sukien: [
    { name: 'Tham Gia Sự Kiện Tự Động', description: 'Tự động tham gia các sự kiện' },
    { name: 'Hoàn Thành Nhiệm Vụ Sự Kiện', description: 'Tự động hoàn thành nhiệm vụ sự kiện' },
    { name: 'Nhận Phần Thưởng Sự Kiện', description: 'Tự động nhận phần thưởng sự kiện' },
    { name: 'Thông Báo Sự Kiện', description: 'Thông báo khi có sự kiện mới' },
    { name: 'Tham Gia Sự Kiện Đặc Biệt', description: 'Tự động tham gia sự kiện đặc biệt' },
    { name: 'Hoàn Thành Thử Thách Sự Kiện', description: 'Tự động hoàn thành thử thách sự kiện' },
  ],
  minigame: [
    { name: 'Hỗ Trợ Mini Game Đầy Đủ', description: 'Hỗ trợ tất cả mini game' },
    { name: 'Tự Động Chơi Mini Game', description: 'Tự động chơi mini game để nhận thưởng' },
    { name: 'Tối Ưu Điểm Số', description: 'Tối ưu điểm số trong mini game' },
    { name: 'Hack Mini Game', description: 'Hack điểm số mini game' },
    { name: 'Nhận Thưởng Tối Đa', description: 'Nhận thưởng tối đa từ mini game' },
    { name: 'Tự Động Chơi Tất Cả Mini Game', description: 'Tự động chơi tất cả mini game có sẵn' },
  ],
  caidat: [
    { name: 'Cài Đặt Tốc Độ', description: 'Điều chỉnh tốc độ hack' },
    { name: 'Cài Đặt An Toàn', description: 'Cài đặt mức độ an toàn' },
    { name: 'Cài Đặt Nâng Cao', description: 'Các cài đặt nâng cao cho người dùng chuyên nghiệp' },
    { name: 'Lưu Cấu Hình', description: 'Lưu và tải cấu hình hack' },
    { name: 'Cài Đặt Tự Động Hóa', description: 'Cài đặt các tính năng tự động hóa' },
    { name: 'Cài Đặt Thông Báo', description: 'Cài đặt thông báo cho các sự kiện' },
  ],
};

const lifetimeFeatures = {
  chung: [
    { name: 'Tự Động Tới', description: 'Tự động di chuyển đến vị trí chỉ định' },
    { name: 'Sửa Dụng Cụ', description: 'Tự động sửa chữa dụng cụ khi bị hỏng' },
    { name: 'Bảo Quản', description: 'Tự động bảo quản vật phẩm' },
    { name: 'Mở Hộp Quà/Gói Thẻ', description: 'Tự động mở hộp quà và gói thẻ' },
    { name: 'Hiện Bảng Thông Tin', description: 'Hiển thị bảng thông tin chi tiết' },
    { name: 'Khôi Phục Trạng Thái', description: 'Tự động khôi phục trạng thái khi bị lỗi' },
    { name: 'Nhận Thành Tích', description: 'Tự động nhận thành tích' },
    { name: 'Chức Năng Gói Bán Nhanh', description: 'Tự động bán gói nhanh chóng' },
    { name: 'Tự Động Mua Đồ', description: 'Tự động mua đồ từ cửa hàng' },
    { name: 'Tự Động Sắp Xếp Kho', description: 'Tự động sắp xếp kho đồ gọn gàng' },
    { name: 'Tự Động Nấu Ăn', description: 'Tự động nấu ăn khi có nguyên liệu' },
    { name: 'Tự Động Dọn Dẹp', description: 'Tự động dọn dẹp nhà cửa' },
    { name: 'Tự Động Tắm Rửa', description: 'Tự động tắm rửa cho nhân vật' },
    { name: 'Tự Động Ngủ', description: 'Tự động ngủ khi mệt' },
    { name: 'Tự Động Ăn Uống', description: 'Tự động ăn uống khi đói' },
    { name: 'Tự Động Mặc Đồ', description: 'Tự động mặc đồ đẹp nhất' },
    { name: 'Tự Động Trang Điểm', description: 'Tự động trang điểm cho nhân vật' },
    { name: 'Tự Động Giao Tiếp', description: 'Tự động giao tiếp với NPC' },
    { name: 'Tự Động Làm Nhiệm Vụ', description: 'Tự động làm nhiệm vụ hàng ngày' },
    { name: 'Tự Động Quản Lý Thời Gian', description: 'Tự động quản lý thời gian trong game' },
  ],
  map: [
    { name: 'Xem Bản Đồ Toàn Cảnh', description: 'Hiển thị toàn bộ bản đồ' },
    { name: 'Đánh Dấu Vị Trí Quan Trọng', description: 'Đánh dấu các vị trí cần thiết' },
    { name: 'Tự Động Tìm Đường', description: 'Tự động tìm đường đi tối ưu' },
    { name: 'Teleport Nhanh', description: 'Dịch chuyển nhanh đến vị trí' },
    { name: 'Bản Đồ 3D', description: 'Xem bản đồ ở chế độ 3D' },
    { name: 'Phóng To/Thu Nhỏ', description: 'Phóng to thu nhỏ bản đồ linh hoạt' },
    { name: 'Hiển Thị NPC Trên Bản Đồ', description: 'Hiển thị vị trí NPC trên bản đồ' },
    { name: 'Hiển Thị Tài Nguyên Trên Bản Đồ', description: 'Hiển thị vị trí tài nguyên trên bản đồ' },
    { name: 'Hiển Thị Sự Kiện Trên Bản Đồ', description: 'Hiển thị vị trí sự kiện trên bản đồ' },
    { name: 'Bản Đồ Thời Gian Thực', description: 'Bản đồ cập nhật thời gian thực' },
    { name: 'Tìm Kiếm Vị Trí', description: 'Tìm kiếm vị trí bất kỳ trên bản đồ' },
  ],
  contrung: [
    { name: 'Tự Động Bắt Côn Trùng', description: 'Tự động tìm và bắt côn trùng' },
    { name: 'Hiển Thị Vị Trí Côn Trùng', description: 'Hiển thị vị trí côn trùng trên bản đồ' },
    { name: 'Lọc Côn Trùng Quý', description: 'Chỉ bắt côn trùng quý hiếm' },
    { name: 'Tự Động Bán Côn Trùng', description: 'Tự động bán côn trùng khi đầy túi' },
    { name: 'Nuôi Côn Trùng', description: 'Tự động nuôi và chăm sóc côn trùng' },
    { name: 'Lai Tạo Côn Trùng', description: 'Tự động lai tạo côn trùng quý' },
    { name: 'Thu Thập Mật Ong', description: 'Tự động thu thập mật ong từ tổ ong' },
    { name: 'Bắt Côn Trùng Theo Thời Gian', description: 'Bắt côn trùng theo thời gian xuất hiện' },
    { name: 'Tự Động Chăm Sóc Côn Trùng', description: 'Tự động chăm sóc côn trùng đã bắt' },
    { name: 'Nâng Cấp Côn Trùng', description: 'Tự động nâng cấp côn trùng' },
    { name: 'Bắt Côn Trùng Hiếm', description: 'Tự động tìm và bắt côn trùng hiếm' },
  ],
  cauca: [
    { name: 'Tự Động Câu Cá', description: 'Tự động câu cá khi có cần câu' },
    { name: 'Bỏ Qua Cá Nhỏ', description: 'Chỉ câu cá lớn, bỏ qua cá nhỏ' },
    { name: 'Câu Cá Quý Hiếm', description: 'Ưu tiên câu cá quý hiếm' },
    { name: 'Tự Động Bán Cá', description: 'Tự động bán cá khi đầy túi' },
    { name: 'Nuôi Cá', description: 'Tự động nuôi và chăm sóc cá' },
    { name: 'Lai Tạo Cá', description: 'Tự động lai tạo cá quý' },
    { name: 'Câu Cá Theo Thời Gian', description: 'Tự động câu cá theo thời gian trong ngày' },
    { name: 'Tự Động Thay Mồi', description: 'Tự động thay mồi khi hết' },
    { name: 'Câu Cá Tự Động 24/7', description: 'Câu cá tự động cả ngày đêm' },
    { name: 'Câu Cá Theo Vị Trí', description: 'Tự động câu cá ở vị trí tốt nhất' },
    { name: 'Nâng Cấp Cần Câu', description: 'Tự động nâng cấp cần câu' },
    { name: 'Câu Cá Hiếm', description: 'Tự động tìm và câu cá hiếm' },
  ],
  thuthap: [
    { name: 'Tự Động Thu Thập Tài Nguyên', description: 'Tự động thu thập tài nguyên xung quanh' },
    { name: 'Ưu Tiên Tài Nguyên Quý', description: 'Ưu tiên thu thập tài nguyên quý hiếm' },
    { name: 'Thu Thập Tự Động 24/7', description: 'Thu thập tự động cả ngày' },
    { name: 'Tự Động Chế Tạo', description: 'Tự động chế tạo vật phẩm' },
    { name: 'Tự Động Nâng Cấp', description: 'Tự động nâng cấp vật phẩm' },
    { name: 'Quản Lý Kho', description: 'Tự động quản lý kho vật phẩm' },
    { name: 'Tự Động Trồng Cây', description: 'Tự động trồng và chăm sóc cây' },
    { name: 'Tự Động Thu Hoạch', description: 'Tự động thu hoạch cây trồng' },
    { name: 'Tự Động Tưới Nước', description: 'Tự động tưới nước cho cây' },
    { name: 'Tự Động Bón Phân', description: 'Tự động bón phân cho cây' },
    { name: 'Thu Thập Theo Khu Vực', description: 'Thu thập tài nguyên theo khu vực chỉ định' },
    { name: 'Tự Động Khai Thác', description: 'Tự động khai thác khoáng sản' },
    { name: 'Tự Động Chặt Cây', description: 'Tự động chặt cây lấy gỗ' },
    { name: 'Tự Động Đào Đất', description: 'Tự động đào đất lấy đất sét' },
    { name: 'Tự Động Thu Thập Đá', description: 'Tự động thu thập đá' },
  ],
  sukien: [
    { name: 'Tham Gia Sự Kiện Tự Động', description: 'Tự động tham gia các sự kiện' },
    { name: 'Hoàn Thành Nhiệm Vụ Sự Kiện', description: 'Tự động hoàn thành nhiệm vụ sự kiện' },
    { name: 'Nhận Phần Thưởng Sự Kiện', description: 'Tự động nhận phần thưởng sự kiện' },
    { name: 'Thông Báo Sự Kiện', description: 'Thông báo khi có sự kiện mới' },
    { name: 'Tham Gia Sự Kiện Đặc Biệt', description: 'Tự động tham gia sự kiện đặc biệt' },
    { name: 'Hoàn Thành Thử Thách Sự Kiện', description: 'Tự động hoàn thành thử thách sự kiện' },
    { name: 'Nhận Quà Sự Kiện', description: 'Tự động nhận quà từ sự kiện' },
    { name: 'Tham Gia Sự Kiện Giới Hạn', description: 'Tự động tham gia sự kiện giới hạn thời gian' },
    { name: 'Hoàn Thành Sự Kiện Nhanh', description: 'Hoàn thành sự kiện với tốc độ nhanh nhất' },
  ],
  minigame: [
    { name: 'Hỗ Trợ Mini Game Đầy Đủ', description: 'Hỗ trợ tất cả mini game' },
    { name: 'Tự Động Chơi Mini Game', description: 'Tự động chơi mini game để nhận thưởng' },
    { name: 'Tối Ưu Điểm Số', description: 'Tối ưu điểm số trong mini game' },
    { name: 'Hack Mini Game', description: 'Hack điểm số mini game' },
    { name: 'Nhận Thưởng Tối Đa', description: 'Nhận thưởng tối đa từ mini game' },
    { name: 'Tự Động Chơi Tất Cả Mini Game', description: 'Tự động chơi tất cả mini game có sẵn' },
    { name: 'Hack Thời Gian Mini Game', description: 'Hack thời gian trong mini game' },
    { name: 'Tự Động Thắng Mini Game', description: 'Tự động thắng mọi mini game' },
    { name: 'Nhận Thưởng Mini Game X2', description: 'Nhận thưởng gấp đôi từ mini game' },
  ],
  caidat: [
    { name: 'Cài Đặt Tốc Độ', description: 'Điều chỉnh tốc độ hack' },
    { name: 'Cài Đặt An Toàn', description: 'Cài đặt mức độ an toàn' },
    { name: 'Cài Đặt Nâng Cao', description: 'Các cài đặt nâng cao cho người dùng chuyên nghiệp' },
    { name: 'Lưu Cấu Hình', description: 'Lưu và tải cấu hình hack' },
    { name: 'Cài Đặt Tùy Chỉnh', description: 'Tùy chỉnh mọi cài đặt theo ý muốn' },
    { name: 'Cập Nhật Tự Động', description: 'Tự động cập nhật tính năng mới' },
    { name: 'Cài Đặt Tự Động Hóa', description: 'Cài đặt các tính năng tự động hóa' },
    { name: 'Cài Đặt Thông Báo', description: 'Cài đặt thông báo cho các sự kiện' },
    { name: 'Cài Đặt Giao Diện', description: 'Tùy chỉnh giao diện hack' },
    { name: 'Cài Đặt Hotkey', description: 'Cài đặt phím tắt cho các tính năng' },
  ],
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Allow GET request for easy access (can be called from browser)
    // In production, you might want to add authentication here too
    
    // Get all packages
    const packages = await Package.findAll();
    
    let updatedCount = 0;
    
    for (const pkg of packages) {
      let featuresToAdd: any = null;
      
      // Match package by name
      if (pkg.name.includes('VIP 1 THÁNG') || pkg.name.includes('1 THÁNG')) {
        featuresToAdd = vip1MonthFeatures;
      } else if (pkg.name.includes('VIP PREMIUM 3 THÁNG') || pkg.name.includes('3 THÁNG')) {
        featuresToAdd = vip3MonthFeatures;
      } else if (pkg.name.includes('LIFETIME') || pkg.name.includes('ELITE')) {
        featuresToAdd = lifetimeFeatures;
      }
      
      if (featuresToAdd) {
        await Package.update(pkg.id, {
          detailedFeatures: featuresToAdd
        });
        updatedCount++;
        console.log(`✓ Updated features for package: ${pkg.name}`);
      }
    }

    return NextResponse.json({
      message: `Đã thêm tính năng vào ${updatedCount} gói`,
      updated: updatedCount,
      packages: packages.map(p => ({ id: p.id, name: p.name }))
    });
  } catch (error: any) {
    console.error('[Add Features API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}

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

    // Get all packages
    const packages = await Package.findAll();
    
    let updatedCount = 0;
    
    for (const pkg of packages) {
      let featuresToAdd: any = null;
      
      // Match package by name
      if (pkg.name.includes('VIP 1 THÁNG') || pkg.name.includes('1 THÁNG')) {
        featuresToAdd = vip1MonthFeatures;
      } else if (pkg.name.includes('VIP PREMIUM 3 THÁNG') || pkg.name.includes('3 THÁNG')) {
        featuresToAdd = vip3MonthFeatures;
      } else if (pkg.name.includes('LIFETIME') || pkg.name.includes('ELITE')) {
        featuresToAdd = lifetimeFeatures;
      }
      
      if (featuresToAdd) {
        await Package.update(pkg.id, {
          detailedFeatures: featuresToAdd
        });
        updatedCount++;
        console.log(`✓ Updated features for package: ${pkg.name}`);
      }
    }

    return NextResponse.json({
      message: `Đã thêm tính năng vào ${updatedCount} gói`,
      updated: updatedCount
    });
  } catch (error: any) {
    console.error('[Add Features API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}

