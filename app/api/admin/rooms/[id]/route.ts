// GET    /api/admin/rooms/[id] fetch single
// PATCH  /api/admin/rooms/[id] update
// DELETE /api/admin/rooms/[id] destroy

import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { roomInputSchema } from '@/lib/admin/schemas/room';
import { sanitizeTranslations } from '@/lib/admin/i18n';
import { ensureUniqueSlug } from '@/lib/admin/slug';
import {
  badRequest,
  conflict,
  noContent,
  notFound,
  ok,
  serverError,
  zodError,
} from '@/lib/admin/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Ctx {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const guard = await requireRole(['OWNER', 'EDITOR', 'SUPPORT']);
  if (guard instanceof NextResponse) return guard;

  const room = await prisma.room.findUnique({ where: { id: params.id } });
  if (!room) return notFound();
  return ok({ room });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const guard = await requireRole(['OWNER', 'EDITOR']);
  if (guard instanceof NextResponse) return guard;

  const existing = await prisma.room.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('Invalid JSON body');
  }

  const parsed = roomInputSchema.partial().safeParse(body);
  if (!parsed.success) return zodError(parsed.error);
  const data = parsed.data;

  try {
    let slug = existing.slug;
    if (data.slug !== undefined || data.name !== undefined) {
      slug = await ensureUniqueSlug(
        data.slug ?? existing.slug,
        data.name ?? existing.name,
        (s) => prisma.room.findUnique({ where: { slug: s }, select: { id: true } }),
        existing.id,
      );
    }

    const updated = await prisma.room.update({
      where: { id: params.id },
      data: {
        slug,
        name: data.name ?? existing.name,
        tagline: data.tagline === undefined ? existing.tagline : data.tagline,
        category: data.category ?? existing.category,
        description: data.description === undefined ? existing.description : data.description,
        price: data.price ?? Number(existing.price),
        currency: (data.currency ?? existing.currency).toUpperCase(),
        maxGuests: data.maxGuests ?? existing.maxGuests,
        bedConfig: data.bedConfig === undefined ? existing.bedConfig : data.bedConfig,
        sizeSqm: data.sizeSqm === undefined ? existing.sizeSqm : data.sizeSqm,
        image: data.image === undefined ? existing.image : data.image || null,
        gallery: data.gallery ?? existing.gallery,
        amenities: data.amenities ?? existing.amenities,
        features: data.features ?? existing.features,
        cloudbedsRoomTypeId:
          data.cloudbedsRoomTypeId === undefined
            ? existing.cloudbedsRoomTypeId
            : data.cloudbedsRoomTypeId,
        available: data.available ?? existing.available,
        status: data.status ?? existing.status,
        sortOrder: data.sortOrder ?? existing.sortOrder,
        translations:
          data.translations === undefined ? undefined : sanitizeTranslations(data.translations),
      },
    });
    return ok({ room: updated });
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code === 'P2002') return conflict('Slug already exists');
    return serverError(err.message);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const guard = await requireRole(['OWNER', 'EDITOR']);
  if (guard instanceof NextResponse) return guard;

  try {
    await prisma.room.delete({ where: { id: params.id } });
    return noContent();
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code === 'P2025') return notFound();
    return serverError(err.message);
  }
}
