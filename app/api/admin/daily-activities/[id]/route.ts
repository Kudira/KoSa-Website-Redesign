import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { badRequest, noContent, notFound, ok, serverError, zodError } from '@/lib/admin/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  day: z.enum(['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']).optional(),
  time: z.string().min(1).max(20).optional(),
  title: z.string().min(1).max(120).optional(),
  description: z.string().min(1).max(2000).optional(),
  tag: z.string().max(120).nullable().optional(),
  image: z.string().max(600).nullable().optional(),
  isFree: z.boolean().optional(),
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
    const activity = await prisma.dailyActivity.update({ where: { id: params.id }, data: parsed.data });
    return ok({ activity });
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
    await prisma.dailyActivity.delete({ where: { id: params.id } });
    return noContent();
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code === 'P2025') return notFound();
    return serverError(err.message);
  }
}
