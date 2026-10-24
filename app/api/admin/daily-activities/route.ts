import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { badRequest, created, ok, serverError, zodError } from '@/lib/admin/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  day: z.enum(['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']),
  time: z.string().min(1).max(20),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  tag: z.string().max(120).optional().nullable(),
  image: z.string().max(600).optional().nullable(),
  isFree: z.boolean().default(true),
  status: z.enum(['DRAFT','PUBLISHED']).default('PUBLISHED'),
  sortOrder: z.number().int().default(0),
});

export async function GET(req: NextRequest) {
  const guard = await requireRole(['OWNER','EDITOR','SUPPORT']);
  if (guard instanceof NextResponse) return guard;
  try {
    const url = new URL(req.url);
    const day = url.searchParams.get('day');
    const activities = await prisma.dailyActivity.findMany({
      where: day ? { day: day as never } : undefined,
      orderBy: [{ day: 'asc' }, { sortOrder: 'asc' }],
    });
    return ok({ activities });
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
    const activity = await prisma.dailyActivity.create({ data: parsed.data });
    return created({ activity });
  } catch (e) { return serverError((e as Error).message); }
}
