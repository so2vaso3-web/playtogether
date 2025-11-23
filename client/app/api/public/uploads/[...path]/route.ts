import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { kvHelpers } from '@/lib/kv';
import { KV_PREFIXES } from '@/lib/kv-local';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const fileId = params.path.join('/');
    
    // Security: prevent path traversal
    if (fileId.includes('..')) {
      return NextResponse.json(
        { message: 'Invalid path' },
        { status: 400 }
      );
    }

    // Method 1: Try to get from KV store first
    try {
      // Use type assertion to avoid TypeScript error (UPLOAD exists in KV_PREFIXES but may not be in type definition)
      const uploadPrefix = (KV_PREFIXES as any).UPLOAD || 'upload:';
      const uploadKey = `${uploadPrefix}${fileId}`;
      const uploadData = await kvHelpers.get<any>(uploadKey);

      if (uploadData && uploadData.base64) {
        // Decode base64 to buffer
        const buffer = Buffer.from(uploadData.base64, 'base64');
        
        // Determine content type
        const contentType = uploadData.type || 'image/png';

        return new NextResponse(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    } catch (kvError: any) {
      console.error('[Public Uploads API] KV store read failed:', kvError);
      // Fall through to try local file system
    }

    // Method 2: Fallback to local file system
    const filepath = path.join(process.cwd(), 'public', 'uploads', fileId);

    if (!existsSync(filepath)) {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      );
    }

    const file = await readFile(filepath);
    
    // Determine content type
    const ext = path.extname(fileId).toLowerCase();
    const contentTypeMap: { [key: string]: string } = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.gif': 'image/gif',
    };
    
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('[Public Uploads API] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi đọc file', error: error.message },
      { status: 500 }
    );
  }
}
