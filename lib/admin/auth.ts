// Server-side admin auth helpers.
//
// `requireRole()` is the workhorse: it asserts the request is authenticated,
// the user holds at least one of the allowed roles, and returns the session.
// On failure it returns a NextResponse the caller should immediately `return`.

import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export type AdminRole = 'OWNER' | 'EDITOR' | 'SUPPORT';

export interface AdminSessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: AdminRole;
}

/**
 * Fetch the current admin session (if any). Pure helper does not redirect.
 */
export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  return session?.user ? (session.user as AdminSessionUser) : null;
}

/**
 * Guard route handlers. Returns `{ user }` on success, or a NextResponse error
 * the caller must `return` directly.
 *
 *   const guard = await requireRole(['OWNER', 'EDITOR']);
 *   if (guard instanceof NextResponse) return guard;
 *   const { user } = guard;
 */
export async function requireRole(allowed: AdminRole[] = ['OWNER', 'EDITOR']) {
  const user = await getAdminSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!allowed.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return { user };
}

/** Convenience: any logged-in admin (read-only roles included). */
export async function requireAnyAdmin() {
  return requireRole(['OWNER', 'EDITOR', 'SUPPORT']);
}
