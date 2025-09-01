import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;

    // Admin route protection
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (!token || !['admin', 'official'].includes(token.role)) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
      
      // Admin-only routes
      const adminOnlyRoutes = ['/admin/users', '/admin/sessions', '/admin/activities', '/admin/analytics'];
      if (adminOnlyRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
        if (token.role !== 'admin') {
          return NextResponse.redirect(new URL('/admin/dashboard', req.url));
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public routes
        if (!req.nextUrl.pathname.startsWith('/admin')) {
          return true;
        }
        // Require authentication for admin routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*', '/issues/create']
};
