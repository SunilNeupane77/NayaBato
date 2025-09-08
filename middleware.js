import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map();

// Security headers
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com; connect-src 'self' https://api.cloudinary.com; font-src 'self' data:;"
};

// Rate limiting configuration
const rateLimits = {
  '/api/auth/register': { requests: 5, window: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  '/api/auth/signin': { requests: 10, window: 15 * 60 * 1000 }, // 10 requests per 15 minutes
  '/api/auth/forgot-password': { requests: 3, window: 60 * 60 * 1000 }, // 3 requests per hour
  '/api/issues': { requests: 20, window: 60 * 60 * 1000 }, // 20 requests per hour
  '/api/comments': { requests: 30, window: 60 * 60 * 1000 }, // 30 requests per hour
};

function getRateLimitKey(ip, path) {
  return `${ip}:${path}`;
}

function isRateLimited(ip, path) {
  const config = rateLimits[path];
  if (!config) return false;

  const key = getRateLimitKey(ip, path);
  const now = Date.now();
  const windowStart = now - config.window;

  // Get or create rate limit data
  let rateLimitData = rateLimitStore.get(key) || { requests: [], lastCleanup: now };

  // Clean old requests
  rateLimitData.requests = rateLimitData.requests.filter(time => time > windowStart);

  // Check if limit exceeded
  if (rateLimitData.requests.length >= config.requests) {
    return true;
  }

  // Add current request
  rateLimitData.requests.push(now);
  rateLimitStore.set(key, rateLimitData);

  // Cleanup old entries periodically
  if (now - rateLimitData.lastCleanup > 60 * 60 * 1000) { // Every hour
    for (const [key, data] of rateLimitStore.entries()) {
      if (now - data.lastCleanup > config.window * 2) {
        rateLimitStore.delete(key);
      }
    }
    rateLimitData.lastCleanup = now;
  }

  return false;
}

export async function middleware(request) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;
  
  // Add security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Get client IP
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

  // Apply rate limiting to specific endpoints
  for (const [path, config] of Object.entries(rateLimits)) {
    if (pathname.startsWith(path)) {
      if (isRateLimited(ip, path)) {
        return new NextResponse(
          JSON.stringify({ error: 'Too many requests. Please try again later.' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '900', // 15 minutes
              ...securityHeaders
            }
          }
        );
      }
      break;
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || token.role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized access' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              ...securityHeaders
            }
          }
        );
      }
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  // Protect official routes
  if (pathname.startsWith('/official') || pathname.startsWith('/api/official')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || (token.role !== 'official' && token.role !== 'admin')) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized access' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              ...securityHeaders
            }
          }
        );
      }
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  // Protect authenticated routes
  const protectedPaths = ['/profile', '/citizen', '/issues/report'];
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)',
  ],
};
