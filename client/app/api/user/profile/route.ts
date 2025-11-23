import { NextRequest, NextResponse } from 'next/server';
import { User, Transaction } from '@/lib/kv-models';
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

    // Get user from database
    let user = await User.findById(decoded.userId);
    
    if (!user) {
      return NextResponse.json(
        { message: 'User không tồn tại' },
        { status: 404 }
      );
    }

    // Calculate balance from transactions to ensure accuracy
    try {
      const transactions = await Transaction.findByUserId(user.id);
      const depositTotal = transactions
        .filter(tx => tx.type === 'deposit')
        .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
      const purchaseTotal = transactions
        .filter(tx => tx.type === 'purchase')
        .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
      const calculatedBalance = depositTotal - purchaseTotal;
      
      const storedBalance = Number(user.balance) || 0;
      
      // If calculated balance doesn't match stored balance, update it
      if (Math.abs(calculatedBalance - storedBalance) > 0.01) {
        console.log('[Profile API] Balance mismatch detected!', {
          stored: storedBalance,
          calculated: calculatedBalance,
          depositTotal,
          purchaseTotal,
          updating: true,
        });
        await User.update(user.id, { balance: calculatedBalance });
        // Reload user
        user = await User.findById(decoded.userId);
        if (!user) {
          return NextResponse.json({ message: 'User không tồn tại' }, { status: 404 });
        }
        user.balance = calculatedBalance;
      }
    } catch (error) {
      console.error('[Profile API] Error calculating balance from transactions:', error);
      // Continue with stored balance if calculation fails
    }

    // Ensure user exists (after potential reload)
    if (!user) {
      return NextResponse.json({ message: 'User không tồn tại' }, { status: 404 });
    }

    // Ensure user has role (fallback to decoded role if user doesn't have it)
    const userRole = user.role || decoded.role || 'user';
    
    // Update user role if it's missing but token has it
    if (!user.role && decoded.role) {
      await User.update(user.id, { role: decoded.role });
      user.role = decoded.role;
    }

    // Return user data (without password)
    // Ensure Date objects are properly serialized
    const { password: _, ...userWithoutPassword } = { ...user, role: userRole };
    
    // Convert Date objects to ISO strings and ensure all fields have defaults
    const responseUser: any = {
      ...userWithoutPassword,
      id: userWithoutPassword.id || user.id,
      username: userWithoutPassword.username || user.username || '',
      name: userWithoutPassword.name || user.name || '',
      balance: Number(userWithoutPassword.balance) || Number(user.balance) || 0,
      role: userRole,
      currentPackage: userWithoutPassword.currentPackage || user.currentPackage || null,
      isActive: userWithoutPassword.isActive !== false && user.isActive !== false,
    };
    
    if (responseUser.lastLogin && responseUser.lastLogin instanceof Date) {
      responseUser.lastLogin = responseUser.lastLogin.toISOString();
    } else if (responseUser.lastLogin && typeof responseUser.lastLogin === 'string') {
      // Already a string, keep it
    } else {
      responseUser.lastLogin = null;
    }
    
    if (responseUser.createdAt && responseUser.createdAt instanceof Date) {
      responseUser.createdAt = responseUser.createdAt.toISOString();
    }
    
    if (responseUser.updatedAt && responseUser.updatedAt instanceof Date) {
      responseUser.updatedAt = responseUser.updatedAt.toISOString();
    }
    
    console.log('[Profile API] Returning user data:', {
      id: responseUser.id,
      username: responseUser.username,
      name: responseUser.name,
      balance: responseUser.balance,
      role: responseUser.role,
    });

    return NextResponse.json({ user: responseUser });
  } catch (error: any) {
    console.error('[Profile API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}
