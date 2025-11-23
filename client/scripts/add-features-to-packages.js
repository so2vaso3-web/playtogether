/**
 * Add detailed features to existing packages
 * Run: node scripts/add-features-to-packages.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/playtogether_hack';

const packageSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  duration: Number,
  features: [String],
  detailedFeatures: mongoose.Schema.Types.Mixed,
  icon: String,
  popular: Boolean,
  platform: String,
  downloadUrl: String,
  systemRequirements: String,
  screenshots: [String],
  version: String,
}, { timestamps: true });

const Package = mongoose.models.Package || mongoose.model('Package', packageSchema);

const featuresData = {
  'VIP 1 THÁNG': {
    chung: [
      { name: 'Tự Động Tới', description: 'Tự động di chuyển đến vị trí mục tiêu', enabled: true },
      { name: 'Sửa Dụng Cụ', description: 'Tự động sửa chữa dụng cụ khi hỏng', enabled: true },
      { name: 'Bảo Quản', description: 'Tự động bảo quản đồ vật trong kho', enabled: true },
      { name: 'Mở Hộp Quà/Gói Thẻ', description: 'Tự động mở tất cả hộp quà và gói thẻ', enabled: true },
    ],
    map: [
      { name: 'Hiện Bảng Thông Tin', description: 'Hiển thị thông tin chi tiết trên bản đồ', enabled: true },
      { name: 'Khôi Phục Trạng Thái', description: 'Tự động khôi phục trạng thái khi đăng nhập lại', enabled: true },
    ],
    caidat: [
      { name: 'Cài Đặt Nhanh', description: 'Tự động cấu hình tối ưu cho game', enabled: true },
    ],
  },
  'VIP PREMIUM 3 THÁNG': {
    chung: [
      { name: 'Tự Động Tới', description: 'Tự động di chuyển đến vị trí mục tiêu', enabled: true },
      { name: 'Sửa Dụng Cụ', description: 'Tự động sửa chữa dụng cụ khi hỏng', enabled: true },
      { name: 'Bảo Quản', description: 'Tự động bảo quản đồ vật trong kho', enabled: true },
      { name: 'Mở Hộp Quà/Gói Thẻ', description: 'Tự động mở tất cả hộp quà và gói thẻ', enabled: true },
      { name: 'Chức Năng Gói Bán Nhanh', description: 'Tự động bán gói với giá tối ưu', enabled: true },
    ],
    map: [
      { name: 'Hiện Bảng Thông Tin', description: 'Hiển thị thông tin chi tiết trên bản đồ', enabled: true },
      { name: 'Khôi Phục Trạng Thái', description: 'Tự động khôi phục trạng thái khi đăng nhập lại', enabled: true },
      { name: 'Tự Động Thu Thập', description: 'Tự động thu thập tài nguyên trên bản đồ', enabled: true },
    ],
    contrung: [
      { name: 'Tự Động Bắt Côn Trùng', description: 'Tự động tìm và bắt côn trùng', enabled: true },
      { name: 'Lọc Côn Trùng Hiếm', description: 'Chỉ bắt côn trùng hiếm và có giá trị', enabled: true },
      { name: 'Nhận Thành Tích', description: 'Tự động nhận thành tích khi đủ điều kiện', enabled: true },
    ],
    cauca: [
      { name: 'Tự Động Câu Cá', description: 'Tự động câu cá tại vị trí tốt nhất', enabled: true },
      { name: 'Lọc Cá Hiếm', description: 'Chỉ giữ lại cá hiếm và có giá trị', enabled: true },
      { name: 'Sửa Cần Câu', description: 'Tự động sửa cần câu khi hỏng', enabled: true },
    ],
    thuthap: [
      { name: 'Tự Động Thu Thập', description: 'Tự động thu thập tài nguyên trên map', enabled: true },
      { name: 'Ưu Tiên Vật Phẩm', description: 'Ưu tiên thu thập vật phẩm có giá trị', enabled: true },
    ],
    sukien: [
      { name: 'Tham Gia Sự Kiện', description: 'Tự động tham gia các sự kiện hàng ngày', enabled: true },
      { name: 'Nhận Phần Thưởng', description: 'Tự động nhận phần thưởng sự kiện', enabled: true },
    ],
    caidat: [
      { name: 'Cài Đặt Nhanh', description: 'Tự động cấu hình tối ưu cho game', enabled: true },
      { name: 'Anti-Ban Nâng Cao', description: 'Chế độ chống ban tiên tiến', enabled: true },
    ],
  },
  'LIFETIME ELITE': {
    chung: [
      { name: 'Tự Động Tới', description: 'Tự động di chuyển đến vị trí mục tiêu', enabled: true },
      { name: 'Sửa Dụng Cụ', description: 'Tự động sửa chữa dụng cụ khi hỏng', enabled: true },
      { name: 'Bảo Quản', description: 'Tự động bảo quản đồ vật trong kho', enabled: true },
      { name: 'Mở Hộp Quà/Gói Thẻ', description: 'Tự động mở tất cả hộp quà và gói thẻ', enabled: true },
      { name: 'Chức Năng Gói Bán Nhanh', description: 'Tự động bán gói với giá tối ưu', enabled: true },
    ],
    map: [
      { name: 'Hiện Bảng Thông Tin', description: 'Hiển thị thông tin chi tiết trên bản đồ', enabled: true },
      { name: 'Khôi Phục Trạng Thái', description: 'Tự động khôi phục trạng thái khi đăng nhập lại', enabled: true },
      { name: 'Tự Động Thu Thập', description: 'Tự động thu thập tài nguyên trên bản đồ', enabled: true },
      { name: 'Tối Ưu Bản Đồ', description: 'Tự động tối ưu đường đi trên bản đồ', enabled: true },
    ],
    contrung: [
      { name: 'Tự Động Bắt Côn Trùng', description: 'Tự động tìm và bắt côn trùng', enabled: true },
      { name: 'Lọc Côn Trùng Hiếm', description: 'Chỉ bắt côn trùng hiếm và có giá trị', enabled: true },
      { name: 'Nhận Thành Tích', description: 'Tự động nhận thành tích khi đủ điều kiện', enabled: true },
      { name: 'Nuôi Côn Trùng', description: 'Tự động nuôi và phát triển côn trùng', enabled: true },
    ],
    cauca: [
      { name: 'Tự Động Câu Cá', description: 'Tự động câu cá tại vị trí tốt nhất', enabled: true },
      { name: 'Lọc Cá Hiếm', description: 'Chỉ giữ lại cá hiếm và có giá trị', enabled: true },
      { name: 'Sửa Cần Câu', description: 'Tự động sửa cần câu khi hỏng', enabled: true },
      { name: 'Nuôi Cá', description: 'Tự động nuôi và phát triển cá', enabled: true },
    ],
    thuthap: [
      { name: 'Tự Động Thu Thập', description: 'Tự động thu thập tài nguyên trên map', enabled: true },
      { name: 'Ưu Tiên Vật Phẩm', description: 'Ưu tiên thu thập vật phẩm có giá trị', enabled: true },
      { name: 'Thu Thập Thông Minh', description: 'AI tự động chọn vị trí tốt nhất', enabled: true },
    ],
    sukien: [
      { name: 'Tham Gia Sự Kiện', description: 'Tự động tham gia các sự kiện hàng ngày', enabled: true },
      { name: 'Nhận Phần Thưởng', description: 'Tự động nhận phần thưởng sự kiện', enabled: true },
      { name: 'Tối Ưu Sự Kiện', description: 'Tự động chọn sự kiện có phần thưởng tốt nhất', enabled: true },
    ],
    minigame: [
      { name: 'Tự Động Chơi Mini Game', description: 'Tự động chơi và hoàn thành mini game', enabled: true },
      { name: 'Nhận Phần Thưởng Mini Game', description: 'Tự động nhận phần thưởng từ mini game', enabled: true },
      { name: 'Tối Ưu Mini Game', description: 'Tự động chọn mini game có phần thưởng cao', enabled: true },
    ],
    caidat: [
      { name: 'Cài Đặt Nhanh', description: 'Tự động cấu hình tối ưu cho game', enabled: true },
      { name: 'Anti-Ban Cao Cấp', description: 'Chế độ chống ban tiên tiến nhất', enabled: true },
      { name: 'Tối Ưu Hiệu Suất', description: 'Tự động tối ưu hiệu suất game', enabled: true },
      { name: 'Hỗ Trợ Trọn Đời', description: 'Hỗ trợ và cập nhật miễn phí vĩnh viễn', enabled: true },
    ],
  },
};

async function addFeatures() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const [packageName, features] of Object.entries(featuresData)) {
      const pkg = await Package.findOne({ name: packageName });
      if (pkg) {
        pkg.detailedFeatures = features;
        await pkg.save();
        console.log(`✅ Added features to: ${packageName}`);
      } else {
        console.log(`⚠️  Package not found: ${packageName}`);
      }
    }

    console.log('\n✅ Done! Now refresh the package detail page to see the GUI.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

addFeatures();





