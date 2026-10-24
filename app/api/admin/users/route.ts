// Admin user management OWNER only. Editors cannot manage staff.

import { NextResponse, type NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { adminUserCreateSchema } from '@/lib/admin/schemas/adminUser';
import { badRequest, conflict, ok, serverError, zodError } from '@/lib/admin/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await requireRole(['OWNER']);
  if (guard instanceof NextResponse) return guard;

  const users = await prisma.adminUser.findMany({
    orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      lastSeen: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return ok({ users });
}

export async function POST(req: NextRequest) {
  const guard = await requireRole(['OWNER']);
  if (guard instanceof NextResponse) return guard;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('Invalid JSON body');
  }
  const parsed = adminUserCreateSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);
  const { email, name, password, role } = parsed.data;

  try {
    const created = await prisma.adminUser.create({
      data: {
        email,
        name: name ?? null,
        password: await bcrypt.hash(password, 12),
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });
    return ok({ user: created }, 201);
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code === 'P2002') return conflict('Email already in use');
    return serverError(err.message);
  }
}
