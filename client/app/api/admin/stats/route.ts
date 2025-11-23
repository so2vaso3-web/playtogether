import { NextRequest, NextResponse } from 'next/server';
import { User, Package, Transaction } from '@/lib/kv-models';
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

    // Get all data
    console.log('[Admin Stats] Fetching data...');
    let users: any[] = [];
    let packages: any[] = [];
    let transactions: any[] = [];

    try {
      users = await User.findAll();
      console.log('[Admin Stats] Users found:', users.length);
    } catch (err: any) {
      console.error('[Admin Stats] Error fetching users:', err);
      users = [];
    }

    try {
      packages = await Package.findAll();
      console.log('[Admin Stats] Packages found:', packages.length);
    } catch (err: any) {
      console.error('[Admin Stats] Error fetching packages:', err);
      packages = [];
    }

    try {
      transactions = await Transaction.findAll();
      console.log('[Admin Stats] Transactions found:', transactions.length);
    } catch (err: any) {
      console.error('[Admin Stats] Error fetching transactions:', err);
      transactions = [];
    }

    // Calculate stats
    const totalUsers = users.length || 0;
    const totalPackages = packages.length || 0;
    
    // Count active packages from user's currentPackage field
    const totalActivePackages = users.filter(u => {
      const currentPkg = u.currentPackage;
      return currentPkg !== null && currentPkg !== undefined && currentPkg !== '';
    }).length;
    
    // Calculate total revenue from approved deposits
    const totalRevenue = transactions
      .filter(t => {
        const isDeposit = t.type === 'deposit';
        const hasAmount = t.amount !== null && t.amount !== undefined;
        return isDeposit && hasAmount;
      })
      .reduce((sum, t) => {
        const amount = Number(t.amount) || 0;
        return sum + amount;
      }, 0);

    // Get recent users (last 5) - sorted by creation date
    const recentUsers = users
      .map(u => {
        let createdAt: Date;
        if (u.createdAt instanceof Date) {
          createdAt = u.createdAt;
        } else if (typeof u.createdAt === 'string') {
          createdAt = new Date(u.createdAt);
        } else {
          createdAt = new Date();
        }
        return {
          ...u,
          createdAt,
        };
      })
      .sort((a, b) => {
        const dateA = a.createdAt.getTime();
        const dateB = b.createdAt.getTime();
        return dateB - dateA;
      })
      .slice(0, 5)
      .map(u => ({
        _id: u.id,
        id: u.id,
        username: u.username || 'N/A',
        name: u.name || 'Chưa có tên',
        createdAt: u.createdAt.toISOString(),
      }));

    const stats = {
      totalUsers,
      totalPackages,
      totalActivePackages,
      totalRevenue,
      recentUsers,
    };

    console.log('[Admin Stats] Calculated stats:', JSON.stringify(stats, null, 2));

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('[Admin Stats API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}
