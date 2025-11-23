import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/kv-models';
import { Package, type IPackage } from '@/lib/kv-models';
import connectDB from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Create admin user
    const existingAdmin = await User.findByUsername('admin');
    if (!existingAdmin) {
      await User.create({
        username: 'admin',
        password: 'admin123',
        name: 'Admin',
        balance: 1000000,
        role: 'admin',
        currentPackage: null,
        isActive: true,
        lastLogin: null
      });
      console.log('✓ Admin user created');
    }

    // Create packages
    const existingPackages = await Package.findAll();
    if (existingPackages.length === 0) {
      const packages: Omit<IPackage, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: 'VIP 1 THÁNG',
          description: 'Hack Play Together 30 ngày',
          price: 199000,
          duration: 30,
          features: [
            'Teleport & NoClip',
            'ESP đầy đủ tính năng',
            'Speed Hack mượt',
            'Auto Aim chính xác',
            'Hỗ trợ Android & iOS',
            'Cập nhật mỗi tuần'
          ],
          platform: 'all' as const,
          popular: false,
          banRisk: 'medium' as const,
          antiBanGuarantee: false,
          version: 'V2.0.0'
        },
        {
          name: 'VIP PREMIUM 3 THÁNG',
          description: 'Hack Play Together 90 ngày - GIÁ KHUYẾN MÃI',
          price: 349000,
          duration: 90,
          features: [
            'TẤT CẢ tính năng VIP',
            'God Mode + Wallhack',
            'Aimbot siêu sắc nét',
            'Item Hack vô hạn',
            'Hỗ trợ VIP ưu tiên',
            'Backup account 3 lần'
          ],
          platform: 'all' as const,
          popular: true,
          banRisk: 'none' as const,
          antiBanGuarantee: true,
          version: 'V2.0.0'
        },
        {
          name: 'LIFETIME ELITE',
          description: 'Hack Play Together VĨNH VIỄN - GIÁ TỐT NHẤT',
          price: 699000,
          duration: 999999,
          features: [
            'TẤT CẢ tính năng Premium',
            'Lifetime updates',
            'Priority support 24/7',
            'Custom features theo yêu cầu',
            'Account backup không giới hạn',
            'Early access tính năng mới'
          ],
          platform: 'all' as const,
          popular: true,
          banRisk: 'none' as const,
          antiBanGuarantee: true,
          version: 'V2.0.0'
        }
      ];

      // Tính năng Play Together tháng 11/2025
      const vip1MonthFeatures = {
        chung: [
          { name: 'Tự Động Tới', description: 'Tự động di chuyển đến vị trí chỉ định' },
          { name: 'Sửa Dụng Cụ', description: 'Tự động sửa chữa dụng cụ khi bị hỏng' },
          { name: 'Bảo Quản', description: 'Tự động bảo quản vật phẩm' },
          { name: 'Mở Hộp Quà/Gói Thẻ', description: 'Tự động mở hộp quà và gói thẻ' },
        ],
        map: [
          { name: 'Xem Bản Đồ Toàn Cảnh', description: 'Hiển thị toàn bộ bản đồ' },
          { name: 'Đánh Dấu Vị Trí Quan Trọng', description: 'Đánh dấu các vị trí cần thiết' },
        ],
        contrung: [
          { name: 'Tự Động Bắt Côn Trùng', description: 'Tự động tìm và bắt côn trùng' },
          { name: 'Hiển Thị Vị Trí Côn Trùng', description: 'Hiển thị vị trí côn trùng trên bản đồ' },
        ],
        cauca: [
          { name: 'Tự Động Câu Cá', description: 'Tự động câu cá khi có cần câu' },
          { name: 'Bỏ Qua Cá Nhỏ', description: 'Chỉ câu cá lớn, bỏ qua cá nhỏ' },
        ],
        thuthap: [
          { name: 'Tự Động Thu Thập Tài Nguyên', description: 'Tự động thu thập tài nguyên xung quanh' },
          { name: 'Ưu Tiên Tài Nguyên Quý', description: 'Ưu tiên thu thập tài nguyên quý hiếm' },
        ],
        sukien: [
          { name: 'Tham Gia Sự Kiện Tự Động', description: 'Tự động tham gia các sự kiện' },
        ],
        minigame: [
          { name: 'Hỗ Trợ Mini Game Cơ Bản', description: 'Hỗ trợ một số mini game' },
        ],
        caidat: [
          { name: 'Cài Đặt Tốc Độ', description: 'Điều chỉnh tốc độ hack' },
          { name: 'Cài Đặt An Toàn', description: 'Cài đặt mức độ an toàn' },
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
        ],
        map: [
          { name: 'Xem Bản Đồ Toàn Cảnh', description: 'Hiển thị toàn bộ bản đồ' },
          { name: 'Đánh Dấu Vị Trí Quan Trọng', description: 'Đánh dấu các vị trí cần thiết' },
          { name: 'Tự Động Tìm Đường', description: 'Tự động tìm đường đi tối ưu' },
          { name: 'Teleport Nhanh', description: 'Dịch chuyển nhanh đến vị trí' },
        ],
        contrung: [
          { name: 'Tự Động Bắt Côn Trùng', description: 'Tự động tìm và bắt côn trùng' },
          { name: 'Hiển Thị Vị Trí Côn Trùng', description: 'Hiển thị vị trí côn trùng trên bản đồ' },
          { name: 'Lọc Côn Trùng Quý', description: 'Chỉ bắt côn trùng quý hiếm' },
          { name: 'Tự Động Bán Côn Trùng', description: 'Tự động bán côn trùng khi đầy túi' },
        ],
        cauca: [
          { name: 'Tự Động Câu Cá', description: 'Tự động câu cá khi có cần câu' },
          { name: 'Bỏ Qua Cá Nhỏ', description: 'Chỉ câu cá lớn, bỏ qua cá nhỏ' },
          { name: 'Câu Cá Quý Hiếm', description: 'Ưu tiên câu cá quý hiếm' },
          { name: 'Tự Động Bán Cá', description: 'Tự động bán cá khi đầy túi' },
        ],
        thuthap: [
          { name: 'Tự Động Thu Thập Tài Nguyên', description: 'Tự động thu thập tài nguyên xung quanh' },
          { name: 'Ưu Tiên Tài Nguyên Quý', description: 'Ưu tiên thu thập tài nguyên quý hiếm' },
          { name: 'Thu Thập Tự Động 24/7', description: 'Thu thập tự động cả ngày' },
          { name: 'Tự Động Chế Tạo', description: 'Tự động chế tạo vật phẩm' },
        ],
        sukien: [
          { name: 'Tham Gia Sự Kiện Tự Động', description: 'Tự động tham gia các sự kiện' },
          { name: 'Hoàn Thành Nhiệm Vụ Sự Kiện', description: 'Tự động hoàn thành nhiệm vụ sự kiện' },
          { name: 'Nhận Phần Thưởng Sự Kiện', description: 'Tự động nhận phần thưởng sự kiện' },
        ],
        minigame: [
          { name: 'Hỗ Trợ Mini Game Đầy Đủ', description: 'Hỗ trợ tất cả mini game' },
          { name: 'Tự Động Chơi Mini Game', description: 'Tự động chơi mini game để nhận thưởng' },
          { name: 'Tối Ưu Điểm Số', description: 'Tối ưu điểm số trong mini game' },
        ],
        caidat: [
          { name: 'Cài Đặt Tốc Độ', description: 'Điều chỉnh tốc độ hack' },
          { name: 'Cài Đặt An Toàn', description: 'Cài đặt mức độ an toàn' },
          { name: 'Cài Đặt Nâng Cao', description: 'Các cài đặt nâng cao cho người dùng chuyên nghiệp' },
          { name: 'Lưu Cấu Hình', description: 'Lưu và tải cấu hình hack' },
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
        ],
        map: [
          { name: 'Xem Bản Đồ Toàn Cảnh', description: 'Hiển thị toàn bộ bản đồ' },
          { name: 'Đánh Dấu Vị Trí Quan Trọng', description: 'Đánh dấu các vị trí cần thiết' },
          { name: 'Tự Động Tìm Đường', description: 'Tự động tìm đường đi tối ưu' },
          { name: 'Teleport Nhanh', description: 'Dịch chuyển nhanh đến vị trí' },
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
        ],
        cauca: [
          { name: 'Tự Động Câu Cá', description: 'Tự động câu cá khi có cần câu' },
          { name: 'Bỏ Qua Cá Nhỏ', description: 'Chỉ câu cá lớn, bỏ qua cá nhỏ' },
          { name: 'Câu Cá Quý Hiếm', description: 'Ưu tiên câu cá quý hiếm' },
          { name: 'Tự Động Bán Cá', description: 'Tự động bán cá khi đầy túi' },
          { name: 'Nuôi Cá', description: 'Tự động nuôi và chăm sóc cá' },
          { name: 'Lai Tạo Cá', description: 'Tự động lai tạo cá quý' },
        ],
        thuthap: [
          { name: 'Tự Động Thu Thập Tài Nguyên', description: 'Tự động thu thập tài nguyên xung quanh' },
          { name: 'Ưu Tiên Tài Nguyên Quý', description: 'Ưu tiên thu thập tài nguyên quý hiếm' },
          { name: 'Thu Thập Tự Động 24/7', description: 'Thu thập tự động cả ngày' },
          { name: 'Tự Động Chế Tạo', description: 'Tự động chế tạo vật phẩm' },
          { name: 'Tự Động Nâng Cấp', description: 'Tự động nâng cấp vật phẩm' },
          { name: 'Quản Lý Kho', description: 'Tự động quản lý kho vật phẩm' },
        ],
        sukien: [
          { name: 'Tham Gia Sự Kiện Tự Động', description: 'Tự động tham gia các sự kiện' },
          { name: 'Hoàn Thành Nhiệm Vụ Sự Kiện', description: 'Tự động hoàn thành nhiệm vụ sự kiện' },
          { name: 'Nhận Phần Thưởng Sự Kiện', description: 'Tự động nhận phần thưởng sự kiện' },
          { name: 'Thông Báo Sự Kiện', description: 'Thông báo khi có sự kiện mới' },
          { name: 'Tham Gia Sự Kiện Đặc Biệt', description: 'Tự động tham gia sự kiện đặc biệt' },
        ],
        minigame: [
          { name: 'Hỗ Trợ Mini Game Đầy Đủ', description: 'Hỗ trợ tất cả mini game' },
          { name: 'Tự Động Chơi Mini Game', description: 'Tự động chơi mini game để nhận thưởng' },
          { name: 'Tối Ưu Điểm Số', description: 'Tối ưu điểm số trong mini game' },
          { name: 'Hack Mini Game', description: 'Hack điểm số mini game' },
          { name: 'Nhận Thưởng Tối Đa', description: 'Nhận thưởng tối đa từ mini game' },
        ],
        caidat: [
          { name: 'Cài Đặt Tốc Độ', description: 'Điều chỉnh tốc độ hack' },
          { name: 'Cài Đặt An Toàn', description: 'Cài đặt mức độ an toàn' },
          { name: 'Cài Đặt Nâng Cao', description: 'Các cài đặt nâng cao cho người dùng chuyên nghiệp' },
          { name: 'Lưu Cấu Hình', description: 'Lưu và tải cấu hình hack' },
          { name: 'Cài Đặt Tùy Chỉnh', description: 'Tùy chỉnh mọi cài đặt theo ý muốn' },
          { name: 'Cập Nhật Tự Động', description: 'Tự động cập nhật tính năng mới' },
        ],
      };

      for (const pkg of packages) {
        // Thêm detailedFeatures dựa trên tên gói
        let detailedFeatures: any = null;
        if (pkg.name.includes('VIP 1 THÁNG') || pkg.name.includes('1 THÁNG')) {
          detailedFeatures = vip1MonthFeatures;
        } else if (pkg.name.includes('VIP PREMIUM 3 THÁNG') || pkg.name.includes('3 THÁNG')) {
          detailedFeatures = vip3MonthFeatures;
        } else if (pkg.name.includes('LIFETIME') || pkg.name.includes('ELITE')) {
          detailedFeatures = lifetimeFeatures;
        }
        
        const pkgWithFeatures = detailedFeatures ? { ...pkg, detailedFeatures } : pkg;
        await Package.create(pkgWithFeatures);
      }
      console.log('✓ Packages created with features');
    }

    const allPackages = await Package.findAll();

    return NextResponse.json({ 
      message: 'Database seeded successfully',
      packages: allPackages.length,
      users: existingAdmin ? 1 : 0
    });
  } catch (error: any) {
    console.error('[Seed] Error:', error);
    return NextResponse.json(
      { message: 'Error seeding database', error: error.message },
      { status: 500 }
    );
  }
}

