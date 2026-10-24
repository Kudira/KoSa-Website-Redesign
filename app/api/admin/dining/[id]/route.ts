import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { diningVenueInputSchema } from '@/lib/admin/schemas/dining';
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
  const venue = await prisma.diningVenue.findUnique({
    where: { id: params.id },
    include: {
      sections: {
        orderBy: { sortOrder: 'asc' },
        include: { items: { orderBy: { sortOrder: 'asc' } } },
      },
    },
  });
  if (!venue) return notFound();
  return ok({ venue });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const guard = await requireRole(['OWNER', 'EDITOR']);
  if (guard instanceof NextResponse) return guard;

  const existing = await prisma.diningVenue.findUnique({ where: { id: params.id } });
  if (!existing) return notFound();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('Invalid JSON body');
  }

  const parsed = diningVenueInputSchema.partial().safeParse(body);
  if (!parsed.success) return zodError(parsed.error);
  const data = parsed.data;

  try {
    let slug = existing.slug;
    if (data.slug !== undefined || data.name !== undefined) {
      slug = await ensureUniqueSlug(
        data.slug ?? existing.slug,
        data.name ?? existing.name,
        (s) => prisma.diningVenue.findUnique({ where: { slug: s }, select: { id: true } }),
        existing.id,
      );
    }

    const updated = await prisma.diningVenue.update({
      where: { id: params.id },
      data: {
        slug,
        name: data.name ?? existing.name,
        tagline: data.tagline === undefined ? existing.tagline : data.tagline,
        description: data.description === undefined ? existing.description : data.description,
        hours: data.hours === undefined ? existing.hours : data.hours,
        image: data.image === undefined ? existing.image : data.image || null,
        gallery: data.gallery ?? existing.gallery,
        status: data.status ?? existing.status,
        sortOrder: data.sortOrder ?? existing.sortOrder,
        translations:
          data.translations === undefined ? undefined : sanitizeTranslations(data.translations),
      },
    });
    return ok({ venue: updated });
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
    await prisma.diningVenue.delete({ where: { id: params.id } });
    return noContent();
  } catch (e) {
    const err = e as { code?: string; message: string };
    if (err.code === 'P2025') return notFound();
    return serverError(err.message);
  }
}
