import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { badRequest, noContent, notFound, ok, serverError, zodError } from '@/lib/admin/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'CLOSED']).optional(),
});

interface Ctx { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const guard = await requireRole(['OWNER', 'EDITOR', 'SUPPORT']);
  if (guard instanceof NextResponse) return guard;
  let body: unknown;
  try { body = await req.json(); } catch { return badRequest('Invalid JSON'); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);
  try {
    const enquiry = await prisma.serviceEnquiry.update({ where: { id: params.id }, data: parsed.data });
    return ok({ enquiry });
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code === 'P2025') return notFound();
    return serverError(err.message);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const guard = await requireRole(['OWNER', 'EDITOR']);
  if (guard instanceof NextResponse) return guard;
  try {
    await prisma.serviceEnquiry.delete({ where: { id: params.id } });
    return noContent();
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code === 'P2025') return notFound();
    return serverError(err.message);
  }
}
