import { NextRequest, NextResponse } from 'next/server';
import { SiteSettings } from '@/lib/kv-models';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import { ensureAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Settings GET] Starting...');
    await connectDB();
    console.log('[Admin Settings GET] Database connected');
    
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[Admin Settings GET] No auth header');
      return NextResponse.json(
        { message: 'Token không hợp lệ' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '').trim();
    
    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('[Admin Settings GET] Token verified, user:', decoded.userId, 'role:', decoded.role);
    } catch (error: any) {
      console.error('[Admin Settings GET] Token verification failed:', error.message);
      return NextResponse.json(
        { message: 'Token không hợp lệ hoặc đã hết hạn' },
        { status: 401 }
      );
    }

    // Auto set as admin if not admin
    await ensureAdmin(decoded);

    // Get settings
    console.log('[Admin Settings GET] Fetching settings...');
    try {
      const settings = await SiteSettings.getSettings();
      console.log('[Admin Settings GET] Settings fetched:', JSON.stringify(settings, null, 2));
      
      // Ensure all fields are present with defaults
      const response = {
        id: settings.id || 'main',
        logoUrl: settings.logoUrl || '',
        faviconUrl: settings.faviconUrl || '',
        siteName: settings.siteName || 'PlayTogether Hack',
        siteDescription: settings.siteDescription || 'Premium Gaming Tools',
        primaryColor: settings.primaryColor || '#a855f7',
        secondaryColor: settings.secondaryColor || '#ec4899',
        zaloId: settings.zaloId || '0896455341',
        zaloQrUrl: settings.zaloQrUrl || '',
        heroTitle: settings.heroTitle || 'PlayTogether Hack Store',
        heroDescription: settings.heroDescription || 'Công cụ hack game hàng đầu với công nghệ Anti-Ban tiên tiến',
        heroPrimaryButtonText: settings.heroPrimaryButtonText || 'Xem Gói Ngay',
        heroPrimaryButtonLink: settings.heroPrimaryButtonLink || '#packages',
        heroSecondaryButtonText: settings.heroSecondaryButtonText || 'Hỗ Trợ',
        heroSecondaryButtonLink: settings.heroSecondaryButtonLink || '/support',
        faqs: settings.faqs || [],
        metaTitle: settings.metaTitle || 'PlayTogether Hack Store',
        metaDescription: settings.metaDescription || 'Công cụ hack game hàng đầu',
        metaKeywords: settings.metaKeywords || 'hack game, playtogether, gaming tools',
        facebookUrl: settings.facebookUrl || '',
        telegramUrl: settings.telegramUrl || '',
        discordUrl: settings.discordUrl || '',
        youtubeUrl: settings.youtubeUrl || '',
        bannerText: settings.bannerText || '',
        bannerEnabled: settings.bannerEnabled !== undefined ? settings.bannerEnabled : false,
        bannerLink: settings.bannerLink || '',
        updatedAt: settings.updatedAt,
      };
      
      console.log('[Admin Settings GET] Returning settings:', JSON.stringify(response, null, 2));
      return NextResponse.json(response);
    } catch (settingsError: any) {
      console.error('[Admin Settings GET] Error fetching settings:', settingsError);
      console.error('[Admin Settings GET] Error stack:', settingsError.stack);
      
      // Return default settings if error
      const defaultSettings = {
        id: 'main',
        logoUrl: '',
        faviconUrl: '',
        siteName: 'PlayTogether Hack',
        siteDescription: 'Premium Gaming Tools',
        primaryColor: '#a855f7',
        secondaryColor: '#ec4899',
        zaloId: '0896455341',
        zaloQrUrl: '',
        updatedAt: new Date().toISOString(),
      };
      
      console.log('[Admin Settings GET] Returning default settings due to error');
      return NextResponse.json(defaultSettings);
    }
  } catch (error: any) {
    console.error('[Admin Settings GET] Unexpected error:', error);
    console.error('[Admin Settings GET] Error stack:', error.stack);
    
    // Return default settings even on error
    const defaultSettings = {
      id: 'main',
      logoUrl: '',
      faviconUrl: '',
      siteName: 'PlayTogether Hack',
      siteDescription: 'Premium Gaming Tools',
      primaryColor: '#a855f7',
      secondaryColor: '#ec4899',
      zaloId: '0896455341',
      zaloQrUrl: '',
      updatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json(defaultSettings);
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('[Admin Settings PUT] Starting...');
    await connectDB();
    console.log('[Admin Settings PUT] Database connected');
    
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[Admin Settings PUT] No auth header');
      return NextResponse.json(
        { message: 'Token không hợp lệ' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '').trim();
    
    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('[Admin Settings PUT] Token verified, user:', decoded.userId, 'role:', decoded.role);
    } catch (error: any) {
      console.error('[Admin Settings PUT] Token verification failed:', error.message);
      return NextResponse.json(
        { message: 'Token không hợp lệ hoặc đã hết hạn' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (decoded.role !== 'admin') {
      console.error('[Admin Settings PUT] User is not admin');
      return NextResponse.json(
        { message: 'Bạn không có quyền truy cập' },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('[Admin Settings PUT] Request body:', JSON.stringify(body, null, 2));
    
    try {
      const updated = await SiteSettings.update(body);
      console.log('[Admin Settings PUT] Settings updated successfully');
      
      // Format response with all fields
      const response = {
        id: updated.id || 'main',
        logoUrl: updated.logoUrl || '',
        faviconUrl: updated.faviconUrl || '',
        siteName: updated.siteName || 'PlayTogether Hack',
        siteDescription: updated.siteDescription || 'Premium Gaming Tools',
        primaryColor: updated.primaryColor || '#a855f7',
        secondaryColor: updated.secondaryColor || '#ec4899',
        zaloId: updated.zaloId || '0896455341',
        zaloQrUrl: updated.zaloQrUrl || '',
        heroTitle: updated.heroTitle || 'PlayTogether Hack Store',
        heroDescription: updated.heroDescription || 'Công cụ hack game hàng đầu với công nghệ Anti-Ban tiên tiến',
        heroPrimaryButtonText: updated.heroPrimaryButtonText || 'Xem Gói Ngay',
        heroPrimaryButtonLink: updated.heroPrimaryButtonLink || '#packages',
        heroSecondaryButtonText: updated.heroSecondaryButtonText || 'Hỗ Trợ',
        heroSecondaryButtonLink: updated.heroSecondaryButtonLink || '/support',
        faqs: updated.faqs || [],
        metaTitle: updated.metaTitle || 'PlayTogether Hack Store',
        metaDescription: updated.metaDescription || 'Công cụ hack game hàng đầu',
        metaKeywords: updated.metaKeywords || 'hack game, playtogether, gaming tools',
        facebookUrl: updated.facebookUrl || '',
        telegramUrl: updated.telegramUrl || '',
        discordUrl: updated.discordUrl || '',
        youtubeUrl: updated.youtubeUrl || '',
        bannerText: updated.bannerText || '',
        bannerEnabled: updated.bannerEnabled !== undefined ? updated.bannerEnabled : false,
        bannerLink: updated.bannerLink || '',
        updatedAt: updated.updatedAt,
      };
      
      console.log('[Admin Settings PUT] Returning response:', JSON.stringify(response, null, 2));
      return NextResponse.json(response);
    } catch (updateError: any) {
      console.error('[Admin Settings PUT] Update error:', updateError);
      console.error('[Admin Settings PUT] Update error stack:', updateError.stack);
      return NextResponse.json(
        { message: 'Lỗi cập nhật cài đặt', error: updateError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[Admin Settings PUT] Unexpected error:', error);
    console.error('[Admin Settings PUT] Error stack:', error.stack);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
