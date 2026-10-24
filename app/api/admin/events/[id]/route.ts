import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { badRequest, noContent, notFound, ok, serverError, zodError } from '@/lib/admin/response';
import { EVENT_CATEGORIES } from '@/lib/cms/events';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/).optional(),
  title: z.string().min(1).max(120).optional(),
  category: z.enum(EVENT_CATEGORIES).optional(),
  description: z.string().min(1).max(2000).optional(),
  image: z.string().max(600).nullable().optional(),
  transportIncluded: z.boolean().optional(),
  priceNote: z.string().max(120).nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  sortOrder: z.number().int().optional(),
});

interface Ctx { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const guard = await requireRole(['OWNER', 'EDITOR']);
  if (guard instanceof NextResponse) return guard;
  let body: unknown;
  try { body = await req.json(); } catch { return badRequest('Invalid JSON'); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);
  try {
    const event = await prisma.event.update({ where: { id: params.id }, data: parsed.data });
    return ok({ event });
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code === 'P2025') return notFound();
    if (err.code === 'P2002') return badRequest('Slug already exists');
    return serverError(err.message);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const guard = await requireRole(['OWNER', 'EDITOR']);
  if (guard instanceof NextResponse) return guard;
  try {
    await prisma.event.delete({ where: { id: params.id } });
    return noContent();
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code === 'P2025') return notFound();
    return serverError(err.message);
  }
}
