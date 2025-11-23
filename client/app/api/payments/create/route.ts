import { NextRequest, NextResponse } from 'next/server';
import { User, Package, Transaction } from '@/lib/kv-models';
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
    const { packageId } = body;

    if (!packageId) {
      return NextResponse.json(
        { message: 'Vui lòng chọn gói' },
        { status: 400 }
      );
    }

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User không tồn tại' },
        { status: 404 }
      );
    }

    // Get package
    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return NextResponse.json(
        { message: 'Gói không tồn tại' },
        { status: 404 }
      );
    }

    // Check if user already owns this package
    if (user.currentPackage === packageId) {
      return NextResponse.json(
        { message: 'Bạn đã sở hữu gói này rồi' },
        { status: 400 }
      );
    }

    // Check balance - ensure all values are numbers
    const userBalance = Number(user.balance) || 0;
    const packagePrice = Number(pkg.price) || 0;
    
    if (userBalance < packagePrice) {
      return NextResponse.json(
        { 
          message: `Số dư không đủ! Bạn cần ${packagePrice.toLocaleString('vi-VN')}₫ nhưng chỉ có ${userBalance.toLocaleString('vi-VN')}₫`,
          insufficientBalance: true
        },
        { status: 400 }
      );
    }

    // Deduct balance - use the same values already calculated
    const currentBalance = userBalance; // Reuse userBalance
    const newBalance = Math.round((currentBalance - packagePrice) * 100) / 100;
    
    if (newBalance < 0) {
      return NextResponse.json(
        { 
          message: `Số dư không đủ! Bạn cần ${packagePrice.toLocaleString('vi-VN')}₫ nhưng chỉ có ${currentBalance.toLocaleString('vi-VN')}₫`,
          insufficientBalance: true
        },
        { status: 400 }
      );
    }
    
    const now = new Date();
    console.log('[Payments Create] Deducting balance:', {
      userId: user.id,
      username: user.username,
      currentBalance,
      packagePrice,
      newBalance,
    });
    
    await User.update(user.id, { 
      balance: newBalance,
      currentPackage: packageId,
      packagePurchasedAt: now // Store purchase date for calculating expiration
    });
    
    // Verify balance was updated
    await new Promise(resolve => setTimeout(resolve, 100));
    const updatedUserCheck = await User.findById(user.id);
    const verifiedBalance = updatedUserCheck ? (Number(updatedUserCheck.balance) || 0) : 0;
    
    if (Math.abs(verifiedBalance - newBalance) > 0.01) {
      console.error('[Payments Create] Balance update verification failed:', {
        expected: newBalance,
        actual: verifiedBalance,
      });
      // Retry once
      await User.update(user.id, { balance: newBalance });
    }

    // Create transaction record
    await Transaction.create({
      userId: user.id,
      type: 'purchase',
      amount: packagePrice,
      description: `Mua gói ${pkg.name}`,
      beforeBalance: currentBalance,
      afterBalance: newBalance,
    });

    // Get updated user
    const updatedUser = await User.findById(user.id);

    return NextResponse.json({
      message: 'Mua gói thành công!',
      user: updatedUser,
      package: pkg,
    });
  } catch (error: any) {
    console.error('[Payments API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}
