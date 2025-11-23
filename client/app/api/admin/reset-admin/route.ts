import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/kv-models';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Find or create admin user
    let admin = await User.findByUsername('admin');
    
    if (admin) {
      // Update existing admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = await User.update(admin.id, {
        password: hashedPassword,
        role: 'admin',
        balance: 1000000,
        isActive: true,
        name: 'Admin',
      });
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = await User.create({
        username: 'admin',
        password: hashedPassword,
        name: 'Admin',
        balance: 1000000,
        role: 'admin',
        currentPackage: null,
        isActive: true,
        lastLogin: null,
      });
    }

    if (!admin) {
      return NextResponse.json(
        { message: 'Không thể tạo/cập nhật admin user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Admin user đã được reset thành công',
      username: 'admin',
      password: 'admin123',
      user: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error('[Reset Admin] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi reset admin', error: error.message },
      { status: 500 }
    );
  }
}

