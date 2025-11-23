/**
 * Seed packages with detailed features (tabs-based GUI)
 * Run: npx ts-node scripts/seed-packages-with-features.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Package from '../lib/models/Package';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/playtogether_hack';

const packagesWithFeatures = [
  {
    name: 'VIP 1 THÁNG',
    description: 'Hack Play Together 30 ngày với đầy đủ tính năng cơ bản',
    price: 199000,
    duration: 30,
    features: [
      'Tự động di chuyển',
      'Sửa dụng cụ tự động',
      'Mở hộp quà tự động',
      'Anti-Ban cơ bản',
    ],
    detailedFeatures: {
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
    icon: '🎮',
    popular: true,
    platform: 'all',
    downloadUrl: 'https://example.com/download/vip1month',
    systemRequirements: 'Android 5.0+, iOS 11.0+, hoặc giả lập (LDPlayer, Nox)',
    version: '1.0.0',
  },
  {
    name: 'VIP PREMIUM 3 THÁNG',
    description: 'Hack Play Together 90 ngày với đầy đủ tính năng nâng cao - GIÁ KHUYẾN MÃI',
    price: 349000,
    duration: 90,
    features: [
      'Tất cả tính năng VIP 1 tháng',
      'Tự động câu cá nâng cao',
      'Tự động thu thập côn trùng',
      'Tham gia sự kiện tự động',
      'Anti-Ban nâng cao',
    ],
    detailedFeatures: {
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
    icon: '💎',
    popular: true,
    platform: 'all',
    downloadUrl: 'https://example.com/download/vip3month',
    systemRequirements: 'Android 5.0+, iOS 11.0+, hoặc giả lập (LDPlayer, Nox)',
    version: '1.2.0',
  },
  {
    name: 'LIFETIME ELITE',
    description: 'Hack Play Together vĩnh viễn với TẤT CẢ tính năng và hỗ trợ trọn đời',
    price: 599000,
    duration: 365,
    features: [
      'Tất cả tính năng VIP Premium',
      'Mini Game tự động',
      'Tối ưu hiệu suất game',
      'Hỗ trợ trọn đời',
      'Cập nhật miễn phí vĩnh viễn',
      'Anti-Ban cao cấp',
    ],
    detailedFeatures: {
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
    icon: '👑',
    popular: true,
    platform: 'all',
    downloadUrl: 'https://example.com/download/lifetime',
    systemRequirements: 'Android 5.0+, iOS 11.0+, hoặc giả lập (LDPlayer, Nox, BlueStacks)',
    version: '2.0.0',
  },
];

async function seedPackages() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing packages
    await Package.deleteMany({});
    console.log('🗑️  Cleared existing packages');

    // Insert new packages
    for (const pkgData of packagesWithFeatures) {
      const pkg = new Package(pkgData);
      await pkg.save();
      console.log(`✅ Created package: ${pkg.name}`);
    }

    console.log('\n✅ All packages seeded successfully!');
    console.log(`📦 Total packages: ${packagesWithFeatures.length}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding packages:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedPackages();





