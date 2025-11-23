import { NextRequest, NextResponse } from 'next/server';
import { User, Package, type IPackage } from '@/lib/kv-models';
import connectDB from '@/lib/db';
import jwt from 'jsonwebtoken';
import { ensureAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token không hợp lệ' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '').trim();
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { message: 'Token không hợp lệ hoặc đã hết hạn' },
        { status: 401 }
      );
    }

    await connectDB();
    // Auto set as admin if not admin
    await ensureAdmin(decoded);

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

      for (const pkg of packages) {
        await Package.create(pkg);
      }
      console.log('✓ Packages created');
    }

    const allUsers = await User.findAll();
    const allPackages = await Package.findAll();

    return NextResponse.json({ 
      message: 'Database seeded successfully',
      users: allUsers.length,
      packages: allPackages.length,
    });
  } catch (error: any) {
    console.error('[Seed] Error:', error);
    return NextResponse.json(
      { message: 'Error seeding database', error: error.message },
      { status: 500 }
    );
  }
}

