import { NextRequest, NextResponse } from 'next/server';
import { BankAccount } from '@/lib/kv-models';
import connectDB from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // Retry logic for better reliability
  const maxRetries = 3;
  let lastError: any = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Connect to database with timeout
      await Promise.race([
        connectDB(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        )
      ]);
      
      // Get banks with timeout
      const banks = await Promise.race([
        BankAccount.findAll(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 5000)
        )
      ]) as any[];
      
      // Filter for active banks only
      const activeBanks = banks.filter(bank => bank.isActive !== false);
      
      // Auto-detect bankCode for ICB if missing and format response
      const banksWithCode = activeBanks.map(bank => {
        let formattedBank = { ...bank };
        
        // Ensure _id for compatibility
        (formattedBank as any)._id = formattedBank.id;
        
        // Auto-detect bankCode for ICB if missing
        if (!formattedBank.bankCode && formattedBank.accountNumber === '3456345670') {
          formattedBank.bankCode = 'ICB';
        }
        
        return formattedBank;
      });

      console.log('[Banks API] Returning banks:', banksWithCode.length, banksWithCode.map(b => ({
        _id: (b as any)._id || b.id,
        name: b.bankName,
        code: b.bankCode,
        account: b.accountNumber,
      })));

      return NextResponse.json(banksWithCode, { status: 200 });
    } catch (error: any) {
      lastError = error;
      console.error(`[Banks API] Error (attempt ${attempt}/${maxRetries}):`, error.message);
      
      // If not the last attempt, wait a bit before retrying
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
        continue;
      }
    }
  }
  
  // All retries failed
  console.error('[Banks API] All retries failed:', lastError);
  return NextResponse.json(
    { 
      message: 'Lỗi kết nối server. Vui lòng thử lại sau.', 
      error: lastError?.message || 'Unknown error',
      retries: maxRetries
    },
    { status: 500 }
  );
}
