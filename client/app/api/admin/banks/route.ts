import { NextRequest, NextResponse } from 'next/server';
import { BankAccount } from '@/lib/kv-models';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import { ensureAdmin } from '@/lib/admin';

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

    // Auto set as admin if not admin
    await ensureAdmin(decoded);

    // Get all banks
    const banks = await BankAccount.findAll();

    // Format banks (with _id and name for compatibility)
    const formattedBanks = banks.map(bank => ({
      ...bank,
      _id: bank.id,
      name: bank.bankName,
    }));

    return NextResponse.json(formattedBanks);
  } catch (error: any) {
    console.error('[Admin Banks API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}

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

    // Auto set as admin if not admin
    await ensureAdmin(decoded);

    const body = await request.json();
    
    // Ensure bankName is set (remove name if present)
    const bankData = {
      ...body,
      bankName: body.bankName || body.name || '',
    };
    // Remove name property if it exists (we only use bankName)
    delete (bankData as any).name;
    
    const bank = await BankAccount.create(bankData);

    // Format response (with _id and name for compatibility)
    const formattedBank = {
      ...bank,
      _id: bank.id,
      name: bank.bankName,
    };

    return NextResponse.json(formattedBank, { status: 201 });
  } catch (error: any) {
    console.error('[Admin Banks API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}
