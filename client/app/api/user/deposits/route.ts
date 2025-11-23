import { NextRequest, NextResponse } from 'next/server';
import { DepositRequest } from '@/lib/kv-models';
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

    // Get user deposits
    const allDeposits = await DepositRequest.findAll();
    const userDeposits = allDeposits.filter(d => d.userId === decoded.userId);

    // Format deposits (with _id for compatibility)
    const formattedDeposits = userDeposits.map(deposit => ({
      ...deposit,
      _id: deposit.id,
    }));

    return NextResponse.json(formattedDeposits);
  } catch (error: any) {
    console.error('[User Deposits API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}
