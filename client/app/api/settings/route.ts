import { NextRequest, NextResponse } from 'next/server';
import { SiteSettings } from '@/lib/kv-models';
import connectDB from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Public API to get site settings (no auth required)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const settings = await SiteSettings.getSettings();
    
    // getSettings() always returns a settings object (creates default if none exists)
    if (!settings || !settings.id) {
      // Return default settings if none exist
      return NextResponse.json({
        logoUrl: '',
        faviconUrl: '',
        siteName: 'PlayTogether Hack',
        siteDescription: 'Premium Gaming Tools',
        primaryColor: '#a855f7',
        secondaryColor: '#ec4899',
        zaloId: '0896455341',
        maintenance: false,
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('[Settings API] Error:', error);
    // Return default settings if error
    return NextResponse.json({
      logoUrl: '',
      faviconUrl: '',
      siteName: 'PlayTogether Hack',
      siteDescription: 'Premium Gaming Tools',
      primaryColor: '#a855f7',
      secondaryColor: '#ec4899',
      zaloId: '0896455341',
      maintenance: false,
    });
  }
}
