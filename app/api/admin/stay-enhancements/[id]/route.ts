import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { badRequest, noContent, notFound, ok, serverError, zodError } from '@/lib/admin/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  category: z.string().min(1).max(80).optional(),
  name: z.string().min(1).max(160).optional(),
  description: z.string().max(400).nullable().optional(),
  priceGhs: z.number().int().min(0).optional(),
  priceTo: z.number().int().min(0).nullable().optional(),
  priceNote: z.string().max(100).nullable().optional(),
  image: z.string().max(600).nullable().optional(),
  status: z.enum(['DRAFT','PUBLISHED']).optional(),
  sortOrder: z.number().int().optional(),
});

interface Ctx { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const guard = await requireRole(['OWNER','EDITOR']);
  if (guard instanceof NextResponse) return guard;
  let body: unknown;
  try { body = await req.json(); } catch { return badRequest('Invalid JSON'); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);
  try {
    const enhancement = await prisma.stayEnhancement.update({ where: { id: params.id }, data: parsed.data });
    return ok({ enhancement });
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code === 'P2025') return notFound();
    return serverError(err.message);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const guard = await requireRole(['OWNER','EDITOR']);
  if (guard instanceof NextResponse) return guard;
  try {
    await prisma.stayEnhancement.delete({ where: { id: params.id } });
    return noContent();
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code === 'P2025') return notFound();
    return serverError(err.message);
  }
}
