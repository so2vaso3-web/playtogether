import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/kv-models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { username, password, name, phone } = body;

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Vui lòng nhập đầy đủ thông tin' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { message: 'Tên đăng nhập đã tồn tại' },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({
      username,
      password,
      name: name || username,
      balance: 0,
      role: 'user',
      currentPackage: null,
      isActive: true,
      lastLogin: null,
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Đăng ký thành công',
      token,
      user: userWithoutPassword,
    }, { status: 201 });
  } catch (error: any) {
    console.error('[Register API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}
