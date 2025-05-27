import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession();

  const { data: { session } } = await supabase.auth.getSession();
  // Only redirect from auth page if user is logged in
  if (session && request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

// Specify which routes the middleware should run on
// Exclude root path ('/') and public assets from middleware
export const config = {
  matcher: ['/auth/:path*'],
};
