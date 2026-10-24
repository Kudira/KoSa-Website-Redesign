// Dining venues. Sections + items live under nested routes.

import { prisma } from '@/lib/prisma';
import { diningVenueInputSchema } from '@/lib/admin/schemas/dining';
import { sanitizeTranslations } from '@/lib/admin/i18n';
import { ensureUniqueSlug } from '@/lib/admin/slug';
import { makeCollectionRoute } from '@/lib/admin/crud';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const { GET, POST } = makeCollectionRoute({
  schema: diningVenueInputSchema,
  delegate: prisma.diningVenue as unknown as Parameters<typeof makeCollectionRoute>[0]['delegate'],
  collectionKey: 'venues',
  itemKey: 'venue',
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
      (s) => prisma.diningVenue.findUnique({ where: { slug: s }, select: { id: true } }),
    );
    return {
      slug,
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      hours: data.hours,
      image: data.image || null,
      gallery: data.gallery,
      status: data.status,
      sortOrder: data.sortOrder,
      translations: sanitizeTranslations(data.translations),
    };
  },
  toUpdate: async () => ({}),
});

export { GET, POST };
