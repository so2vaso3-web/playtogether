// Vercel KV BankAccount Model
import { kvHelpers } from '../kv';
import { KV_PREFIXES } from '../kv-local';

export interface IBankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  isActive: boolean;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

class BankAccountKV {
  private getKey(id: string): string {
    return `${KV_PREFIXES.BANK}${id}`;
  }

  private async getAllBankIds(): Promise<string[]> {
    const all = await kvHelpers.get<string[]>(KV_PREFIXES.BANK_ALL) || [];
    return all;
  }

  private async addToAllIndex(id: string): Promise<void> {
    const all = await this.getAllBankIds();
    if (!all.includes(id)) {
      all.push(id);
      await kvHelpers.set(KV_PREFIXES.BANK_ALL, all);
    }
  }

  async create(data: Omit<IBankAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<IBankAccount> {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const bank: IBankAccount = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await kvHelpers.set(this.getKey(id), bank);
    await this.addToAllIndex(id);

    return bank;
  }

  async findById(id: string): Promise<IBankAccount | null> {
    return await kvHelpers.get<IBankAccount>(this.getKey(id));
  }

  async findAll(): Promise<IBankAccount[]> {
    const ids = await this.getAllBankIds();
    if (ids.length === 0) return [];

    const banks = await kvHelpers.mget<IBankAccount>(ids.map(id => this.getKey(id)));
    return banks.filter((bank): bank is IBankAccount => bank !== null);
  }

  async find(query?: { isActive?: boolean }): Promise<IBankAccount[]> {
    const all = await this.findAll();
    if (!query) return all;
    
    if (query.isActive !== undefined) {
      return all.filter(bank => bank.isActive === query.isActive);
    }
    
    return all;
  }

  async update(id: string, updates: Partial<Omit<IBankAccount, 'id' | 'createdAt'>>): Promise<IBankAccount | null> {
    const bank = await this.findById(id);
    if (!bank) return null;

    const updated: IBankAccount = {
      ...bank,
      ...updates,
      updatedAt: new Date(),
    };

    await kvHelpers.set(this.getKey(id), updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const bank = await this.findById(id);
    if (!bank) return false;

    await kvHelpers.del(this.getKey(id));
    const all = await this.getAllBankIds();
    const filtered = all.filter(bankId => bankId !== id);
    await kvHelpers.set(KV_PREFIXES.BANK_ALL, filtered);
    return true;
  }
}

export const BankAccount = new BankAccountKV();
export default BankAccount;

