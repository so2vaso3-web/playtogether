// Vercel KV Database Connection (replacing MongoDB)
import { kvStoreFinal } from './kv';

async function connectDB() {
  try {
    // Test KV connection with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 3000)
    );
    
    await Promise.race([
      kvStoreFinal.set('health:check', { status: 'ok', timestamp: Date.now() }),
      timeoutPromise
    ]);
    
    const health = await Promise.race([
      kvStoreFinal.get('health:check'),
      timeoutPromise
    ]);
    
    if (health) {
      console.log('✓ Database Connected (Vercel KV or Local Mock)');
      return kvStoreFinal;
    } else {
      console.warn('⚠ Database connection test failed - using anyway');
      return kvStoreFinal;
    }
  } catch (error: any) {
    // For timeout or connection errors, still return kvStoreFinal for local dev
    if (error.message === 'Connection timeout') {
      console.warn('⚠ Database connection timeout - using anyway (local dev mode)');
    } else {
      console.warn('⚠ Database connection error, using anyway:', error.message);
    }
    return kvStoreFinal; // Return anyway for local dev
  }
}

export default connectDB;
