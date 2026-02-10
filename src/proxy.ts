import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ---------------------------------------------------------------------------
  // Admin route protection (cookie-existence check only — full validation
  // happens in API routes via the in-memory session Map)
  // ---------------------------------------------------------------------------

  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin') && pathname !== '/api/admin/auth';

  const sessionCookie = request.cookies.get('admin_session')?.value;

  if (isAdminPage && !sessionCookie) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isAdminApi && !sessionCookie) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ---------------------------------------------------------------------------
  // Standard security headers
  // ---------------------------------------------------------------------------

  const response = NextResponse.next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // CORS protection for API routes
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return Response.json(
            { error: 'Forbidden' },
            { status: 403 }
          );
        }
      } catch {
        return Response.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
