// Vercel KV User Model
import { kvHelpers } from '../kv';
import { KV_PREFIXES } from '../kv-local';
import bcrypt from 'bcryptjs';

export interface IUser {
  id: string;
  username: string;
  password: string;
  name: string;
  balance: number;
  role: 'user' | 'admin';
  currentPackage: string | null;
  packagePurchasedAt?: Date | string | null; // When the current package was purchased
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

class UserKV {
  private getKey(id: string): string {
    return `${KV_PREFIXES.USER}${id}`;
  }

  private getUsernameIndexKey(username: string): string {
    return `${KV_PREFIXES.USER_BY_USERNAME}${username.toLowerCase()}`;
  }

  async create(data: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const user: IUser = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    // Hash password if not already hashed
    if (!data.password.startsWith('$2')) {
      user.password = await bcrypt.hash(data.password, 10);
    }

    // Save user
    await kvHelpers.set(this.getKey(id), user);
    
    // Save username index for lookup
    await kvHelpers.set(this.getUsernameIndexKey(data.username), id);

    return user;
  }

  async findById(id: string): Promise<IUser | null> {
    const user = await kvHelpers.get<IUser>(this.getKey(id));
    if (!user) return null;
    
    // Ensure balance is always a number
    if (user.balance !== undefined) {
      user.balance = Number(user.balance) || 0;
    } else {
      user.balance = 0;
    }
    
    return user;
  }

  async findByUsername(username: string): Promise<IUser | null> {
    const userId = await kvHelpers.get<string>(this.getUsernameIndexKey(username));
    if (!userId) return null;
    const user = await this.findById(userId);
    if (!user) return null;
    
    // Ensure balance is always a number
    if (user.balance !== undefined) {
      user.balance = Number(user.balance) || 0;
    } else {
      user.balance = 0;
    }
    
    return user;
  }

  async findAll(): Promise<IUser[]> {
    const keys = await kvHelpers.keys(`${KV_PREFIXES.USER}*`);
    // Filter out username index keys
    const userIds = keys.filter(key => !key.startsWith(KV_PREFIXES.USER_BY_USERNAME));
    if (userIds.length === 0) return [];
    const users = await kvHelpers.mget<IUser>(userIds);
    return users
      .filter((user): user is IUser => user !== null)
      .map(user => {
        // Ensure balance is always a number
        if (user.balance !== undefined) {
          user.balance = Number(user.balance) || 0;
        } else {
          user.balance = 0;
        }
        return user;
      });
  }

  async update(id: string, updates: Partial<Omit<IUser, 'id' | 'createdAt'>>): Promise<IUser | null> {
    const user = await this.findById(id);
    if (!user) return null;

    // Prepare updates with balance handling
    const processedUpdates: any = { ...updates };
    
    // If balance is being updated, ensure it's a number
    if (processedUpdates.balance !== undefined) {
      processedUpdates.balance = Number(processedUpdates.balance);
      if (isNaN(processedUpdates.balance)) {
        processedUpdates.balance = 0;
      }
    }

    // Create updated user object - merge updates with existing user
    const updated: IUser = {
      ...user,
      ...processedUpdates,
      updatedAt: new Date(),
    };

    // CRITICAL: Force balance to be the new value if provided, otherwise keep existing
    if (processedUpdates.balance !== undefined) {
      updated.balance = Number(processedUpdates.balance) || 0;
    } else {
      updated.balance = Number(updated.balance) || 0;
    }
    
    // Ensure balance is always a number
    updated.balance = Number(updated.balance) || 0;
    
    console.log('[User.update] Updating user:', {
      id: updated.id,
      username: updated.username,
      oldBalance: Number(user.balance) || 0,
      newBalance: updated.balance,
      balanceType: typeof updated.balance,
    });

    // Save to KV store
    const key = this.getKey(id);
    
    // Save multiple times to ensure it's persisted
    for (let saveAttempt = 0; saveAttempt < 3; saveAttempt++) {
      await kvHelpers.set(key, updated);
      // Wait longer for KV to sync (especially for Redis)
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Reload and verify - retry up to 10 times with longer waits
    let verified: IUser | null = null;
    const maxRetries = 10;
    for (let i = 0; i < maxRetries; i++) {
      // Wait a bit before checking
      await new Promise(resolve => setTimeout(resolve, 100));
      
      verified = await this.findById(id);
      if (verified) {
        const verifiedBalance = Number(verified.balance) || 0;
        const expectedBalance = Number(updated.balance) || 0;
        
        if (Math.abs(verifiedBalance - expectedBalance) <= 0.01) {
          console.log(`[User.update] Balance verified successfully on attempt ${i + 1}`);
          break; // Balance matches, we're good
        }
        
        // Balance doesn't match, force update again
        console.warn(`[User.update] Balance mismatch on attempt ${i + 1}:`, {
          expected: expectedBalance,
          actual: verifiedBalance,
          difference: Math.abs(verifiedBalance - expectedBalance),
        });
        
        verified.balance = expectedBalance;
        // Save the corrected balance
        for (let saveAttempt = 0; saveAttempt < 2; saveAttempt++) {
          await kvHelpers.set(key, verified);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } else {
        // User not found, save again
        console.warn(`[User.update] User not found on attempt ${i + 1}, saving again...`);
        for (let saveAttempt = 0; saveAttempt < 2; saveAttempt++) {
          await kvHelpers.set(key, updated);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    }
    
    // Final verification
    const finalUser = await this.findById(id);
    if (finalUser) {
      const finalBalance = Number(finalUser.balance) || 0;
      const expectedBalance = Number(updated.balance) || 0;
      
      if (Math.abs(finalBalance - expectedBalance) > 0.01) {
        console.error('[User.update] ===== FINAL BALANCE MISMATCH =====');
        console.error('[User.update] Expected:', expectedBalance);
        console.error('[User.update] Got:', finalBalance);
        console.error('[User.update] User ID:', id);
        
        // Last attempt: force save with correct balance
        finalUser.balance = expectedBalance;
        await kvHelpers.set(key, finalUser);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Return the corrected user
        const correctedUser = await this.findById(id);
        return correctedUser || { ...finalUser, balance: expectedBalance } as IUser;
      }
      
      return finalUser;
    }
    
    return verified || updated;
  }

  /**
   * Add balance to user (safer than direct update)
   * This method ensures balance is added correctly
   */
  async addBalance(id: string, amount: number): Promise<IUser | null> {
    const user = await this.findById(id);
    if (!user) return null;
    
    const currentBalance = Number(user.balance) || 0;
    const addAmount = Number(amount) || 0;
    const newBalance = Math.round((currentBalance + addAmount) * 100) / 100;
    
    console.log('[User.addBalance] Adding balance:', {
      userId: id,
      username: user.username,
      currentBalance,
      addAmount,
      newBalance,
    });
    
    return await this.update(id, { balance: newBalance });
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.findById(id);
    if (!user) return false;

    await kvHelpers.del(this.getKey(id));
    await kvHelpers.del(this.getUsernameIndexKey(user.username));
    return true;
  }

  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

export const User = new UserKV();
export default User;

