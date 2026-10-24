import { prisma } from '@/lib/prisma';
import { treatmentInputSchema } from '@/lib/admin/schemas/treatment';
import { sanitizeTranslations } from '@/lib/admin/i18n';
import { ensureUniqueSlug } from '@/lib/admin/slug';
import { makeCollectionRoute } from '@/lib/admin/crud';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const { GET, POST } = makeCollectionRoute({
  schema: treatmentInputSchema,
  delegate: prisma.treatment as unknown as Parameters<typeof makeCollectionRoute>[0]['delegate'],
  collectionKey: 'treatments',
  itemKey: 'treatment',
  orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  search: (q) => ({
    OR: [
      { name: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
    ],
  }),
  toCreate: async (data) => {
    const slug = await ensureUniqueSlug(
      data.slug,
      data.name,
      (s) => prisma.treatment.findUnique({ where: { slug: s }, select: { id: true } }),
    );
    return {
      slug,
      name: data.name,
      description: data.description,
      durationMin: data.durationMin,
      price: data.price,
      currency: (data.currency || 'GHS').toUpperCase(),
      image: data.image || null,
      category: data.category,
      status: data.status,
      sortOrder: data.sortOrder,
      translations: sanitizeTranslations(data.translations),
    };
  },
  toUpdate: async (data, existing) => {
    const e = existing as { id: string; slug: string; name: string };
    let slug = e.slug;
    if (data.slug !== undefined || data.name !== undefined) {
      slug = await ensureUniqueSlug(
        data.slug ?? e.slug,
        data.name ?? e.name,
        (s) => prisma.treatment.findUnique({ where: { slug: s }, select: { id: true } }),
        e.id,
      );
    }
    const out: Record<string, unknown> = { slug };
    if (data.name !== undefined) out.name = data.name;
    if (data.description !== undefined) out.description = data.description;
    if (data.durationMin !== undefined) out.durationMin = data.durationMin;
    if (data.price !== undefined) out.price = data.price;
    if (data.currency !== undefined) out.currency = data.currency.toUpperCase();
    if (data.image !== undefined) out.image = data.image || null;
    if (data.category !== undefined) out.category = data.category;
    if (data.status !== undefined) out.status = data.status;
    if (data.sortOrder !== undefined) out.sortOrder = data.sortOrder;
    if (data.translations !== undefined) out.translations = sanitizeTranslations(data.translations);
    return out;
  },
});

export { GET, POST };
