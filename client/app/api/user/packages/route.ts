import { NextRequest, NextResponse } from 'next/server';
import { User, Package } from '@/lib/kv-models';
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

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User không tồn tại' },
        { status: 404 }
      );
    }

    // Get user's current package
    const userPackages = [];
    if (user.currentPackage) {
      const pkg = await Package.findById(user.currentPackage);
      if (pkg) {
        // Format package to match expected format (with _id for compatibility)
        const formattedPkg = {
          ...pkg,
          _id: pkg.id,
        };
        
        // Calculate expiresAt based on package duration
        // duration is in days, 0 or null means lifetime
        let expiresAt: Date | null = null;
        if (pkg.duration && pkg.duration > 0) {
          // Get purchase date from user (if stored) or use current date as fallback
          const purchaseDate = (user.packagePurchasedAt && user.packagePurchasedAt instanceof Date) 
            ? user.packagePurchasedAt 
            : (user.packagePurchasedAt && typeof user.packagePurchasedAt === 'string')
            ? new Date(user.packagePurchasedAt)
            : new Date(); // Fallback to current date if not stored
          
          expiresAt = new Date(purchaseDate);
          expiresAt.setDate(expiresAt.getDate() + pkg.duration);
        }
        // If duration is 0 or null, it's a lifetime package (expiresAt stays null)
        
        const now = new Date();
        userPackages.push({
          _id: user.currentPackage,
          id: user.currentPackage,
          packageId: formattedPkg,
          status: 'active',
          expiresAt: expiresAt ? expiresAt.toISOString() : null,
          createdAt: now.toISOString(),
        });
      }
    }

    return NextResponse.json(userPackages);
  } catch (error: any) {
    console.error('[User Packages API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}
