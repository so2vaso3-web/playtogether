const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/playtogether_hack', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Package Schema
const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  duration: { type: Number, default: 30 },
  features: [String],
  detailedFeatures: { type: mongoose.Schema.Types.Mixed, default: {} },
  icon: String,
  popular: { type: Boolean, default: false },
  platform: { type: String, enum: ['android', 'ios', 'emulator', 'all'], default: 'all' },
  downloadUrl: String,
  systemRequirements: String,
  version: String,
  banRisk: { type: String, enum: ['none', 'low', 'medium', 'high'], default: 'medium' },
  antiBanGuarantee: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Package = mongoose.model('Package', packageSchema);

// Tính năng cho VIP 1 THÁNG - Play Together
const vip1MonthFeatures = {
  chung: [
    { name: 'Tự Động Tới', description: 'Tự động di chuyển đến vị trí chỉ định trên bản đồ', enabled: true },
    { name: 'Sửa Dụng Cụ', description: 'Tự động sửa chữa dụng cụ khi bị hỏng', enabled: true },
    { name: 'Bảo Quản', description: 'Tự động bảo quản đồ vật vào kho', enabled: true },
    { name: 'Mở Hộp Quà/Gói Thẻ', description: 'Tự động mở hộp quà và gói thẻ nhận được', enabled: true },
    { name: 'Chức Năng Gói Bán Nhanh', description: 'Bán nhanh các gói đồ vật trong kho', enabled: true },
    { name: 'Hiện Bảng Thông Tin', description: 'Hiển thị bảng thông tin chi tiết về game', enabled: true },
    { name: 'Khôi Phục Trạng Thái', description: 'Khôi phục trạng thái game khi bị lỗi', enabled: true },
    { name: 'Nhận Thành Tích', description: 'Tự động nhận thành tích và phần thưởng', enabled: true },
  ],
  map: [
    { name: 'Dịch Chuyển Tức Thời', description: 'Dịch chuyển nhanh đến bất kỳ đâu trên bản đồ', enabled: true },
    { name: 'Xuyên Tường', description: 'Đi xuyên qua tường và vật cản', enabled: true },
    { name: 'ESP Đầy Đủ Tính Năng', description: 'Hiển thị thông tin đầy đủ trên bản đồ', enabled: true },
    { name: 'Bản Đồ Thu Nhỏ', description: 'Bản đồ thu nhỏ với đánh dấu vị trí', enabled: true },
    { name: 'Hệ Thống Điểm Đánh Dấu', description: 'Đánh dấu và lưu các điểm quan trọng', enabled: true },
    { name: 'Phóng To Thu Nhỏ Bản Đồ', description: 'Phóng to thu nhỏ bản đồ linh hoạt', enabled: true },
  ],
  contrung: [
    { name: 'Tự Động Bắt Côn Trùng', description: 'Tự động tìm và bắt côn trùng trên bản đồ', enabled: true },
    { name: 'Hiển Thị Vị Trí Côn Trùng', description: 'Hiển thị vị trí tất cả côn trùng trên map', enabled: true },
    { name: 'Tăng Tỷ Lệ Bắt Thành Công', description: 'Tăng tỷ lệ bắt côn trùng thành công', enabled: true },
    { name: 'Tự Động Thu Thập Côn Trùng', description: 'Tự động thu thập côn trùng vào túi đồ', enabled: true },
    { name: 'Lọc Côn Trùng Hiếm', description: 'Tự động tìm và bắt côn trùng hiếm', enabled: true },
  ],
  cauca: [
    { name: 'Tự Động Câu Cá', description: 'Tự động câu cá tại các điểm câu', enabled: true },
    { name: 'Hiển Thị Vị Trí Cá', description: 'Hiển thị vị trí cá trên bản đồ', enabled: true },
    { name: 'Tăng Tỷ Lệ Câu Thành Công', description: 'Tăng tỷ lệ câu cá thành công', enabled: true },
    { name: 'Tự Động Thu Thập Cá', description: 'Tự động thu thập cá vào kho', enabled: true },
    { name: 'Lọc Cá Hiếm', description: 'Tự động tìm và câu cá hiếm', enabled: true },
  ],
  thuthap: [
    { name: 'Tự Động Thu Thập Tài Nguyên', description: 'Tự động thu thập tài nguyên trên bản đồ', enabled: true },
    { name: 'Hiển Thị Vị Trí Tài Nguyên', description: 'Hiển thị vị trí tất cả tài nguyên', enabled: true },
    { name: 'Tăng Tốc Độ Thu Thập', description: 'Tăng tốc độ thu thập tài nguyên', enabled: true },
    { name: 'Tự Động Trồng Cây', description: 'Tự động trồng và thu hoạch cây', enabled: true },
    { name: 'Tự Động Nuôi Động Vật', description: 'Tự động cho ăn và thu hoạch từ động vật', enabled: true },
  ],
  sukien: [
    { name: 'Tự Động Tham Gia Sự Kiện', description: 'Tự động tham gia các sự kiện trong game', enabled: true },
    { name: 'Hiển Thị Thông Tin Sự Kiện', description: 'Hiển thị thông tin chi tiết về sự kiện', enabled: true },
    { name: 'Tự Động Nhận Phần Thưởng', description: 'Tự động nhận phần thưởng từ sự kiện', enabled: true },
  ],
  minigame: [
    { name: 'Tự Động Chơi Mini Game', description: 'Tự động chơi các mini game trong game', enabled: true },
    { name: 'Tăng Tỷ Lệ Thắng', description: 'Tăng tỷ lệ thắng trong mini game', enabled: true },
    { name: 'Tự Động Hoàn Thành Nhiệm Vụ', description: 'Tự động hoàn thành nhiệm vụ mini game', enabled: true },
  ],
  caidat: [
    { name: 'Tăng Tốc Di Chuyển', description: 'Tăng tốc độ di chuyển nhân vật mượt mà', enabled: true },
    { name: 'Tăng Tốc Hành Động', description: 'Tăng tốc độ thực hiện các hành động', enabled: true },
    { name: 'Vô Hạn Năng Lượng', description: 'Năng lượng không bao giờ hết', enabled: true },
    { name: 'Vô Hạn Tiền Vàng', description: 'Tiền vàng không bao giờ hết', enabled: true },
    { name: 'Bỏ Qua Thời Gian Chờ', description: 'Bỏ qua thời gian chờ các hành động', enabled: true },
  ],
};

