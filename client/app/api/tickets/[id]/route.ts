import { NextRequest, NextResponse } from 'next/server';
import { Ticket } from '@/lib/kv-models';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(
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

    const ticket = await Ticket.findById(params.id);

    if (!ticket) {
      return NextResponse.json(
        { message: 'Ticket không tồn tại' },
        { status: 404 }
      );
    }

    // Check if user owns the ticket or is admin
    if (ticket.userId !== decoded.userId && decoded.role !== 'admin') {
      return NextResponse.json(
        { message: 'Bạn không có quyền truy cập ticket này' },
        { status: 403 }
      );
    }

    // Format response (with _id for compatibility)
    const formattedTicket = {
      ...ticket,
      _id: ticket.id,
    };

    return NextResponse.json(formattedTicket);
  } catch (error: any) {
    console.error('[API Tickets] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}
