import { prisma } from '@/lib/prisma';
import { testimonialInputSchema } from '@/lib/admin/schemas/testimonial';
import { sanitizeTranslations } from '@/lib/admin/i18n';
import { makeCollectionRoute } from '@/lib/admin/crud';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const { GET, POST } = makeCollectionRoute({
  schema: testimonialInputSchema,
  delegate: prisma.testimonial as unknown as Parameters<typeof makeCollectionRoute>[0]['delegate'],
  collectionKey: 'testimonials',
  itemKey: 'testimonial',
  orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  search: (q) => ({
    OR: [
      { guestName: { contains: q, mode: 'insensitive' } },
      { country: { contains: q, mode: 'insensitive' } },
      { source: { contains: q, mode: 'insensitive' } },
    ],
  }),
  toCreate: async (data) => ({
    guestName: data.guestName,
    country: data.country,
    rating: data.rating,
    quote: data.quote,
    avatarUrl: data.avatarUrl || null,
    source: data.source,
    status: data.status,
    sortOrder: data.sortOrder,
    translations: sanitizeTranslations(data.translations),
  }),
  toUpdate: async () => ({}),
});

export { GET, POST };
