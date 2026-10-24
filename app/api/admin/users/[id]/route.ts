import { NextResponse, type NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { adminUserUpdateSchema } from '@/lib/admin/schemas/adminUser';
import { badRequest, noContent, notFound, ok, serverError, zodError } from '@/lib/admin/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Ctx {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const guard = await requireRole(['OWNER']);
  if (guard instanceof NextResponse) return guard;

  const existing = await prisma.adminUser.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('Invalid JSON body');
  }
  const parsed = adminUserUpdateSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);
  const data = parsed.data;

  // Prevent owner from demoting themselves and locking the org out.
  if (
    existing.id === guard.user.id &&
    ((data.role && data.role !== 'OWNER') || data.active === false)
  ) {
    return badRequest('You cannot demote or deactivate your own OWNER account');
  }

  try {
    const out: Record<string, unknown> = {};
    if (data.name !== undefined) out.name = data.name;
    if (data.role !== undefined) out.role = data.role;
    if (data.active !== undefined) out.active = data.active;
    if (data.password) out.password = await bcrypt.hash(data.password, 12);

    const updated = await prisma.adminUser.update({
      where: { id: params.id },
      data: out,
      select: { id: true, email: true, name: true, role: true, active: true, updatedAt: true },
    });
    return ok({ user: updated });
  } catch (e) {
    return serverError((e as Error).message);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const guard = await requireRole(['OWNER']);
  if (guard instanceof NextResponse) return guard;

  if (params.id === guard.user.id) return badRequest('You cannot delete your own account');

  try {
    // Ensure we don't drop the last OWNER.
    const target = await prisma.adminUser.findUnique({ where: { id: params.id } });
    if (!target) return notFound();
    if (target.role === 'OWNER') {
      const owners = await prisma.adminUser.count({ where: { role: 'OWNER' } });
      if (owners <= 1) return badRequest('Cannot delete the last OWNER');
    }
    await prisma.adminUser.delete({ where: { id: params.id } });
    return noContent();
  } catch (e) {
    return serverError((e as Error).message);
  }
}
