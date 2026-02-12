import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function proxy(req) { // Renamed from middleware to proxy for consistency
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    const isAdminPage = req.nextUrl.pathname.startsWith('/admin');

    // 1. Redirect authenticated users away from /auth pages
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // 2. Redirect unauthenticated users to signin
    if (!isAuthPage && !isAuth) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // 3. Role-based access control for Admin routes
    if (isAdminPage && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Manual logic handling in the function above
    },
  }
);

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/report',
    '/auth/:path*',
  ],
};