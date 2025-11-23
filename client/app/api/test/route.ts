import { NextRequest, NextResponse } from 'next/server';
import { User, Package, Transaction, DepositRequest, BankAccount, Ticket, SiteSettings } from '@/lib/kv-models';
import connectDB from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const [users, packages, transactions, deposits, banks, tickets, settings] = await Promise.all([
      User.findAll().catch(() => []),
      Package.findAll().catch(() => []),
      Transaction.findAll().catch(() => []),
      DepositRequest.findAll().catch(() => []),
      BankAccount.findAll().catch(() => []),
      Ticket.findAll().catch(() => []),
      SiteSettings.getSettings().catch(() => null),
    ]);
    
    return NextResponse.json({
      message: 'Test API working',
      kv: 'Connected',
      stats: {
        users: users.length,
        packages: packages.length,
        transactions: transactions.length,
        deposits: deposits.length,
        banks: banks.length,
        tickets: tickets.length,
        settings: settings ? 'Loaded' : 'Not found',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        message: 'Test API error',
        error: error.message,
        kv: 'Not connected'
      },
      { status: 500 }
    );
  }
}
