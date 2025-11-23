import { NextRequest, NextResponse } from 'next/server';
import { DepositRequest } from '@/lib/kv-models';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import { ensureAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(
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

    const body = await request.json().catch(() => ({}));
    const deposit = await DepositRequest.findById(params.id);

    if (!deposit) {
      return NextResponse.json(
        { message: 'Yêu cầu nạp tiền không tồn tại' },
        { status: 404 }
      );
    }

    if (deposit.status !== 'pending') {
      return NextResponse.json(
        { message: 'Yêu cầu này đã được xử lý' },
        { status: 400 }
      );
    }

    // Update deposit status
    await DepositRequest.update(params.id, {
      status: 'rejected',
      approvedBy: decoded.userId,
      approvedAt: new Date(),
      adminNote: body.note || '',
    });

    const updatedDeposit = await DepositRequest.findById(params.id);

    // Format response (with _id for compatibility)
    const formattedDeposit = {
      ...updatedDeposit!,
      _id: updatedDeposit!.id,
    };

    return NextResponse.json(formattedDeposit);
  } catch (error: any) {
    console.error('[Admin Deposits Reject API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}