// Tính năng cho VIP PREMIUM 3 THÁNG - Play Together (tất cả tính năng VIP 1 tháng + thêm)
const vip3MonthFeatures = {
  chung: [
    ...vip1MonthFeatures.chung,
    { name: 'Hỗ Trợ VIP 24/7', description: 'Hỗ trợ VIP 24/7 qua Zalo/Telegram', enabled: true },
    { name: 'Cập Nhật Ưu Tiên', description: 'Nhận cập nhật tính năng mới trước', enabled: true },
    { name: 'Tính Năng Tùy Chỉnh', description: 'Tùy chỉnh các tính năng theo ý muốn', enabled: true },
    { name: 'Tự Động Xây Nhà', description: 'Tự động xây dựng và trang trí nhà', enabled: true },
    { name: 'Tự Động Nấu Ăn', description: 'Tự động nấu các món ăn trong game', enabled: true },
  ],
  map: [
    ...vip1MonthFeatures.map,
    { name: 'ESP Nâng Cao', description: 'ESP nâng cao với nhiều tùy chọn hiển thị', enabled: true },
    { name: 'Xem Bản Đồ 3D', description: 'Xem bản đồ ở chế độ 3D', enabled: true },
    { name: 'Tự Động Điều Hướng', description: 'Tự động điều hướng đến địa điểm', enabled: true },
    { name: 'Đánh Dấu Nhiều Điểm', description: 'Đánh dấu nhiều điểm cùng lúc', enabled: true },
  ],
  contrung: [
    ...vip1MonthFeatures.contrung,
    { name: 'Tự Động Bắt Côn Trùng Hiếm', description: 'Tự động tìm và bắt côn trùng hiếm', enabled: true },
    { name: 'Tăng Tỷ Lệ Bắt Côn Trùng Hiếm', description: 'Tăng tỷ lệ bắt côn trùng hiếm lên 100%', enabled: true },
    { name: 'Lọc Côn Trùng Theo Loại', description: 'Lọc và bắt côn trùng theo loại', enabled: true },
  ],
  cauca: [
    ...vip1MonthFeatures.cauca,
    { name: 'Tự Động Câu Cá Hiếm', description: 'Tự động tìm và câu cá hiếm', enabled: true },
    { name: 'Tăng Tỷ Lệ Câu Cá Hiếm', description: 'Tăng tỷ lệ câu cá hiếm lên 100%', enabled: true },
    { name: 'Lọc Cá Theo Loại', description: 'Lọc và câu cá theo loại', enabled: true },
  ],
  thuthap: [
    ...vip1MonthFeatures.thuthap,
    { name: 'Tự Động Thu Thập Tài Nguyên Hiếm', description: 'Tự động thu thập tài nguyên hiếm', enabled: true },
    { name: 'Tăng Tốc Thu Thập Tài Nguyên Hiếm', description: 'Tăng tốc thu thập tài nguyên hiếm', enabled: true },
    { name: 'Tự Động Trồng Cây Hiếm', description: 'Tự động trồng và thu hoạch cây hiếm', enabled: true },
    { name: 'Tự Động Nuôi Động Vật Hiếm', description: 'Tự động nuôi và thu hoạch từ động vật hiếm', enabled: true },
  ],
  sukien: [
    ...vip1MonthFeatures.sukien,
    { name: 'Tự Động Hoàn Thành Sự Kiện', description: 'Tự động hoàn thành tất cả sự kiện', enabled: true },
    { name: 'Hiển Thị Phần Thưởng Sự Kiện', description: 'Hiển thị phần thưởng từ sự kiện', enabled: true },
    { name: 'Tự Động Nhận Tất Cả Phần Thưởng', description: 'Tự động nhận tất cả phần thưởng sự kiện', enabled: true },
  ],
  minigame: [
    ...vip1MonthFeatures.minigame,
    { name: 'Tự Động Thắng Mini Game', description: 'Tự động thắng tất cả mini game', enabled: true },
    { name: 'Hiển Thị Thông Tin Mini Game', description: 'Hiển thị thông tin chi tiết mini game', enabled: true },
    { name: 'Bỏ Qua Mini Game', description: 'Bỏ qua mini game và nhận phần thưởng', enabled: true },
  ],
  caidat: [
    ...vip1MonthFeatures.caidat,
    { name: 'Vô Hạn Vật Phẩm', description: 'Vật phẩm trong kho không bao giờ hết', enabled: true },
    { name: 'Vô Hạn Đồ Trang Trí', description: 'Đồ trang trí nhà không giới hạn', enabled: true },
    { name: 'Chống Ban Nâng Cao', description: 'Hệ thống chống ban nâng cao', enabled: true },
    { name: 'Cấu Hình Tùy Chỉnh', description: 'Cấu hình tùy chỉnh tất cả tính năng', enabled: true },
    { name: 'Tăng Tốc Game', description: 'Tăng tốc độ game lên 2x, 3x, 5x', enabled: true },
  ],
};

