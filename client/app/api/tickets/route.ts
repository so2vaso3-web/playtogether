import { NextRequest, NextResponse } from 'next/server';
import { Ticket } from '@/lib/kv-models';
import { User } from '@/lib/kv-models';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// GET - Get user tickets
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const authHeader = req.headers.get('authorization');
    
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

    // Get user tickets
    const tickets = await Ticket.findByUserId(decoded.userId);

    // Format tickets (with _id for compatibility)
    const formattedTickets = tickets.map(ticket => ({
      ...ticket,
      _id: ticket.id,
    }));

    return NextResponse.json(formattedTickets);
  } catch (error: any) {
    console.error('[API Tickets] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new ticket
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const authHeader = req.headers.get('authorization');
    
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

    const body = await req.json();
    const ticket = await Ticket.create({
      ...body,
      userId: decoded.userId,
    });

    // Format response (with _id for compatibility)
    const formattedTicket = {
      ...ticket,
      _id: ticket.id,
    };

    return NextResponse.json(formattedTicket, { status: 201 });
  } catch (error: any) {
    console.error('[API Tickets] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}
