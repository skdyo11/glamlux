import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect vendor-specific routes.
 * Customers have low-friction access to the marketplace (Shop, Deals, Cart).
 * Only the Portal/Dashboard requires authentication.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes for vendors/partners
  const isProtectedRoute = pathname.startsWith('/portal') || pathname.startsWith('/dashboard');

  // We check for the firebase session cookie or a custom auth token.
  // Note: Standard Firebase Client Auth doesn't automatically send cookies to Middleware.
  // For a pure client-side auth flow with middleware, we check for the existence of a 
  // 'session' cookie that we can set upon login.
  const authSession = request.cookies.get('__session')?.value;

  if (isProtectedRoute && !authSession) {
    // Redirect to login if trying to access vendor areas without a session
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*', '/dashboard/:path*'],
};
