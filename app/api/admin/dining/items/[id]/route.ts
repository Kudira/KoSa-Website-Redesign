import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { menuItemInputSchema } from '@/lib/admin/schemas/dining';
import { sanitizeTranslations } from '@/lib/admin/i18n';
import { badRequest, noContent, notFound, ok, serverError, zodError } from '@/lib/admin/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Ctx {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const guard = await requireRole(['OWNER', 'EDITOR']);
  if (guard instanceof NextResponse) return guard;

  const existing = await prisma.menuItem.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('Invalid JSON body');
  }

  const parsed = menuItemInputSchema.partial().safeParse(body);
  if (!parsed.success) return zodError(parsed.error);
  const data = parsed.data;

  try {
    const out: Record<string, unknown> = {};
    if (data.name !== undefined) out.name = data.name;
    if (data.description !== undefined) out.description = data.description;
    if (data.price !== undefined) out.price = data.price;
    if (data.currency !== undefined) out.currency = data.currency.toUpperCase();
    if (data.dietary !== undefined) out.dietary = data.dietary;
    if (data.isFeatured !== undefined) out.isFeatured = data.isFeatured;
    if (data.sortOrder !== undefined) out.sortOrder = data.sortOrder;
    if (data.translations !== undefined) out.translations = sanitizeTranslations(data.translations);
    const item = await prisma.menuItem.update({ where: { id: params.id }, data: out });
    return ok({ item });
  } catch (e) {
    return serverError((e as Error).message);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const guard = await requireRole(['OWNER', 'EDITOR']);
  if (guard instanceof NextResponse) return guard;
  try {
    await prisma.menuItem.delete({ where: { id: params.id } });
    return noContent();
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code === 'P2025') return notFound();
    return serverError(err.message);
  }
}
