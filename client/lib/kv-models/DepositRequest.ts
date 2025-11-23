// Vercel KV DepositRequest Model
import { kvHelpers } from '../kv';
import { KV_PREFIXES } from '../kv-local';

export interface IDepositRequest {
  id: string;
  userId: string;
  amount: number;
  method: string;
  status: 'pending' | 'approved' | 'rejected';
  description?: string;
  adminNote?: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class DepositRequestKV {
  private getKey(id: string): string {
    return `${KV_PREFIXES.DEPOSIT}${id}`;
  }

  private async getAllDepositIds(): Promise<string[]> {
    const all = await kvHelpers.get<string[]>(KV_PREFIXES.DEPOSIT_ALL) || [];
    return all;
  }

  private async addToAllIndex(id: string): Promise<void> {
    const all = await this.getAllDepositIds();
    if (!all.includes(id)) {
      all.push(id);
      await kvHelpers.set(KV_PREFIXES.DEPOSIT_ALL, all);
    }
  }

  async create(data: Omit<IDepositRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<IDepositRequest> {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const deposit: IDepositRequest = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await kvHelpers.set(this.getKey(id), deposit);
    await this.addToAllIndex(id);

    return deposit;
  }

  async findById(id: string): Promise<IDepositRequest | null> {
    return await kvHelpers.get<IDepositRequest>(this.getKey(id));
  }

  async findAll(): Promise<IDepositRequest[]> {
    const ids = await this.getAllDepositIds();
    if (ids.length === 0) return [];

    const deposits = await kvHelpers.mget<IDepositRequest>(ids.map(id => this.getKey(id)));
    return deposits.filter((deposit): deposit is IDepositRequest => deposit !== null);
  }

  async find(query?: any): Promise<IDepositRequest[]> {
    const all = await this.findAll();
    if (!query) return all;
    
    // Simple filtering
    let filtered = all;
    if (query.status) {
      filtered = filtered.filter(d => d.status === query.status);
    }
    if (query.userId) {
      filtered = filtered.filter(d => d.userId === query.userId);
    }
    
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async populate(deposit: IDepositRequest, fields: string[]): Promise<any> {
    // Simple populate - just return the deposit with userId as string
    const result: any = { ...deposit };
    if (fields.includes('userId')) {
      // In real app, you'd fetch user here
      result.userId = { id: deposit.userId };
    }
    if (fields.includes('approvedBy') && deposit.approvedBy) {
      result.approvedBy = { id: deposit.approvedBy };
    }
    return result;
  }

  async update(id: string, updates: Partial<Omit<IDepositRequest, 'id' | 'createdAt'>>): Promise<IDepositRequest | null> {
    const deposit = await this.findById(id);
    if (!deposit) return null;

    const updated: IDepositRequest = {
      ...deposit,
      ...updates,
      updatedAt: new Date(),
    };

    await kvHelpers.set(this.getKey(id), updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const deposit = await this.findById(id);
    if (!deposit) return false;

    await kvHelpers.del(this.getKey(id));
    const all = await this.getAllDepositIds();
    const filtered = all.filter(depositId => depositId !== id);
    await kvHelpers.set(KV_PREFIXES.DEPOSIT_ALL, filtered);
    return true;
  }
}

export const DepositRequest = new DepositRequestKV();
export default DepositRequest;

