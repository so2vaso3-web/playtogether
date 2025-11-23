import { NextRequest, NextResponse } from 'next/server';
import { Ticket } from '@/lib/kv-models';
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

    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    // Get all tickets
    let tickets = await Ticket.findAll();
    
    // Filter by status if provided
    if (status && status !== 'all') {
      tickets = tickets.filter(t => t.status === status);
    }

    // Format tickets (with _id for compatibility)
    const formattedTickets = tickets.map(ticket => ({
      ...ticket,
      _id: ticket.id,
    }));

    return NextResponse.json(formattedTickets);
  } catch (error: any) {
    console.error('[Admin Tickets API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}
