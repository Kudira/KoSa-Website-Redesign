import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { badRequest, created, ok, serverError, zodError } from '@/lib/admin/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(120),
  tagline: z.string().min(1).max(200),
  category: z.string().min(1).max(60),
  durationLabel: z.string().min(1).max(60),
  priceGhs: z.number().int().min(0),
  originalPriceGhs: z.number().int().min(0).optional().nullable(),
  priceNote: z.string().max(60).default('Solo'),
  couplePriceGhs: z.number().int().min(0).optional().nullable(),
  couplePriceNote: z.string().max(100).optional().nullable(),
  inclusions: z.array(z.string().max(300)).default([]),
  image: z.string().max(600).optional().nullable(),
  gallery: z.array(z.string().max(600)).default([]),
  status: z.enum(['DRAFT','PUBLISHED']).default('PUBLISHED'),
  sortOrder: z.number().int().default(0),
});

export async function GET() {
  const guard = await requireRole(['OWNER','EDITOR','SUPPORT']);
  if (guard instanceof NextResponse) return guard;
  try {
    const packages = await prisma.wellnessPackage.findMany({ orderBy: [{ sortOrder: 'asc' }] });
    return ok({ packages });
  } catch (e) { return serverError((e as Error).message); }
}

export async function POST(req: NextRequest) {
  const guard = await requireRole(['OWNER','EDITOR']);
  if (guard instanceof NextResponse) return guard;
  let body: unknown;
  try { body = await req.json(); } catch { return badRequest('Invalid JSON'); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);
  try {
    const pkg = await prisma.wellnessPackage.create({ data: parsed.data });
    return created({ package: pkg });
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code === 'P2002') return badRequest('Slug already exists');
    return serverError(err.message);
  }
}
