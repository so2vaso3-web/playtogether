import { NextRequest, NextResponse } from 'next/server';
import { DepositRequest, User } from '@/lib/kv-models';
import connectDB from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Find pending deposit
    const deposits = await DepositRequest.findAll();
    const pendingDeposit = deposits.find(d => d.status === 'pending');
    
    if (!pendingDeposit) {
      return NextResponse.json({ 
        error: 'Không có deposit nào đang pending',
        deposits: deposits.length 
      });
    }
    
    console.log('[Test Approve] Found pending deposit:', pendingDeposit);
    
    // Get user
    const userId = typeof pendingDeposit.userId === 'string'
      ? pendingDeposit.userId
      : ((pendingDeposit.userId as any)?.id || (pendingDeposit.userId as any)?._id || pendingDeposit.userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'No userId in deposit' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found', userId });
    }
    
    console.log('[Test Approve] User before:', {
      id: user.id,
      username: user.username,
      balance: user.balance,
      balanceType: typeof user.balance,
    });
    
    const currentBalance = Number(user.balance) || 0;
    const depositAmount = Number(pendingDeposit.amount) || 0;
    const newBalance = currentBalance + depositAmount;
    
    console.log('[Test Approve] Calculation:', {
      currentBalance,
      depositAmount,
      newBalance,
    });
    
    // Update balance
    const updateResult = await User.update(user.id, { balance: newBalance });
    
    console.log('[Test Approve] Update result:', {
      balance: updateResult?.balance,
      balanceType: typeof updateResult?.balance,
    });
    
    // Wait and verify
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const verifiedUser = await User.findById(user.id);
    const verifiedBalance = verifiedUser ? (Number(verifiedUser.balance) || 0) : 0;
    
    console.log('[Test Approve] Verified user:', {
      balance: verifiedBalance,
      balanceType: typeof verifiedBalance,
      expected: newBalance,
      match: Math.abs(verifiedBalance - newBalance) <= 0.01,
    });
    
    // Update deposit status
    await DepositRequest.update(pendingDeposit.id, {
      status: 'approved',
      approvedBy: 'test',
      approvedAt: new Date(),
    });
    
    return NextResponse.json({
      success: true,
      deposit: {
        id: pendingDeposit.id,
        amount: depositAmount,
      },
      user: {
        id: user.id,
        username: user.username,
        balanceBefore: currentBalance,
        balanceAfter: verifiedBalance,
        expectedBalance: newBalance,
        balanceMatch: Math.abs(verifiedBalance - newBalance) <= 0.01,
      },
      updateResult: {
        balance: updateResult?.balance,
        balanceType: typeof updateResult?.balance,
      },
    });
  } catch (error: any) {
    console.error('[Test Approve] Error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

