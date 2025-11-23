import { NextRequest, NextResponse } from 'next/server';
import { DepositRequest, User, Transaction } from '@/lib/kv-models';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import { ensureAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(
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

    const body = await request.json().catch(() => ({}));
    const deposit = await DepositRequest.findById(params.id);

    if (!deposit) {
      return NextResponse.json(
        { message: 'Yêu cầu nạp tiền không tồn tại' },
        { status: 404 }
      );
    }

    console.log('[Approve Deposit] Deposit found:', {
      id: deposit.id,
      userId: deposit.userId,
      userIdType: typeof deposit.userId,
      amount: deposit.amount,
      status: deposit.status,
    });

    if (deposit.status !== 'pending') {
      return NextResponse.json(
        { message: 'Yêu cầu này đã được xử lý' },
        { status: 400 }
      );
    }

    // Get user ID - handle both string and object formats
    const userId = typeof deposit.userId === 'string'
      ? deposit.userId
      : ((deposit.userId as any)?.id || (deposit.userId as any)?._id || deposit.userId);
    
    if (!userId) {
      console.error('[Approve Deposit] No userId found in deposit:', deposit);
      return NextResponse.json(
        { message: 'Yêu cầu nạp tiền không có thông tin user' },
        { status: 400 }
      );
    }

    console.log('[Approve Deposit] Resolved userId:', userId);

    // Get user and update balance
    const user = await User.findById(userId);
    if (!user) {
      console.error('[Approve Deposit] User not found with ID:', userId);
      console.error('[Approve Deposit] Deposit userId was:', deposit.userId);
      return NextResponse.json(
        { message: `User không tồn tại với ID: ${userId}` },
        { status: 404 }
      );
    }

    console.log('[Approve Deposit] ===== APPROVING DEPOSIT =====');
    console.log('[Approve Deposit] Deposit ID:', deposit.id);
    console.log('[Approve Deposit] Deposit Amount:', deposit.amount);
    console.log('[Approve Deposit] Deposit UserId:', deposit.userId);
    console.log('[Approve Deposit] Resolved UserId:', userId);
    console.log('[Approve Deposit] User found:', {
      id: user.id,
      username: user.username,
      currentBalance: user.balance,
      balanceType: typeof user.balance,
    });

    // Calculate new balance - ensure all values are numbers
    const currentBalance = Number(user.balance) || 0;
    const depositAmount = Number(deposit.amount) || 0;
    const newBalance = Math.round((currentBalance + depositAmount) * 100) / 100;
    
    console.log('[Approve Deposit] Balance calculation:', {
      currentBalance,
      depositAmount,
      newBalance,
      formula: `${currentBalance} + ${depositAmount} = ${newBalance}`,
    });
    
    console.log('[Approve Deposit] Updating balance for user:', user.username, 'ID:', user.id);
    
    // Use User.update() method which has built-in verification and retry logic
    console.log('[Approve Deposit] Using User.update() to update balance...');
    const updateResult = await User.update(user.id, { balance: newBalance });
    
    // Wait for KV to sync
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verify balance was updated correctly - retry up to 5 times
    let verifiedUser = await User.findById(user.id);
    let verifiedBalance = verifiedUser ? (Number(verifiedUser.balance) || 0) : 0;
    let retryCount = 0;
    const maxRetries = 5;
    
    while (Math.abs(verifiedBalance - newBalance) > 0.01 && retryCount < maxRetries) {
      console.warn(`[Approve Deposit] Balance mismatch (attempt ${retryCount + 1}/${maxRetries}):`, {
        expected: newBalance,
        actual: verifiedBalance,
        difference: Math.abs(verifiedBalance - newBalance),
      });
      
      // Force update again
      await User.update(user.id, { balance: newBalance });
      await new Promise(resolve => setTimeout(resolve, 200));
      
      verifiedUser = await User.findById(user.id);
      verifiedBalance = verifiedUser ? (Number(verifiedUser.balance) || 0) : 0;
      retryCount++;
    }
    
    if (Math.abs(verifiedBalance - newBalance) > 0.01) {
      console.error('[Approve Deposit] ===== FAILED TO UPDATE BALANCE =====');
      console.error('[Approve Deposit] Expected:', newBalance);
      console.error('[Approve Deposit] Got:', verifiedBalance);
      console.error('[Approve Deposit] User ID:', user.id);
      console.error('[Approve Deposit] Username:', user.username);
      return NextResponse.json({
        message: 'Không thể cập nhật số dư. Vui lòng thử lại.',
        error: 'Balance update failed',
        expected: newBalance,
        actual: verifiedBalance,
        userId: user.id,
        username: user.username,
      }, { status: 500 });
    } else {
      console.log('[Approve Deposit] ===== BALANCE UPDATED SUCCESSFULLY =====');
      console.log('[Approve Deposit] User:', user.username, 'ID:', user.id);
      console.log('[Approve Deposit] Old Balance:', currentBalance);
      console.log('[Approve Deposit] Deposit Amount:', depositAmount);
      console.log('[Approve Deposit] New Balance:', verifiedBalance);
    }

    // Update deposit status
    await DepositRequest.update(params.id, {
      status: 'approved',
      approvedBy: decoded.userId,
      approvedAt: new Date(),
      adminNote: body.note || '',
    });

    // Create transaction record
    await Transaction.create({
      userId: user.id,
      type: 'deposit',
      amount: depositAmount,
      description: `Nạp tiền - ${deposit.method || 'Chuyển khoản'}`,
      beforeBalance: currentBalance,
      afterBalance: newBalance,
    });
    
    // Get final user data
    const finalUser = await User.findById(user.id);
    const finalBalance = finalUser ? (Number(finalUser.balance) || 0) : 0;

    // Format response
    const updatedDeposit = await DepositRequest.findById(params.id);
    const formattedDeposit = {
      ...updatedDeposit!,
      _id: updatedDeposit!.id,
    };

    return NextResponse.json({
      ...formattedDeposit,
      user: finalUser ? {
        id: finalUser.id,
        username: finalUser.username,
        balance: finalBalance,
      } : null,
      success: true,
    });
  } catch (error: any) {
    console.error('[Admin Deposits Approve API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}
