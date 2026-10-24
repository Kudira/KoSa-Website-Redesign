// GET    /api/admin/rooms      list rooms (admin)
// POST   /api/admin/rooms      create room

import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { roomInputSchema } from '@/lib/admin/schemas/room';
import { sanitizeTranslations } from '@/lib/admin/i18n';
import { ensureUniqueSlug } from '@/lib/admin/slug';
import { badRequest, conflict, created, ok, serverError, zodError } from '@/lib/admin/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = await requireRole(['OWNER', 'EDITOR', 'SUPPORT']);
  if (guard instanceof NextResponse) return guard;

  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim().toLowerCase();

  try {
    const rooms = await prisma.room.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { slug: { contains: q, mode: 'insensitive' } },
              { tagline: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return ok({ rooms });
  } catch (e) {
    return serverError((e as Error).message);
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireRole(['OWNER', 'EDITOR']);
  if (guard instanceof NextResponse) return guard;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('Invalid JSON body');
  }

  const parsed = roomInputSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const data = parsed.data;

  try {
    const slug = await ensureUniqueSlug(
      data.slug,
      data.name,
      (s) => prisma.room.findUnique({ where: { slug: s }, select: { id: true } }),
    );

    const created = await prisma.room.create({
      data: {
        slug,
        name: data.name,
        tagline: data.tagline,
        category: data.category,
        description: data.description,
        price: data.price,
        currency: data.currency.toUpperCase(),
        maxGuests: data.maxGuests,
        bedConfig: data.bedConfig,
        sizeSqm: data.sizeSqm,
        image: data.image || null,
        gallery: data.gallery,
        amenities: data.amenities,
        features: data.features,
        cloudbedsRoomTypeId: data.cloudbedsRoomTypeId,
        available: data.available,
        status: data.status,
        sortOrder: data.sortOrder,
        translations: sanitizeTranslations(data.translations),
      },
    });
    return ok({ room: created }, 201);
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code === 'P2002') return conflict('Slug already exists');
    return serverError(err.message);
  }
}
