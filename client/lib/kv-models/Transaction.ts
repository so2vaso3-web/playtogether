// Vercel KV Transaction Model
import { kvHelpers } from '../kv';
import { KV_PREFIXES } from '../kv-local';

export interface ITransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'purchase' | 'refund';
  amount: number;
  beforeBalance?: number;
  afterBalance?: number;
  description?: string;
  relatedPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

class TransactionKV {
  private getKey(id: string): string {
    return `${KV_PREFIXES.TRANSACTION}${id}`;
  }

  private getUserTransactionsKey(userId: string): string {
    return `${KV_PREFIXES.TRANSACTION_BY_USER}${userId}`;
  }

  private async getUserTransactionIds(userId: string): Promise<string[]> {
    const ids = await kvHelpers.get<string[]>(this.getUserTransactionsKey(userId)) || [];
    return ids;
  }

  private async addToUserIndex(userId: string, transactionId: string): Promise<void> {
    const ids = await this.getUserTransactionIds(userId);
    if (!ids.includes(transactionId)) {
      ids.push(transactionId);
      await kvHelpers.set(this.getUserTransactionsKey(userId), ids);
    }
  }

  async create(data: Omit<ITransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<ITransaction> {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const transaction: ITransaction = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await kvHelpers.set(this.getKey(id), transaction);
    await this.addToUserIndex(data.userId, id);

    return transaction;
  }

  async findById(id: string): Promise<ITransaction | null> {
    return await kvHelpers.get<ITransaction>(this.getKey(id));
  }

  async findByUserId(userId: string): Promise<ITransaction[]> {
    const ids = await this.getUserTransactionIds(userId);
    if (ids.length === 0) return [];

    const transactions = await kvHelpers.mget<ITransaction>(ids.map(id => this.getKey(id)));
    return transactions
      .filter((tx): tx is ITransaction => tx !== null)
      .map(tx => ({
        ...tx,
        createdAt: tx.createdAt instanceof Date ? tx.createdAt : new Date(tx.createdAt),
        updatedAt: tx.updatedAt instanceof Date ? tx.updatedAt : new Date(tx.updatedAt),
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findAll(): Promise<ITransaction[]> {
    // Get all transaction keys
    const keys = await kvHelpers.keys(`${KV_PREFIXES.TRANSACTION}*`);
    if (keys.length === 0) return [];
    
    const transactions = await kvHelpers.mget<ITransaction>(keys);
    return transactions
      .filter((tx): tx is ITransaction => tx !== null)
      .map(tx => ({
        ...tx,
        createdAt: tx.createdAt instanceof Date ? tx.createdAt : new Date(tx.createdAt),
        updatedAt: tx.updatedAt instanceof Date ? tx.updatedAt : new Date(tx.updatedAt),
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async delete(id: string): Promise<boolean> {
    const transaction = await this.findById(id);
    if (!transaction) return false;

    await kvHelpers.del(this.getKey(id));
    
    // Remove from user index
    const userId = transaction.userId;
    const ids = await this.getUserTransactionIds(userId);
    const filtered = ids.filter(txId => txId !== id);
    await kvHelpers.set(this.getUserTransactionsKey(userId), filtered);

    return true;
  }
}

export const Transaction = new TransactionKV();
export default Transaction;

