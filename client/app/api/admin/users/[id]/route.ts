import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/kv-models';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import { ensureAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const body = await request.json();
    
    // Ensure balance is a number if provided
    if (body.balance !== undefined) {
      body.balance = Number(body.balance);
      if (isNaN(body.balance)) {
        body.balance = 0;
      }
      console.log('[Admin Users API] Updating balance:', {
        userId: params.id,
        newBalance: body.balance,
        balanceType: typeof body.balance,
      });
    }
    
    const updated = await User.update(params.id, body);
    
    // Verify balance was updated correctly
    if (body.balance !== undefined && updated) {
      const verifiedUser = await User.findById(params.id);
      const verifiedBalance = verifiedUser ? (Number(verifiedUser.balance) || 0) : 0;
      console.log('[Admin Users API] Balance verification:', {
        expected: body.balance,
        actual: verifiedBalance,
        match: Math.abs(verifiedBalance - body.balance) <= 0.01,
      });
      
      // If balance doesn't match, retry once
      if (Math.abs(verifiedBalance - body.balance) > 0.01) {
        console.warn('[Admin Users API] Balance mismatch, retrying...');
        await User.update(params.id, { balance: body.balance });
        // Wait a bit for KV to sync
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    if (!updated) {
      return NextResponse.json(
        { message: 'User không tồn tại' },
        { status: 404 }
      );
    }

    // Format response (without password, with _id for compatibility)
    const { password, ...userWithoutPassword } = updated;
    const formattedUser = {
      ...userWithoutPassword,
      _id: updated.id,
    };

    return NextResponse.json(formattedUser);
  } catch (error: any) {
    console.error('[Admin Users API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Don't allow deleting yourself
    if (decoded.userId === params.id) {
      return NextResponse.json(
        { message: 'Không thể xóa chính mình' },
        { status: 400 }
      );
    }

    const deleted = await User.delete(params.id);

    if (!deleted) {
      return NextResponse.json(
        { message: 'User không tồn tại' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Xóa user thành công' });
  } catch (error: any) {
    console.error('[Admin Users API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}
