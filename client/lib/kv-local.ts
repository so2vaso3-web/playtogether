// Local Mock KV Store for development (when Vercel KV credentials are not available)
// This uses file-based storage to persist data across server restarts

import path from 'path';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';

export const KV_PREFIXES = {
  USER: 'user:',
  PACKAGE: 'package:',
  TRANSACTION: 'transaction:',
  PAYMENT: 'payment:',
  DEPOSIT: 'deposit:',
  BANK: 'bank:',
  TICKET: 'ticket:',
  USER_PACKAGE: 'user_package:',
  SETTINGS: 'settings:',
  // Indexes
  USER_BY_USERNAME: 'idx:user:username:',
  PACKAGE_ALL: 'idx:package:all',
  TRANSACTION_BY_USER: 'idx:transaction:user:',
  DEPOSIT_ALL: 'idx:deposit:all',
  BANK_ALL: 'idx:bank:all',
  TICKET_ALL: 'idx:ticket:all',
};

// File path for persistent storage
const STORAGE_FILE = path.join(process.cwd(), '.local-kv-storage.json');

class LocalKV {
  private store: Map<string, any> = new Map();
  private initialized = false;

  private async initialize() {
    if (this.initialized) return;
    
    try {
      // Load from file if exists
      if (existsSync(STORAGE_FILE)) {
        const data = readFileSync(STORAGE_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        this.store = new Map(parsed);
        
        // Fix balance for all user objects when loading
        for (const [key, value] of this.store.entries()) {
          if (key.startsWith('user:') && value && typeof value === 'object' && 'balance' in value) {
            const userValue = value as any;
            if (userValue.balance !== undefined) {
              userValue.balance = Number(userValue.balance) || 0;
            }
          }
        }
        
        console.log(`[LocalKV] Loaded ${this.store.size} entries from file`);
      } else {
        console.log('[LocalKV] No existing storage file, starting fresh');
      }
    } catch (error) {
      console.error('[LocalKV] Error loading storage file:', error);
      // Start with empty store if file is corrupted
      this.store = new Map();
    }
    
    this.initialized = true;
  }

  private async save() {
    try {
      const data = Array.from(this.store.entries());
      writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('[LocalKV] Error saving storage file:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    await this.initialize();
    const value = this.store.get(key);
    if (!value) return null;
    
    // If this is a user object, ensure balance is a number
    if (value && typeof value === 'object' && 'balance' in value) {
      const userValue = value as any;
      if (userValue.balance !== undefined) {
        userValue.balance = Number(userValue.balance) || 0;
      }
    }
    
    return value as T;
  }

  async set<T>(key: string, value: T, options?: { ex?: number }): Promise<void> {
    await this.initialize();
    
    // If this is a user object, ensure balance is a number before saving
    if (value && typeof value === 'object' && 'balance' in value) {
      const userValue = value as any;
      if (userValue.balance !== undefined) {
        userValue.balance = Number(userValue.balance) || 0;
      }
    }
    
    this.store.set(key, value);
    await this.save();
    // TODO: Implement expiration if needed
  }

  async del(key: string): Promise<void> {
    await this.initialize();
    this.store.delete(key);
    await this.save();
  }

  async keys(pattern: string): Promise<string[]> {
    await this.initialize();
    const keys = Array.from(this.store.keys());
    // Simple pattern matching (support * wildcard)
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return keys.filter(k => regex.test(k));
    }
    return keys.filter(k => k === pattern || k.startsWith(pattern));
  }

  async mget<T>(...keys: string[]): Promise<(T | null)[]> {
    await this.initialize();
    return keys.map(key => (this.store.get(key) as T) || null);
  }

  async exists(key: string): Promise<number> {
    await this.initialize();
    return this.store.has(key) ? 1 : 0;
  }

  // Clear all data (useful for testing)
  clear(): void {
    this.store.clear();
    if (existsSync(STORAGE_FILE)) {
      unlinkSync(STORAGE_FILE);
    }
  }
}

export const localKV = new LocalKV();
