import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import { ensureAdmin } from '@/lib/admin';
import { kvHelpers } from '@/lib/kv';
import { KV_PREFIXES } from '@/lib/kv-local';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];

// Imgur API - Anonymous upload (no API key needed for small images)
const IMGUR_UPLOAD_URL = 'https://api.imgur.com/3/image';
// Using a public client ID (this is okay for anonymous uploads)
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID || '546c25a59c58ad7';

// Helper function to upload to Imgur (anonymous)
async function uploadToImgur(fileBuffer: Buffer, fileType: string): Promise<string | null> {
  try {
    const base64 = fileBuffer.toString('base64');
    
    // Imgur accepts base64 directly in form data
    const formData = new URLSearchParams();
    formData.append('image', base64);
    
    const response = await fetch(IMGUR_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Imgur Upload] Failed:', response.status, errorText);
      return null;
    }
    
    const data = await response.json();
    if (data.success && data.data?.link) {
      return data.data.link;
    }
    
    console.error('[Imgur Upload] Invalid response:', data);
    return null;
  } catch (error: any) {
    console.error('[Imgur Upload] Error:', error.message);
    return null;
  }
}

// Helper function to save to KV store as base64
async function saveToKV(fileBuffer: Buffer, filename: string, fileType: string): Promise<string | null> {
  try {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileId = `upload_${timestamp}_${randomStr}`;
    
    const base64 = fileBuffer.toString('base64');
    const uploadKey = `${KV_PREFIXES.UPLOAD || 'upload:'}${fileId}`;
    
    const uploadData = {
      id: fileId,
      filename,
      type: fileType,
      base64,
      createdAt: new Date().toISOString(),
    };
    
    await kvHelpers.set(uploadKey, uploadData);
    
    // Return URL that will be served by API route
    return `/api/public/uploads/${fileId}`;
  } catch (error) {
    console.error('[KV Upload] Error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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
    } catch (error) {
      return NextResponse.json(
        { message: 'Token không hợp lệ hoặc đã hết hạn' },
        { status: 401 }
      );
    }

    // Auto set as admin if not admin
    await ensureAdmin(decoded);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'package-icon';

    if (!file) {
      return NextResponse.json(
        { message: 'Không có file được upload' },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: 'File quá lớn. Tối đa 5MB' },
        { status: 400 }
      );
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: 'File không hợp lệ. Chỉ chấp nhận PNG, JPG, SVG' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.name) || '.png';
    const filename = `${type}_${timestamp}_${randomStr}${ext}`;

    // Check if running on Vercel
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

    let url: string | null = null;
    let uploadMethod = '';

    if (isVercel) {
      // On Vercel: Try multiple methods
      // Method 1: Try Imgur upload (best for Vercel - free, no config needed)
      console.log('[Upload] On Vercel - Trying Imgur upload...');
      url = await uploadToImgur(buffer, file.type);
      if (url) {
        uploadMethod = 'imgur';
        console.log('[Upload] Successfully uploaded to Imgur:', url);
      } else {
        // Method 2: Fallback to KV store (works on Vercel KV)
        console.log('[Upload] Imgur failed, trying KV store...');
        url = await saveToKV(buffer, filename, file.type);
        if (url) {
          uploadMethod = 'kv';
          console.log('[Upload] Successfully saved to KV store:', url);
        } else {
          console.error('[Upload] All Vercel methods failed');
        }
      }
    } else {
      // Local development: Save to file system first
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }

        const filepath = path.join(uploadsDir, filename);
        await writeFile(filepath, buffer);
        url = `/uploads/${filename}`;
        uploadMethod = 'local';
        console.log('[Upload] Successfully saved to local file system:', url);
      } catch (localError: any) {
        console.error('[Upload] Local save failed:', localError);
        
        // Fallback to KV store if local save fails
        console.log('[Upload] Trying KV store fallback...');
        url = await saveToKV(buffer, filename, file.type);
        if (url) {
          uploadMethod = 'kv-fallback';
          console.log('[Upload] Successfully saved to KV store:', url);
        }
      }
    }

    if (!url) {
      return NextResponse.json(
        { 
          message: 'Upload thất bại. Vui lòng thử lại hoặc sử dụng URL ảnh trực tiếp',
          suggestion: 'Bạn có thể upload ảnh lên imgur.com hoặc imgbb.com và paste URL vào đây'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Upload thành công',
      url,
      filename,
      method: uploadMethod,
    });
  } catch (error: any) {
    console.error('[Upload API] Error:', error);
    console.error('[Upload API] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    
    // Provide more specific error messages
    let errorMessage = 'Lỗi upload file';
    if (error.code === 'ENOENT') {
      errorMessage = 'Không tìm thấy thư mục upload. Vui lòng tạo thư mục public/uploads';
    } else if (error.code === 'EACCES') {
      errorMessage = 'Không có quyền ghi file. Vui lòng kiểm tra quyền thư mục';
    } else if (error.message) {
      errorMessage = `Lỗi upload: ${error.message}`;
    }
    
    return NextResponse.json(
      { message: errorMessage, error: error.message },
      { status: 500 }
    );
  }
}
