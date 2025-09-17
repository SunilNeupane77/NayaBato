import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes that don't need auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  // Protect official routes
  if (pathname.startsWith('/official')) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token || (token.role !== 'official' && token.role !== 'admin')) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  // Protect authenticated routes
  const protectedPaths = ['/profile', '/citizen', '/issues/report', '/notifications'];
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)',
  ],
};
