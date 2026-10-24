// Deployment target. Lets the same codebase be hosted as two independent
// services (see DEPLOYMENT.md):
//
//   APP_TARGET=site   → public marketing site only (admin paths 404/redirect)
//   APP_TARGET=admin  → admin dashboard only (public paths redirect to site)
//   APP_TARGET=all    → everything in one deployment (default; local dev)
//
// Routing is enforced in middleware.ts. Optional ADMIN_URL / SITE_URL env vars
// let one host redirect cross-surface requests to the other.

export type AppTarget = 'site' | 'admin' | 'all';

export function getAppTarget(): AppTarget {
  const v = (process.env.APP_TARGET || 'all').toLowerCase();
  if (v === 'site' || v === 'admin') return v;
  return 'all';
}

export function isAdminPath(pathname: string): boolean {
  return (
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/api/admin')
  );
}
