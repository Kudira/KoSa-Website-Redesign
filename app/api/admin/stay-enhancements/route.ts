import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { badRequest, created, ok, serverError, zodError } from '@/lib/admin/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  category: z.string().min(1).max(80),
  name: z.string().min(1).max(160),
  description: z.string().max(400).optional().nullable(),
  priceGhs: z.number().int().min(0),
  priceTo: z.number().int().min(0).optional().nullable(),
  priceNote: z.string().max(100).optional().nullable(),
  image: z.string().max(600).optional().nullable(),
  status: z.enum(['DRAFT','PUBLISHED']).default('PUBLISHED'),
  sortOrder: z.number().int().default(0),
});

export async function GET() {
  const guard = await requireRole(['OWNER','EDITOR','SUPPORT']);
  if (guard instanceof NextResponse) return guard;
  try {
    const enhancements = await prisma.stayEnhancement.findMany({
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
    return ok({ enhancements });
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
    const enhancement = await prisma.stayEnhancement.create({ data: parsed.data });
    return created({ enhancement });
  } catch (e) { return serverError((e as Error).message); }
}