// Tính năng cho LIFETIME ELITE - Play Together (tất cả tính năng + thêm tính năng độc quyền)
const lifetimeFeatures = {
  chung: [
    ...vip3MonthFeatures.chung,
    { name: 'Hỗ Trợ Elite 24/7 Riêng', description: 'Hỗ trợ Elite 24/7 riêng qua Zalo/Telegram', enabled: true },
    { name: 'Cập Nhật Miễn Phí Mãi Mãi', description: 'Cập nhật tính năng mới miễn phí mãi mãi', enabled: true },
    { name: 'Tính Năng Độc Quyền', description: 'Tính năng độc quyền chỉ có ở gói Elite', enabled: true },
    { name: 'Truy Cập Tính Năng Beta', description: 'Truy cập sớm các tính năng beta', enabled: true },
    { name: 'Tự Động Xây Nhà Nâng Cao', description: 'Tự động xây nhà với thiết kế đẹp nhất', enabled: true },
    { name: 'Tự Động Nấu Tất Cả Món', description: 'Tự động nấu tất cả món ăn trong game', enabled: true },
  ],
  map: [
    ...vip3MonthFeatures.map,
    { name: 'ESP Elite Đầy Đủ', description: 'ESP Elite với đầy đủ tính năng nâng cao', enabled: true },
    { name: 'Đồng Bộ Bản Đồ Real-time', description: 'Đồng bộ bản đồ real-time với server', enabled: true },
    { name: 'Hệ Thống Điểm Đánh Dấu Nâng Cao', description: 'Hệ thống điểm đánh dấu nâng cao', enabled: true },
    { name: 'Xem Bản Đồ Toàn Cảnh', description: 'Xem toàn cảnh bản đồ từ trên cao', enabled: true },
  ],
  contrung: [
    ...vip3MonthFeatures.contrung,
    { name: 'Tự Động Bắt Tất Cả Côn Trùng', description: 'Tự động bắt tất cả côn trùng trên map', enabled: true },
    { name: 'ESP Côn Trùng Nâng Cao', description: 'ESP côn trùng nâng cao với thông tin chi tiết', enabled: true },
    { name: 'Tự Động Bắt Côn Trùng Mọi Lúc', description: 'Tự động bắt côn trùng mọi lúc mọi nơi', enabled: true },
  ],
  cauca: [
    ...vip3MonthFeatures.cauca,
    { name: 'Tự Động Câu Tất Cả Cá', description: 'Tự động câu tất cả cá trên map', enabled: true },
    { name: 'ESP Cá Nâng Cao', description: 'ESP cá nâng cao với thông tin chi tiết', enabled: true },
    { name: 'Tự Động Câu Cá Mọi Lúc', description: 'Tự động câu cá mọi lúc mọi nơi', enabled: true },
  ],
  thuthap: [
    ...vip3MonthFeatures.thuthap,
    { name: 'Tự Động Thu Thập Tất Cả Tài Nguyên', description: 'Tự động thu thập tất cả tài nguyên trên map', enabled: true },
    { name: 'ESP Tài Nguyên Nâng Cao', description: 'ESP tài nguyên nâng cao với thông tin chi tiết', enabled: true },
    { name: 'Tự Động Trồng Tất Cả Loại Cây', description: 'Tự động trồng và thu hoạch tất cả loại cây', enabled: true },
    { name: 'Tự Động Nuôi Tất Cả Động Vật', description: 'Tự động nuôi và thu hoạch từ tất cả động vật', enabled: true },
  ],
  sukien: [
    ...vip3MonthFeatures.sukien,
    { name: 'Tự Động Hoàn Thành Tất Cả Sự Kiện', description: 'Tự động hoàn thành tất cả sự kiện trong game', enabled: true },
    { name: 'ESP Sự Kiện Nâng Cao', description: 'ESP sự kiện nâng cao với thông tin chi tiết', enabled: true },
    { name: 'Tự Động Nhận Tất Cả Phần Thưởng Sự Kiện', description: 'Tự động nhận tất cả phần thưởng từ sự kiện', enabled: true },
  ],
  minigame: [
    ...vip3MonthFeatures.minigame,
    { name: 'Tự Động Thắng Tất Cả Mini Game', description: 'Tự động thắng tất cả mini game trong game', enabled: true },
    { name: 'ESP Mini Game Nâng Cao', description: 'ESP mini game nâng cao với thông tin chi tiết', enabled: true },
    { name: 'Tự Động Hoàn Thành Tất Cả Mini Game', description: 'Tự động hoàn thành tất cả mini game', enabled: true },
  ],
  caidat: [
    ...vip3MonthFeatures.caidat,
    { name: 'Vô Hạn Tất Cả Vật Phẩm', description: 'Tất cả vật phẩm trong game đều vô hạn', enabled: true },
    { name: 'Vô Hạn Tiền Vàng Kim Cương', description: 'Tiền, vàng, kim cương đều vô hạn', enabled: true },
    { name: 'Chống Ban Elite', description: 'Hệ thống chống ban Elite cao cấp nhất', enabled: true },
    { name: 'Cấu Hình Tùy Chỉnh Nâng Cao', description: 'Cấu hình tùy chỉnh nâng cao tất cả tính năng', enabled: true },
    { name: 'Tăng Hiệu Suất Game Tối Đa', description: 'Tăng hiệu suất game lên tối đa', enabled: true },
    { name: 'Bỏ Qua Tất Cả Thời Gian Chờ', description: 'Bỏ qua tất cả thời gian chờ trong game', enabled: true },
  ],
};

