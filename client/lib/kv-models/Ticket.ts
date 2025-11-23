// Vercel KV Ticket Model
import { kvHelpers } from '../kv';
import { KV_PREFIXES } from '../kv-local';

export interface ITicket {
  id: string;
  userId: string;
  title: string;
  message: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high';
  adminId?: string;
  responses?: Array<{
    id: string;
    userId: string;
    message: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

class TicketKV {
  private getKey(id: string): string {
    return `${KV_PREFIXES.TICKET}${id}`;
  }

  private async getAllTicketIds(): Promise<string[]> {
    const all = await kvHelpers.get<string[]>(KV_PREFIXES.TICKET_ALL) || [];
    return all;
  }

  private async addToAllIndex(id: string): Promise<void> {
    const all = await this.getAllTicketIds();
    if (!all.includes(id)) {
      all.push(id);
      await kvHelpers.set(KV_PREFIXES.TICKET_ALL, all);
    }
  }

  async create(data: Omit<ITicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<ITicket> {
    const id = crypto.randomUUID();
    const now = new Date();
    
    const ticket: ITicket = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await kvHelpers.set(this.getKey(id), ticket);
    await this.addToAllIndex(id);

    return ticket;
  }

  async findById(id: string): Promise<ITicket | null> {
    return await kvHelpers.get<ITicket>(this.getKey(id));
  }

  async findByUserId(userId: string): Promise<ITicket[]> {
    const all = await this.findAll();
    return all
      .filter(ticket => ticket.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findAll(): Promise<ITicket[]> {
    const ids = await this.getAllTicketIds();
    if (ids.length === 0) return [];

    const tickets = await kvHelpers.mget<ITicket>(ids.map(id => this.getKey(id)));
    return tickets.filter((ticket): ticket is ITicket => ticket !== null);
  }

  async find(query?: any): Promise<ITicket[]> {
    const all = await this.findAll();
    if (!query) return all;
    
    let filtered = all;
    if (query.status) {
      filtered = filtered.filter(t => t.status === query.status);
    }
    if (query.userId) {
      filtered = filtered.filter(t => t.userId === query.userId);
    }
    
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async countDocuments(query?: any): Promise<number> {
    const all = await this.findAll();
    if (!query) return all.length;
    
    let filtered = all;
    if (query.status) {
      filtered = filtered.filter(t => t.status === query.status);
    }
    
    return filtered.length;
  }

  async update(id: string, updates: Partial<Omit<ITicket, 'id' | 'createdAt'>>): Promise<ITicket | null> {
    const ticket = await this.findById(id);
    if (!ticket) return null;

    const updated: ITicket = {
      ...ticket,
      ...updates,
      updatedAt: new Date(),
    };

    await kvHelpers.set(this.getKey(id), updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const ticket = await this.findById(id);
    if (!ticket) return false;

    await kvHelpers.del(this.getKey(id));
    const all = await this.getAllTicketIds();
    const filtered = all.filter(ticketId => ticketId !== id);
    await kvHelpers.set(KV_PREFIXES.TICKET_ALL, filtered);
    return true;
  }
}

export const Ticket = new TicketKV();
export default Ticket;

