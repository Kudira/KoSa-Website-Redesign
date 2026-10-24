// DELETE /api/admin/media/[id] remove an asset (Storage + DB row).
// PATCH  /api/admin/media/[id] update metadata (alt, folder).

import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { badRequest, noContent, notFound, ok, serverError } from '@/lib/admin/response';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Ctx {
  params: { id: string };
}

const patchSchema = z.object({
  alt: z.string().trim().max(280).optional().nullable(),
  folder: z.string().trim().max(120).optional().nullable(),
  filename: z.string().trim().max(160).optional(),
});

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const guard = await requireRole(['OWNER', 'EDITOR']);
  if (guard instanceof NextResponse) return guard;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('Invalid JSON body');
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return badRequest('Validation failed', parsed.error.flatten());

  try {
    const asset = await prisma.mediaAsset.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return ok({ asset });
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code === 'P2025') return notFound();
    return serverError(err.message);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const guard = await requireRole(['OWNER', 'EDITOR']);
  if (guard instanceof NextResponse) return guard;

  const asset = await prisma.mediaAsset.findUnique({ where: { id: params.id } });
  if (!asset) return notFound();

  // Best-effort storage removal we still drop the DB row if the bucket call fails.
  const client = getSupabaseAdmin();
  if (client) {
    try {
      await client.storage.from(asset.bucket).remove([asset.path]);
    } catch {
      /* ignore */
    }
  }

  await prisma.mediaAsset.delete({ where: { id: params.id } });
  return noContent();
}
