import { NextRequest } from 'next/server';
import connectDB from './db';
import { getAuthUser } from './auth';
import { User } from './kv-models';

export async function isAdmin(req: NextRequest): Promise<boolean> {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) return false;
    
    // Auto set as admin if not admin
    if (user.role !== 'admin') {
      try {
        const dbUser = await User.findById(user.id);
        if (dbUser) {
          await User.update(dbUser.id, { role: 'admin' });
          return true;
        }
      } catch (err) {
        console.error('[Admin] Error auto-setting admin:', err);
      }
    }
    
    return user?.role === 'admin';
  } catch (error) {
    return false;
  }
}

export async function requireAdmin(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    
    if (!user) {
      return { error: 'Unauthorized', status: 401 };
    }
    
    // Auto set as admin if not admin
    if (user.role !== 'admin') {
      try {
        const dbUser = await User.findById(user.id);
        if (dbUser) {
          await User.update(dbUser.id, { role: 'admin' });
          // Reload user
          const updatedUser = await User.findById(user.id);
          if (updatedUser && updatedUser.role === 'admin') {
            return { user: updatedUser };
          }
        }
      } catch (err) {
        console.error('[Admin] Error auto-setting admin:', err);
      }
    }
    
    if (user.role !== 'admin') {
      return { error: 'Forbidden: Admin access required', status: 403 };
    }
    
    return { user };
  } catch (error: any) {
    return { error: 'Database connection error', status: 500 };
  }
}

// Helper function to auto-set admin for decoded JWT token
export async function ensureAdmin(decoded: any): Promise<void> {
  try {
    if (!decoded || !decoded.userId) return;
    
    if (decoded.role !== 'admin') {
      await connectDB();
      const user = await User.findById(decoded.userId);
      if (user) {
        await User.update(user.id, { role: 'admin' });
        decoded.role = 'admin'; // Update decoded object
        console.log('[Admin] Auto-set user as admin:', user.username);
      }
    }
  } catch (error: any) {
    console.error('[Admin] Error ensuring admin:', error);
  }
}

