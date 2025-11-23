// Auth helper functions

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('[Auth] No token found in localStorage');
      return null;
    }
    
    // Validate token format (should be a JWT string)
    if (typeof token !== 'string' || token.trim().length === 0) {
      console.warn('[Auth] Invalid token format');
      localStorage.removeItem('token');
      return null;
    }
    
    return token.trim();
  } catch (error) {
    console.error('[Auth] Error getting token:', error);
    return null;
  }
}

export function getAuthHeaders(): { Authorization: string } | {} {
  const token = getToken();
  if (!token) {
    return {};
  }
  
  // Ensure Bearer prefix
  const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  return { Authorization: bearerToken };
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('[Auth] Cleared auth data');
  } catch (error) {
    console.error('[Auth] Error clearing auth:', error);
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true; // Invalid format
    }
    
    // Decode payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration
    if (payload.exp) {
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      return currentTime >= expirationTime;
    }
    
    return false; // No expiration set
  } catch (error) {
    console.error('[Auth] Error checking token expiration:', error);
    return true; // Assume expired if we can't check
  }
}

export function validateToken(): boolean {
  const token = getToken();
  if (!token) {
    return false;
  }
  
  if (isTokenExpired(token)) {
    console.warn('[Auth] Token is expired');
    clearAuth();
    return false;
  }
  
  return true;
}

// Server-side: Get authenticated user from request
export async function getAuthUser(req: Request): Promise<{ id: string; role?: string; username?: string } | null> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return null;
    }
    
    // Decode JWT token (without verification for now - should verify with JWT_SECRET in production)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    
    return {
      id: payload.userId || payload.id || payload._id,
      role: payload.role,
      username: payload.username || payload.phone,
    };
  } catch (error) {
    console.error('[Auth] Error getting auth user:', error);
    return null;
  }
}