async function addFeaturesToPackages() {
  try {
    console.log('🔍 Đang tìm các gói...');
    
    // Tìm các gói
    const vip1Month = await Package.findOne({ 
      $or: [
        { name: /VIP.*1.*THÁNG/i },
        { name: /VIP.*1.*MONTH/i },
        { name: /VIP.*30.*ngày/i },
      ]
    });
    
    const vip3Month = await Package.findOne({ 
      $or: [
        { name: /VIP.*3.*THÁNG/i },
        { name: /VIP.*PREMIUM.*3/i },
        { name: /VIP.*90.*ngày/i },
      ]
    });
    
    const lifetime = await Package.findOne({ 
      $or: [
        { name: /LIFETIME/i },
        { name: /ELITE/i },
        { name: /vĩnh viễn/i },
      ]
    });
    
    console.log('📦 Gói tìm thấy:');
    console.log('- VIP 1 THÁNG:', vip1Month ? vip1Month.name : 'KHÔNG TÌM THẤY');
    console.log('- VIP 3 THÁNG:', vip3Month ? vip3Month.name : 'KHÔNG TÌM THẤY');
    console.log('- LIFETIME:', lifetime ? lifetime.name : 'KHÔNG TÌM THẤY');
    
    // Cập nhật VIP 1 THÁNG
    if (vip1Month) {
      console.log('\n✅ Đang cập nhật VIP 1 THÁNG...');
      vip1Month.detailedFeatures = vip1MonthFeatures;
      await vip1Month.save();
      console.log('✅ Đã thêm', Object.values(vip1MonthFeatures).flat().length, 'tính năng cho VIP 1 THÁNG');
    }
    
    // Cập nhật VIP 3 THÁNG
    if (vip3Month) {
      console.log('\n✅ Đang cập nhật VIP 3 THÁNG...');
      vip3Month.detailedFeatures = vip3MonthFeatures;
      await vip3Month.save();
      console.log('✅ Đã thêm', Object.values(vip3MonthFeatures).flat().length, 'tính năng cho VIP 3 THÁNG');
    }
    
    // Cập nhật LIFETIME
    if (lifetime) {
      console.log('\n✅ Đang cập nhật LIFETIME ELITE...');
      lifetime.detailedFeatures = lifetimeFeatures;
      await lifetime.save();
      console.log('✅ Đã thêm', Object.values(lifetimeFeatures).flat().length, 'tính năng cho LIFETIME ELITE');
    }
    
    // Nếu không tìm thấy, tìm tất cả gói và cập nhật
    if (!vip1Month || !vip3Month || !lifetime) {
      console.log('\n⚠️ Không tìm thấy một số gói, đang tìm tất cả gói...');
      const allPackages = await Package.find();
      console.log('📋 Tất cả gói:', allPackages.map(p => `"${p.name}"`));
      
      // Tìm theo tên gần đúng
      for (const pkg of allPackages) {
        const name = pkg.name.toLowerCase();
        
        // VIP 1 THÁNG
        if (!vip1Month && (name.includes('vip') && (name.includes('1') || name.includes('30') || name.includes('tháng')))) {
          console.log(`\n✅ Tìm thấy gói tương tự VIP 1 THÁNG: "${pkg.name}"`);
          pkg.detailedFeatures = vip1MonthFeatures;
          await pkg.save();
          console.log('✅ Đã thêm', Object.values(vip1MonthFeatures).flat().length, 'tính năng');
        }
        
        // VIP 3 THÁNG
        if (!vip3Month && (name.includes('vip') && (name.includes('3') || name.includes('90') || name.includes('premium')))) {
          console.log(`\n✅ Tìm thấy gói tương tự VIP 3 THÁNG: "${pkg.name}"`);
          pkg.detailedFeatures = vip3MonthFeatures;
          await pkg.save();
          console.log('✅ Đã thêm', Object.values(vip3MonthFeatures).flat().length, 'tính năng');
        }
        
        // LIFETIME
        if (!lifetime && (name.includes('lifetime') || name.includes('elite') || name.includes('vĩnh viễn'))) {
          console.log(`\n✅ Tìm thấy gói tương tự LIFETIME: "${pkg.name}"`);
          pkg.detailedFeatures = lifetimeFeatures;
          await pkg.save();
          console.log('✅ Đã thêm', Object.values(lifetimeFeatures).flat().length, 'tính năng');
        }
      }
    }
    
    console.log('\n✨ Hoàn tất!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

addFeaturesToPackages();

