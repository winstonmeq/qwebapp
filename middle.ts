import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    const isAdminPage = req.nextUrl.pathname.startsWith('/admin');

    // If user is authenticated and tries to access auth pages, redirect to home
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // If user is not authenticated and tries to access protected pages
    if (!isAuthPage && !isAuth) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // Check admin access
    if (isAdminPage && token?.role !== 'system-admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => true, // Let the middleware function handle auth logic
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
