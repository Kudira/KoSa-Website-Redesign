import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getAppTarget, isAdminPath } from '@/lib/runtime';

// Single middleware that does two jobs:
//   1. Deployment-target gating - lets the public site and the admin dashboard
//      be hosted as separate services from one codebase (see DEPLOYMENT.md).
//   2. Admin auth - protects /admin/* (except /admin/login).

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const target = getAppTarget();
  const admin = isAdminPath(pathname);

  // ── 1. Target gating ──────────────────────────────────────────────────
  if (target === 'site' && admin) {
    // Public-only deployment must not serve admin. Bounce to the admin host
    // if configured, else 404.
    const adminUrl = process.env.ADMIN_URL;
    if (adminUrl) {
      return NextResponse.redirect(new URL(pathname + req.nextUrl.search, adminUrl));
    }
    return new NextResponse('Not found', { status: 404 });
  }

  if (target === 'admin' && !admin && !pathname.startsWith('/api/')) {
    // Admin-only deployment. The root should land on the dashboard; everything
    // else public goes to the marketing host if configured.
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    const siteUrl = process.env.SITE_URL;
    if (siteUrl) {
      return NextResponse.redirect(new URL(pathname + req.nextUrl.search, siteUrl));
    }
  }

  // ── 2. Admin auth ─────────────────────────────────────────────────────
  const isProtectedAdmin =
    (pathname === '/admin' || pathname.startsWith('/admin/')) && pathname !== '/admin/login';

  if (isProtectedAdmin) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = new URL('/admin/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png|og/|icons/|robots.txt|sitemap.xml|manifest.webmanifest).*)',
  ],
};
