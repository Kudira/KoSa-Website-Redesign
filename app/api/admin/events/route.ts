import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { badRequest, created, ok, serverError, zodError } from '@/lib/admin/response';
import { EVENT_CATEGORIES } from '@/lib/cms/events';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(120),
  category: z.enum(EVENT_CATEGORIES),
  description: z.string().min(1).max(2000),
  image: z.string().max(600).optional().nullable(),
  transportIncluded: z.boolean().default(false),
  priceNote: z.string().max(120).optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('PUBLISHED'),
  sortOrder: z.number().int().default(0),
});

export async function GET() {
  const guard = await requireRole(['OWNER', 'EDITOR', 'SUPPORT']);
  if (guard instanceof NextResponse) return guard;
  try {
    const events = await prisma.event.findMany({ orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] });
    return ok({ events });
  } catch (e) { return serverError((e as Error).message); }
}

export async function POST(req: NextRequest) {
  const guard = await requireRole(['OWNER', 'EDITOR']);
  if (guard instanceof NextResponse) return guard;
  let body: unknown;
  try { body = await req.json(); } catch { return badRequest('Invalid JSON'); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);
  try {
    const event = await prisma.event.create({ data: parsed.data });
    return created({ event });
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code === 'P2002') return badRequest('Slug already exists');
    return serverError(err.message);
  }
}
