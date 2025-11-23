import { NextRequest, NextResponse } from 'next/server';
import { User, Package, Transaction, DepositRequest } from '@/lib/kv-models';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import { ensureAdmin } from '@/lib/admin';

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

    // Auto set as admin if not admin
    await ensureAdmin(decoded);

    // Get user
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { message: 'User không tồn tại' },
        { status: 404 }
      );
    }

    // Get user's packages
    const userPackages = [];
    if (user.currentPackage) {
      const pkg = await Package.findById(user.currentPackage);
      if (pkg) {
        let expiresAt: Date | null = null;
        if (pkg.duration && pkg.duration > 0) {
          const purchaseDate = (user.packagePurchasedAt && user.packagePurchasedAt instanceof Date) 
            ? user.packagePurchasedAt 
            : (user.packagePurchasedAt && typeof user.packagePurchasedAt === 'string')
            ? new Date(user.packagePurchasedAt)
            : new Date();
          
          expiresAt = new Date(purchaseDate);
          expiresAt.setDate(expiresAt.getDate() + pkg.duration);
        }
        
        userPackages.push({
          _id: user.currentPackage,
          id: user.currentPackage,
          packageId: {
            ...pkg,
            _id: pkg.id,
          },
          status: 'active',
          expiresAt: expiresAt ? expiresAt.toISOString() : null,
          createdAt: user.packagePurchasedAt || new Date(),
        });
      }
    }

    // Get user's transactions
    const transactions = await Transaction.findByUserId(user.id);

    // Get user's deposits
    const allDeposits = await DepositRequest.findAll();
    const userDeposits = allDeposits.filter((deposit: any) => {
      const depositUserId = typeof deposit.userId === 'string' 
        ? deposit.userId 
        : (deposit.userId?.id || deposit.userId?._id);
      return depositUserId === user.id;
    });

    // Format response
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        _id: user.id,
      },
      packages: userPackages,
      transactions: transactions.map(tx => ({
        ...tx,
        _id: tx.id,
        createdAt: tx.createdAt instanceof Date ? tx.createdAt.toISOString() : tx.createdAt,
        updatedAt: tx.updatedAt instanceof Date ? tx.updatedAt.toISOString() : tx.updatedAt,
      })),
      deposits: userDeposits.map(deposit => ({
        ...deposit,
        _id: deposit.id,
        createdAt: deposit.createdAt instanceof Date ? deposit.createdAt.toISOString() : deposit.createdAt,
        updatedAt: deposit.updatedAt instanceof Date ? deposit.updatedAt.toISOString() : deposit.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error('[Admin User Detail API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}

