import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filename = params.path.join('/');
    
    // Security: prevent path traversal
    if (filename.includes('..') || filename.includes('/')) {
      return NextResponse.json(
        { message: 'Invalid path' },
        { status: 400 }
      );
    }

    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

    if (!existsSync(filepath)) {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      );
    }

    const file = await readFile(filepath);
    
    // Determine content type
    const ext = path.extname(filename).toLowerCase();
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
