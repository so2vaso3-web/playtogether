import { NextRequest, NextResponse } from 'next/server';
import { Package } from '@/lib/kv-models';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import { ensureAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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

    // Auto set as admin if not admin
    await ensureAdmin(decoded);

    // Handle params (Next.js 15+ uses Promise)
    const resolvedParams = params instanceof Promise ? await params : params;
    const packageId = resolvedParams.id;

    const body = await request.json();
    console.log('[Admin Packages API] Updating package:', packageId, body);
    
    const updated = await Package.update(packageId, body);

    if (!updated) {
      return NextResponse.json(
        { message: 'Gói không tồn tại' },
        { status: 404 }
      );
    }

    // Format response (with _id for compatibility)
    const formattedPkg = {
      ...updated,
      _id: updated.id,
    };

    return NextResponse.json(formattedPkg);
  } catch (error: any) {
    console.error('[Admin Packages API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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

    // Auto set as admin if not admin
    await ensureAdmin(decoded);

    // Handle params (Next.js 15+ uses Promise)
    const resolvedParams = params instanceof Promise ? await params : params;
    const packageId = resolvedParams.id;

    console.log('[Admin Packages API] Deleting package:', packageId);
    
    const deleted = await Package.delete(packageId);

    if (!deleted) {
      return NextResponse.json(
        { message: 'Gói không tồn tại' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Xóa gói thành công' });
  } catch (error: any) {
    console.error('[Admin Packages API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}
