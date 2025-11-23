import { NextRequest, NextResponse } from 'next/server';
import { Transaction } from '@/lib/kv-models';
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

    // Get user transactions
    const transactions = await Transaction.findByUserId(decoded.userId);

    // Format transactions to match expected format (with _id for compatibility)
    // Ensure Date objects are properly serialized
    const formattedTransactions = transactions.map(tx => {
      // Convert Date objects to ISO strings for JSON serialization
      const createdAt = tx.createdAt instanceof Date ? tx.createdAt : new Date(tx.createdAt);
      const updatedAt = tx.updatedAt instanceof Date ? tx.updatedAt : new Date(tx.updatedAt);
      
      return {
        _id: tx.id,
        id: tx.id,
        userId: tx.userId,
        type: tx.type,
        amount: tx.amount || 0,
        beforeBalance: tx.beforeBalance || 0,
        afterBalance: tx.afterBalance || 0,
        description: tx.description || '',
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      };
    });

    return NextResponse.json(formattedTransactions);
  } catch (error: any) {
    console.error('[User Transactions API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}
