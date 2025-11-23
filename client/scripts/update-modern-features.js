/**
 * Update packages with modern Play Together hack features
 * Run: node scripts/update-modern-features.js
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

// Modern Play Together hack features 2024
const modernFeatures = {
  'VIP 1 THÁNG': {
    chung: [
      { name: 'Auto Di Chuyển Thông Minh', description: 'AI tự động tìm đường đi tối ưu, tránh chướng ngại vật', enabled: true },
      { name: 'Auto Sửa Dụng Cụ Nâng Cao', description: 'Tự động sửa chữa và tăng cấp dụng cụ khi hỏng', enabled: true },
      { name: 'Auto Bảo Quản Thông Minh', description: 'Tự động sắp xếp và bảo quản đồ vật theo giá trị', enabled: true },
      { name: 'Auto Mở Hộp Quà/Hộp Kho Báu', description: 'Tự động mở tất cả hộp quà, hộp kho báu, gói thẻ', enabled: true },
      { name: 'Auto Hoàn Thành Nhiệm Vụ', description: 'Tự động nhận và hoàn thành nhiệm vụ hàng ngày', enabled: true },
    ],
    map: [
      { name: 'Bản Đồ Hỗ Trợ Nâng Cao', description: 'Hiển thị tất cả vật phẩm, NPC, điểm quan trọng trên bản đồ', enabled: true },
      { name: 'Teleport Nhanh', description: 'Di chuyển tức thì đến bất kỳ vị trí nào trên bản đồ', enabled: true },
      { name: 'Auto Thu Thập Tài Nguyên', description: 'Tự động thu thập tất cả tài nguyên trên bản đồ', enabled: true },
      { name: 'Phát Hiện Vật Phẩm Hiếm', description: 'Tự động tìm và đánh dấu vật phẩm hiếm, quý giá', enabled: true },
    ],
    caidat: [
      { name: 'Anti-Detection V2', description: 'Chế độ chống phát hiện thế hệ mới nhất, 99.9% an toàn', enabled: true },
      { name: 'Tối Ưu Hiệu Suất Game', description: 'Tự động tối ưu FPS, giảm lag, tăng độ mượt mà', enabled: true },
      { name: 'Bypass Bản Cập Nhật', description: 'Tự động bỏ qua các bản cập nhật không cần thiết', enabled: true },
    ],
  },
  'VIP PREMIUM 3 THÁNG': {
    chung: [
      { name: 'Auto Di Chuyển Thông Minh', description: 'AI tự động tìm đường đi tối ưu, tránh chướng ngại vật', enabled: true },
      { name: 'Auto Sửa Dụng Cụ Nâng Cao', description: 'Tự động sửa chữa và tăng cấp dụng cụ khi hỏng', enabled: true },
      { name: 'Auto Bảo Quản Thông Minh', description: 'Tự động sắp xếp và bảo quản đồ vật theo giá trị', enabled: true },
      { name: 'Auto Mở Hộp Quà/Hộp Kho Báu', description: 'Tự động mở tất cả hộp quà, hộp kho báu, gói thẻ', enabled: true },
      { name: 'Auto Hoàn Thành Nhiệm Vụ', description: 'Tự động nhận và hoàn thành nhiệm vụ hàng ngày', enabled: true },
      { name: 'Auto Bán Hàng Thông Minh', description: 'Tự động bán đồ với giá tối ưu, lọc đồ có giá trị', enabled: true },
      { name: 'Auto Nâng Cấp Nhà Cửa', description: 'Tự động nâng cấp và mở rộng nhà cửa, trang trại', enabled: true },
      { name: 'Auto Trồng Trọt & Thu Hoạch', description: 'Tự động trồng cây, chăm sóc và thu hoạch', enabled: true },
    ],
    map: [
      { name: 'Bản Đồ Hỗ Trợ Nâng Cao', description: 'Hiển thị tất cả vật phẩm, NPC, điểm quan trọng trên bản đồ', enabled: true },
      { name: 'Teleport Nhanh', description: 'Di chuyển tức thì đến bất kỳ vị trí nào trên bản đồ', enabled: true },
      { name: 'Auto Thu Thập Tài Nguyên', description: 'Tự động thu thập tất cả tài nguyên trên bản đồ', enabled: true },
      { name: 'Phát Hiện Vật Phẩm Hiếm', description: 'Tự động tìm và đánh dấu vật phẩm hiếm, quý giá', enabled: true },
      { name: 'Auto Khám Phá Bản Đồ', description: 'Tự động khám phá các khu vực mới, mở khóa địa điểm', enabled: true },
      { name: 'Bản Đồ Toàn Giác', description: 'Hiển thị tất cả bí mật, kho báu ẩn trên bản đồ', enabled: true },
    ],
    contrung: [
      { name: 'Auto Bắt Côn Trùng Pro', description: 'Tự động tìm và bắt côn trùng hiếm, quý giá', enabled: true },
      { name: 'Lọc Côn Trùng Thông Minh', description: 'Chỉ bắt côn trùng hiếm, bỏ qua côn trùng thường', enabled: true },
      { name: 'Auto Nuôi Côn Trùng', description: 'Tự động nuôi, lai tạo và phát triển côn trùng', enabled: true },
      { name: 'Bộ Sưu Tập Côn Trùng', description: 'Tự động hoàn thành bộ sưu tập côn trùng', enabled: true },
      { name: 'Nhận Thành Tích Côn Trùng', description: 'Tự động nhận tất cả thành tích liên quan côn trùng', enabled: true },
    ],
    cauca: [
      { name: 'Auto Câu Cá Pro', description: 'Tự động câu cá tại vị trí tốt nhất, thời điểm tối ưu', enabled: true },
      { name: 'Lọc Cá Hiếm Thông Minh', description: 'Chỉ giữ cá hiếm, quý, tự động thả cá thường', enabled: true },
      { name: 'Auto Sửa Cần Câu', description: 'Tự động sửa và nâng cấp cần câu khi hỏng', enabled: true },
      { name: 'Auto Nuôi Cá', description: 'Tự động nuôi, lai tạo và phát triển cá', enabled: true },
      { name: 'Bộ Sưu Tập Cá', description: 'Tự động hoàn thành bộ sưu tập cá hiếm', enabled: true },
      { name: 'Câu Cá Ban Đêm', description: 'Tự động câu cá vào ban đêm để bắt cá hiếm', enabled: true },
    ],
    thuthap: [
      { name: 'Auto Thu Thập Tài Nguyên', description: 'Tự động thu thập tất cả tài nguyên trên map', enabled: true },
      { name: 'Ưu Tiên Vật Phẩm Quý', description: 'Tự động ưu tiên thu thập vật phẩm quý, hiếm', enabled: true },
      { name: 'Thu Thập AI', description: 'AI tự động chọn vị trí và thời gian thu thập tối ưu', enabled: true },
      { name: 'Auto Đào Kho Báu', description: 'Tự động tìm và đào kho báu ẩn trên bản đồ', enabled: true },
      { name: 'Thu Thập Theo Lịch', description: 'Lập lịch thu thập theo chu kỳ, thời điểm tốt nhất', enabled: true },
    ],
    sukien: [
      { name: 'Auto Tham Gia Sự Kiện', description: 'Tự động tham gia tất cả sự kiện hàng ngày, hàng tuần', enabled: true },
      { name: 'Auto Nhận Phần Thưởng', description: 'Tự động nhận tất cả phần thưởng sự kiện', enabled: true },
      { name: 'Tối Ưu Sự Kiện', description: 'Tự động chọn sự kiện có phần thưởng tốt nhất', enabled: true },
      { name: 'Auto Hoàn Thành Challenge', description: 'Tự động hoàn thành mọi thử thách sự kiện', enabled: true },
      { name: 'Nhận Reward VIP', description: 'Tự động nhận reward VIP và premium trong sự kiện', enabled: true },
    ],
    caidat: [
      { name: 'Anti-Detection V2', description: 'Chế độ chống phát hiện thế hệ mới nhất, 99.9% an toàn', enabled: true },
      { name: 'Tối Ưu Hiệu Suất Game', description: 'Tự động tối ưu FPS, giảm lag, tăng độ mượt mà', enabled: true },
      { name: 'Bypass Bản Cập Nhật', description: 'Tự động bỏ qua các bản cập nhật không cần thiết', enabled: true },
      { name: 'Custom Speed Mod', description: 'Tùy chỉnh tốc độ di chuyển, hành động (1x-10x)', enabled: true },
    ],
  },
  'LIFETIME ELITE': {
    chung: [
      { name: 'Auto Di Chuyển Thông Minh AI', description: 'AI thế hệ mới tự động tìm đường đi tối ưu, tránh chướng ngại vật', enabled: true },
      { name: 'Auto Sửa Dụng Cụ Nâng Cao', description: 'Tự động sửa chữa, tăng cấp và tối ưu dụng cụ', enabled: true },
      { name: 'Auto Bảo Quản Thông Minh', description: 'AI tự động sắp xếp và bảo quản đồ vật theo giá trị', enabled: true },
      { name: 'Auto Mở Hộp Quà/Hộp Kho Báu', description: 'Tự động mở tất cả hộp quà, hộp kho báu, gói thẻ', enabled: true },
      { name: 'Auto Hoàn Thành Nhiệm Vụ', description: 'Tự động nhận và hoàn thành mọi nhiệm vụ hàng ngày', enabled: true },
      { name: 'Auto Bán Hàng Thông Minh', description: 'AI tự động bán đồ với giá tối ưu, lọc đồ có giá trị', enabled: true },
      { name: 'Auto Nâng Cấp Nhà Cửa', description: 'Tự động nâng cấp và mở rộng nhà cửa, trang trại', enabled: true },
      { name: 'Auto Trồng Trọt & Thu Hoạch', description: 'Tự động trồng cây, chăm sóc và thu hoạch', enabled: true },
      { name: 'Auto Chế Tạo', description: 'Tự động chế tạo vật phẩm theo công thức tối ưu', enabled: true },
      { name: 'Auto Nấu Ăn', description: 'Tự động nấu ăn và tạo món ăn có giá trị cao', enabled: true },
    ],
    map: [
      { name: 'Bản Đồ Hỗ Trợ Nâng Cao', description: 'Hiển thị tất cả vật phẩm, NPC, điểm quan trọng trên bản đồ', enabled: true },
      { name: 'Teleport Nhanh', description: 'Di chuyển tức thì đến bất kỳ vị trí nào trên bản đồ', enabled: true },
      { name: 'Auto Thu Thập Tài Nguyên', description: 'Tự động thu thập tất cả tài nguyên trên bản đồ', enabled: true },
      { name: 'Phát Hiện Vật Phẩm Hiếm', description: 'Tự động tìm và đánh dấu vật phẩm hiếm, quý giá', enabled: true },
      { name: 'Auto Khám Phá Bản Đồ', description: 'Tự động khám phá các khu vực mới, mở khóa địa điểm', enabled: true },
      { name: 'Bản Đồ Toàn Giác', description: 'Hiển thị tất cả bí mật, kho báu ẩn trên bản đồ', enabled: true },
      { name: 'Bản Đồ 3D', description: 'Hiển thị bản đồ 3D với tất cả thông tin chi tiết', enabled: true },
    ],
    contrung: [
      { name: 'Auto Bắt Côn Trùng Pro', description: 'Tự động tìm và bắt côn trùng hiếm, quý giá', enabled: true },
      { name: 'Lọc Côn Trùng Thông Minh', description: 'Chỉ bắt côn trùng hiếm, bỏ qua côn trùng thường', enabled: true },
      { name: 'Auto Nuôi Côn Trùng', description: 'Tự động nuôi, lai tạo và phát triển côn trùng', enabled: true },
      { name: 'Bộ Sưu Tập Côn Trùng', description: 'Tự động hoàn thành bộ sưu tập côn trùng', enabled: true },
      { name: 'Nhận Thành Tích Côn Trùng', description: 'Tự động nhận tất cả thành tích liên quan côn trùng', enabled: true },
      { name: 'Auto Lai Tạo Côn Trùng', description: 'Tự động lai tạo để tạo ra côn trùng hiếm nhất', enabled: true },
    ],
    cauca: [
      { name: 'Auto Câu Cá Pro', description: 'Tự động câu cá tại vị trí tốt nhất, thời điểm tối ưu', enabled: true },
      { name: 'Lọc Cá Hiếm Thông Minh', description: 'Chỉ giữ cá hiếm, quý, tự động thả cá thường', enabled: true },
      { name: 'Auto Sửa Cần Câu', description: 'Tự động sửa và nâng cấp cần câu khi hỏng', enabled: true },
      { name: 'Auto Nuôi Cá', description: 'Tự động nuôi, lai tạo và phát triển cá', enabled: true },
      { name: 'Bộ Sưu Tập Cá', description: 'Tự động hoàn thành bộ sưu tập cá hiếm', enabled: true },
      { name: 'Câu Cá Ban Đêm', description: 'Tự động câu cá vào ban đêm để bắt cá hiếm', enabled: true },
      { name: 'Auto Câu Cá Boss', description: 'Tự động câu cá boss và quái vật hiếm', enabled: true },
    ],
    thuthap: [
      { name: 'Auto Thu Thập Tài Nguyên', description: 'Tự động thu thập tất cả tài nguyên trên map', enabled: true },
      { name: 'Ưu Tiên Vật Phẩm Quý', description: 'Tự động ưu tiên thu thập vật phẩm quý, hiếm', enabled: true },
      { name: 'Thu Thập AI', description: 'AI tự động chọn vị trí và thời gian thu thập tối ưu', enabled: true },
      { name: 'Auto Đào Kho Báu', description: 'Tự động tìm và đào kho báu ẩn trên bản đồ', enabled: true },
      { name: 'Thu Thập Theo Lịch', description: 'Lập lịch thu thập theo chu kỳ, thời điểm tốt nhất', enabled: true },
      { name: 'Auto Khai Thác Mỏ', description: 'Tự động khai thác mỏ và thu thập khoáng sản', enabled: true },
    ],
    sukien: [
      { name: 'Auto Tham Gia Sự Kiện', description: 'Tự động tham gia tất cả sự kiện hàng ngày, hàng tuần', enabled: true },
      { name: 'Auto Nhận Phần Thưởng', description: 'Tự động nhận tất cả phần thưởng sự kiện', enabled: true },
      { name: 'Tối Ưu Sự Kiện', description: 'Tự động chọn sự kiện có phần thưởng tốt nhất', enabled: true },
      { name: 'Auto Hoàn Thành Challenge', description: 'Tự động hoàn thành mọi thử thách sự kiện', enabled: true },
      { name: 'Nhận Reward VIP', description: 'Tự động nhận reward VIP và premium trong sự kiện', enabled: true },
      { name: 'Auto Sự Kiện Boss', description: 'Tự động tham gia và đánh bại boss trong sự kiện', enabled: true },
    ],
    minigame: [
      { name: 'Auto Chơi Mini Game', description: 'Tự động chơi và hoàn thành mọi mini game', enabled: true },
      { name: 'Auto Nhận Phần Thưởng', description: 'Tự động nhận phần thưởng từ mini game', enabled: true },
      { name: 'Tối Ưu Mini Game', description: 'AI tự động chọn mini game có phần thưởng cao nhất', enabled: true },
      { name: 'Auto Puzzle Game', description: 'Tự động giải puzzle và logic game', enabled: true },
      { name: 'Auto Racing Game', description: 'Tự động chơi racing game và giành chiến thắng', enabled: true },
      { name: 'Auto Match-3 Game', description: 'Tự động chơi match-3 và tạo combo cao', enabled: true },
    ],
    caidat: [
      { name: 'Anti-Detection V3', description: 'Chế độ chống phát hiện thế hệ mới nhất, 100% an toàn', enabled: true },
      { name: 'Tối Ưu Hiệu Suất Game', description: 'Tự động tối ưu FPS, giảm lag, tăng độ mượt mà', enabled: true },
      { name: 'Bypass Bản Cập Nhật', description: 'Tự động bỏ qua các bản cập nhật không cần thiết', enabled: true },
      { name: 'Custom Speed Mod', description: 'Tùy chỉnh tốc độ di chuyển, hành động (1x-20x)', enabled: true },
      { name: 'God Mode', description: 'Chế độ bất tử, không chết, không mất máu', enabled: true },
      { name: 'Unlimited Resources', description: 'Tài nguyên vô hạn (vàng, đá quý, vật liệu)', enabled: true },
      { name: 'Hỗ Trợ Trọn Đời', description: 'Cập nhật miễn phí vĩnh viễn, hỗ trợ 24/7', enabled: true },
    ],
  },
};

async function updateFeatures() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const [packageName, features] of Object.entries(modernFeatures)) {
      const pkg = await Package.findOne({ name: packageName });
      if (pkg) {
        pkg.detailedFeatures = features;
        pkg.version = '2.0.0'; // Update version
        await pkg.save();
        console.log(`✅ Updated modern features for: ${packageName}`);
      } else {
        console.log(`⚠️  Package not found: ${packageName}`);
      }
    }

    console.log('\n✅ Done! Features updated with modern Play Together hack capabilities!');
    console.log('📱 Refresh your browser to see the new features.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

updateFeatures();





