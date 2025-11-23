import { NextRequest, NextResponse } from 'next/server';
import { Package } from '@/lib/kv-models';
import connectDB from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const packages = await Package.findAll();
    const validPackages = packages
      .filter(pkg => pkg.name && pkg.price !== undefined && pkg.price !== null)
      .sort((a, b) => a.price - b.price);
    
    console.log(`[API Packages] Returning ${validPackages.length} valid packages`);
    
    return NextResponse.json(validPackages, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    console.error('[API Packages] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi lấy gói', error: error.message },
      { status: 500 }
    );
  }
}
