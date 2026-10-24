import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { badRequest, noContent, notFound, ok, serverError, zodError } from '@/lib/admin/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/).optional(),
  name: z.string().min(1).max(120).optional(),
  tagline: z.string().min(1).max(200).optional(),
  category: z.string().min(1).max(60).optional(),
  durationLabel: z.string().min(1).max(60).optional(),
  priceGhs: z.number().int().min(0).optional(),
  originalPriceGhs: z.number().int().min(0).nullable().optional(),
  priceNote: z.string().max(60).optional(),
  couplePriceGhs: z.number().int().min(0).nullable().optional(),
  couplePriceNote: z.string().max(100).nullable().optional(),
  inclusions: z.array(z.string().max(300)).optional(),
  image: z.string().max(600).nullable().optional(),
  gallery: z.array(z.string().max(600)).optional(),
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
    const pkg = await prisma.wellnessPackage.update({ where: { id: params.id }, data: parsed.data });
    return ok({ package: pkg });
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code === 'P2025') return notFound();
    if (err.code === 'P2002') return badRequest('Slug already exists');
    return serverError(err.message);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const guard = await requireRole(['OWNER','EDITOR']);
  if (guard instanceof NextResponse) return guard;
  try {
    await prisma.wellnessPackage.delete({ where: { id: params.id } });
    return noContent();
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code === 'P2025') return notFound();
    return serverError(err.message);
  }
}
