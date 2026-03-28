import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const baseDomain = 'klas.ng';

  const forwardedHost = req.headers.get('x-forwarded-host') || '';
  const host          = req.headers.get('host') || '';
  const hostname      = (forwardedHost || host).replace(/:\d+$/, '').split(',')[0]!.trim();

  if (
    hostname.endsWith(`.${baseDomain}`) &&
    hostname !== `www.${baseDomain}`
  ) {
    const subdomain = hostname.slice(0, hostname.length - baseDomain.length - 1);

    if (!subdomain || ['www', 'api', 'mail', 'ftp', 'smtp', 'admin'].includes(subdomain)) {
      return NextResponse.next();
    }

    const pathname = req.nextUrl.pathname;

    // These pages should work normally on subdomains — don't rewrite them
    const passthroughPaths = [
      '/school-login', '/teacher-login', '/parent', '/register',
      '/forgot-password', '/reset-password', '/api', '/s/',
    ];

    if (passthroughPaths.some(p => pathname.startsWith(p))) {
      return NextResponse.next();
    }

    // Only rewrite the root path to the school profile
    if (pathname === '/' || pathname === '') {
      const url = req.nextUrl.clone();
      url.pathname = `/s/${subdomain}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};