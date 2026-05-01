import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect vendor-specific routes.
 * Open Access Update: Login is no longer required for Portal/Dashboard access.
 */
export function middleware(request: NextRequest) {
  // All routes are currently open for the prototype phase.
  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*', '/dashboard/:path*'],
};
