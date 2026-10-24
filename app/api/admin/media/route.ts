// GET /api/admin/media paginated listing of uploaded assets.

import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { ok, serverError } from '@/lib/admin/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = await requireRole(['OWNER', 'EDITOR']);
  if (guard instanceof NextResponse) return guard;

  const url = new URL(req.url);
  const folder = url.searchParams.get('folder')?.trim() || undefined;
  const q = url.searchParams.get('q')?.trim().toLowerCase();
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '60', 10) || 60, 1), 200);
  const cursor = url.searchParams.get('cursor') || undefined;

  try {
    const where: Record<string, unknown> = {};
    if (folder) where.folder = folder;
    if (q) {
      where.OR = [
        { filename: { contains: q, mode: 'insensitive' } },
        { alt: { contains: q, mode: 'insensitive' } },
      ];
    }

    const items = await prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const nextCursor = items.length > limit ? items[limit - 1].id : null;
    return ok({ items: items.slice(0, limit), nextCursor });
  } catch (e) {
    return serverError((e as Error).message);
  }
}
