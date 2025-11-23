import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { SiteSettings } from '@/lib/kv-models';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const settings = await SiteSettings.getSettings();
    
    // If favicon URL exists, serve it
    if (settings.faviconUrl && settings.faviconUrl.trim()) {
      // If it's a relative URL (starts with /), serve from public folder
      if (settings.faviconUrl.startsWith('/')) {
        try {
          const filePath = join(process.cwd(), 'public', settings.faviconUrl.replace(/^\//, ''));
          const file = await readFile(filePath);
          const ext = settings.faviconUrl.split('.').pop()?.toLowerCase();
          const contentType = ext === 'svg' ? 'image/svg+xml' : 
                              ext === 'png' ? 'image/png' : 
                              ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 
                              'image/png';
          
          return new NextResponse(file, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        } catch (error) {
          // If file not found, try to fetch from URL
          try {
            const baseUrl = request.nextUrl.origin;
            const fullUrl = settings.faviconUrl.startsWith('http') 
              ? settings.faviconUrl 
              : new URL(settings.faviconUrl, baseUrl).toString();
            const response = await fetch(fullUrl);
            if (response.ok) {
              const buffer = await response.arrayBuffer();
              return new NextResponse(buffer, {
                headers: {
                  'Content-Type': response.headers.get('content-type') || 'image/png',
                  'Cache-Control': 'public, max-age=31536000, immutable',
                },
              });
            }
          } catch (fetchError) {
            // Fall through to default
          }
        }
      } else {
        // External URL - fetch and return
        try {
          const response = await fetch(settings.faviconUrl);
          if (response.ok) {
            const buffer = await response.arrayBuffer();
            return new NextResponse(buffer, {
              headers: {
                'Content-Type': response.headers.get('content-type') || 'image/png',
                'Cache-Control': 'public, max-age=31536000, immutable',
              },
            });
          }
        } catch (error) {
          // Fall through to default
        }
      }
    }
    
    // Default: serve icon.tsx generated favicon
    return NextResponse.redirect(new URL('/icon', request.url));
  } catch (error) {
    // On error, redirect to default icon
    return NextResponse.redirect(new URL('/icon', request.url));
  }
}
