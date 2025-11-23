import { NextRequest, NextResponse } from 'next/server';
import { DepositRequest } from '@/lib/kv-models';
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

    const body = await request.json();
    const { amount, method, description, bankId } = body;

    console.log('[Deposits Create] Request body:', body);

    if (!amount) {
      return NextResponse.json(
        { message: 'Vui lòng nhập số tiền' },
        { status: 400 }
      );
    }

    const depositAmount = parseFloat(amount);
    
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return NextResponse.json(
        { message: 'Số tiền không hợp lệ' },
        { status: 400 }
      );
    }

    if (depositAmount < 10000) {
      return NextResponse.json(
        { message: 'Số tiền tối thiểu là 10,000₫' },
        { status: 400 }
      );
    }

    // Create deposit request (bankId is optional)
    const deposit = await DepositRequest.create({
      userId: decoded.userId,
      amount: depositAmount,
      method: method || 'bank_transfer',
      status: 'pending',
      description: description || `Nạp tiền ${depositAmount.toLocaleString('vi-VN')}₫`,
    });

    console.log('[Deposits Create] Deposit created:', deposit);

    // Format response (with _id for compatibility)
    const formattedDeposit = {
      ...deposit,
      _id: deposit.id,
    };

    return NextResponse.json(formattedDeposit, { status: 201 });
  } catch (error: any) {
    console.error('[Deposits Create API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}
