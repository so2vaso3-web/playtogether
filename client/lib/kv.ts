import { createClient, RedisClientType } from 'redis';
import { localKV } from './kv-local';

// Redis Store - Support Redis Labs (REDIS_URL)
// Use local mock if Redis credentials are not available (for local dev)

// Check if we have Redis credentials
const hasRedisURL = process.env.REDIS_URL;

let kvStore: any;
let redisClient: RedisClientType | null = null;
let connectionPromise: Promise<void> | null = null;

// Lazy connection function for serverless environments
async function ensureRedisConnection(): Promise<RedisClientType | null> {
  if (!hasRedisURL) return null;
  
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  if (!redisClient) {
    try {
      redisClient = createClient({
        url: process.env.REDIS_URL!,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 3) {
              console.error('Redis connection failed after 3 retries');
              return new Error('Redis connection failed');
            }
            return Math.min(retries * 100, 3000);
          },
        },
      }) as RedisClientType;
      
      redisClient.on('error', (err: Error) => {
        console.error('Redis Client Error:', err);
      });
      
      redisClient.on('connect', () => {
        console.log('✓ Redis connecting...');
      });
      
      redisClient.on('ready', () => {
        console.log('✓ Redis connected and ready');
      });
    } catch (error) {
      console.error('Failed to create Redis client:', error);
      return null;
    }
  }

  if (!connectionPromise) {
    connectionPromise = (async () => {
      try {
        if (!redisClient!.isOpen) {
          await redisClient!.connect();
          console.log('✓ Connected to Redis with REDIS_URL');
        }
      } catch (error) {
        console.error('Failed to connect to Redis:', error);
        redisClient = null;
        connectionPromise = null;
        throw error;
      }
    })();
  }

  try {
    await connectionPromise;
    return redisClient;
  } catch (error) {
    return null;
  }
}

if (hasRedisURL) {
  // Create Redis wrapper with lazy connection
  kvStore = {
    async get(key: string) {
      try {
        const client = await ensureRedisConnection();
        if (!client) {
          console.warn('Redis not available, using localKV');
          return await localKV.get(key);
        }
        const value = await client.get(key);
        if (!value) return null;
        const parsed = JSON.parse(value);
        // Fix balance for user objects
        if (parsed && typeof parsed === 'object' && 'balance' in parsed) {
          parsed.balance = Number(parsed.balance) || 0;
        }
        return parsed;
      } catch (error) {
        console.error(`Redis GET error for key ${key}:`, error);
        // Fallback to localKV
        return await localKV.get(key);
      }
    },
    async set(key: string, value: any, options?: { ex?: number }) {
      try {
        const client = await ensureRedisConnection();
        if (!client) {
          console.warn('Redis not available, using localKV');
          return await localKV.set(key, value, options);
        }
        // Ensure balance is a number before serializing
        let valueToSave = value;
        if (value && typeof value === 'object' && 'balance' in value) {
          valueToSave = {
            ...value,
            balance: Number(value.balance) || 0,
          };
        }
        const serialized = JSON.stringify(valueToSave);
        if (options?.ex) {
          await client.setEx(key, options.ex, serialized);
        } else {
          await client.set(key, serialized);
        }
        return true;
      } catch (error) {
        console.error(`Redis SET error for key ${key}:`, error);
        // Fallback to localKV
        return await localKV.set(key, value, options);
      }
    },
    async del(key: string) {
      try {
        const client = await ensureRedisConnection();
        if (!client) {
          console.warn('Redis not available, using localKV');
          return await localKV.del(key);
        }
        await client.del(key);
        return true;
      } catch (error) {
        console.error(`Redis DEL error for key ${key}:`, error);
        // Fallback to localKV
        return await localKV.del(key);
      }
    },
    async keys(pattern: string) {
      try {
        const client = await ensureRedisConnection();
        if (!client) {
          console.warn('Redis not available, using localKV');
          return await localKV.keys(pattern);
        }
        const keys = await client.keys(pattern);
        return keys;
      } catch (error) {
        console.error(`Redis KEYS error for pattern ${pattern}:`, error);
        // Fallback to localKV
        return await localKV.keys(pattern);
      }
    },
    async mget(...keys: string[]) {
      try {
        const client = await ensureRedisConnection();
        if (!client) {
          console.warn('Redis not available, using localKV');
          return await localKV.mget(...keys);
        }
        if (keys.length === 0) return [];
        const values = await client.mGet(keys);
        return values.map((v: string | null) => {
          if (!v) return null;
          const parsed = JSON.parse(v);
          // Fix balance for user objects
          if (parsed && typeof parsed === 'object' && 'balance' in parsed) {
            parsed.balance = Number(parsed.balance) || 0;
          }
          return parsed;
        });
      } catch (error) {
        console.error(`Redis MGET error:`, error);
        // Fallback to localKV
        return await localKV.mget(...keys);
      }
    },
    async exists(key: string) {
      try {
        const client = await ensureRedisConnection();
        if (!client) {
          console.warn('Redis not available, using localKV');
          return await localKV.exists(key);
        }
        const result = await client.exists(key);
        return result === 1;
      } catch (error) {
        console.error(`Redis EXISTS error for key ${key}:`, error);
        // Fallback to localKV
        return await localKV.exists(key);
      }
    },
  };
} else {
  // Use local mock for development
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠ No Redis credentials found, using local in-memory store');
  }
  kvStore = localKV;
  
  // Auto-seed local data on first use
  if (process.env.NODE_ENV === 'development') {
    (async () => {
      try {
        const { KV_PREFIXES } = await import('./kv-local');
        const existing = await localKV.get(`${KV_PREFIXES.USER_BY_USERNAME}admin`);
        if (!existing) {
          console.log('🌱 Seeding local mock data...');
          const { default: seedLocal } = await import('../scripts/seed-local');
          await seedLocal();
        }
      } catch (error) {
        // Ignore seed errors
        console.error('Seed error:', error);
      }
    })();
  }
}

export const kvStoreFinal = kvStore;

// Helper functions for common operations
export const kvHelpers = {
  // Get a value by key
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await kvStoreFinal.get(key) as T | null;
      return value;
    } catch (error) {
      console.error(`KV GET error for key ${key}:`, error);
      return null;
    }
  },

  // Set a value by key
  async set<T>(key: string, value: T, options?: { ex?: number }): Promise<boolean> {
    try {
      await kvStoreFinal.set(key, value, options);
      return true;
    } catch (error) {
      console.error(`KV SET error for key ${key}:`, error);
      return false;
    }
  },

  // Delete a value by key
  async del(key: string): Promise<boolean> {
    try {
      await kvStoreFinal.del(key);
      return true;
    } catch (error) {
      console.error(`KV DEL error for key ${key}:`, error);
      return false;
    }
  },

  // Get all keys matching pattern
  async keys(pattern: string): Promise<string[]> {
    try {
      const keys = await kvStoreFinal.keys(pattern);
      return keys as string[];
    } catch (error) {
      console.error(`KV KEYS error for pattern ${pattern}:`, error);
      return [];
    }
  },

  // Get multiple values by keys
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (keys.length === 0) return [];
      const values = await kvStoreFinal.mget(...keys) as (T | null)[];
      return values || keys.map(() => null);
    } catch (error) {
      console.error(`KV MGET error:`, error);
      return keys.map(() => null);
    }
  },

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const exists = await kvStoreFinal.exists(key);
      return exists === 1 || exists === true;
    } catch (error) {
      console.error(`KV EXISTS error for key ${key}:`, error);
      return false;
    }
  },
};

export default kvStoreFinal;
