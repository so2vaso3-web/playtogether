import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/kv-models';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

    // Get user from database
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return NextResponse.json(
        { message: 'User không tồn tại' },
        { status: 404 }
      );
    }

    // Update user role to admin
    const updatedUser = await User.update(user.id, { role: 'admin' });
    
    if (!updatedUser) {
      return NextResponse.json(
        { message: 'Không thể cập nhật role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Đã set user thành admin thành công',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role,
      },
    });
  } catch (error: any) {
    console.error('[Make Admin API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}

