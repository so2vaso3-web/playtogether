import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    const path = params.path.join('/');
    const url = new URL(request.url);
    const queryString = url.search;
    
    const targetUrl = `${API_BASE_URL}/api/${path}${queryString}`;
    
    console.log(`[API Proxy] ${method} ${targetUrl}`);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    // Add body for POST, PUT requests
    if (method === 'POST' || method === 'PUT') {
      try {
        const body = await request.json();
        options.body = JSON.stringify(body);
      } catch {
        // If body is not JSON, try to get as text or form data
        const contentType = request.headers.get('content-type');
        if (contentType?.includes('multipart/form-data')) {
          // For file uploads, forward as is
          const formData = await request.formData();
          options.body = formData;
          // Remove Content-Type to let fetch set it with boundary
          delete headers['Content-Type'];
        } else {
          const text = await request.text();
          if (text) {
            options.body = text;
            if (contentType) {
              headers['Content-Type'] = contentType;
            }
          }
        }
      }
    }

    const response = await fetch(targetUrl, options);
    
    if (!response.ok) {
      console.error(`[API Proxy] Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json().catch(async () => {
      const text = await response.text();
      return text ? { error: text } : { error: 'Unknown error' };
    });
    
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('[API Proxy] Error:', error);
    return NextResponse.json(
      { message: 'Lỗi kết nối server', error: error.message },
      { status: 500 }
    );
  }
}
