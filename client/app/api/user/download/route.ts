import { NextRequest, NextResponse } from 'next/server';
import { User, Package } from '@/lib/kv-models';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
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

    const url = new URL(request.url);
    const packageId = url.searchParams.get('packageId');

    if (!packageId) {
      return NextResponse.json(
        { message: 'Thiếu packageId' },
        { status: 400 }
      );
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User không tồn tại' },
        { status: 404 }
      );
    }

    // Check if user owns the package
    if (user.currentPackage !== packageId) {
      return NextResponse.json(
        { message: 'Bạn chưa sở hữu gói này' },
        { status: 403 }
      );
    }

    // Get package
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return NextResponse.json(
        { message: 'Gói không tồn tại' },
        { status: 404 }
      );
    }

    // Generate license key (simple format)
    const licenseKey = `LIC-${user.id.substring(0, 8).toUpperCase()}-${packageId.substring(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    return NextResponse.json({
      downloadUrl: pkg.downloadUrl || '#',
      licenseKey,
      package: {
        ...pkg,
        _id: pkg.id,
      },
    });
  } catch (error: any) {
    console.error('[User Download API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}
