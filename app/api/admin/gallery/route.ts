import { prisma } from '@/lib/prisma';
import { galleryItemInputSchema } from '@/lib/admin/schemas/gallery';
import { sanitizeTranslations } from '@/lib/admin/i18n';
import { makeCollectionRoute } from '@/lib/admin/crud';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const { GET, POST } = makeCollectionRoute({
  schema: galleryItemInputSchema,
  delegate: prisma.galleryItem as unknown as Parameters<typeof makeCollectionRoute>[0]['delegate'],
  collectionKey: 'items',
  itemKey: 'item',
  orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  search: (q) => ({
    OR: [
      { caption: { contains: q, mode: 'insensitive' } },
      { alt: { contains: q, mode: 'insensitive' } },
      { category: { contains: q, mode: 'insensitive' } },
    ],
  }),
  toCreate: async (data) => ({
    imageUrl: data.imageUrl,
    caption: data.caption,
    alt: data.alt,
    category: data.category,
    width: data.width,
    height: data.height,
    status: data.status,
    sortOrder: data.sortOrder,
    translations: sanitizeTranslations(data.translations),
  }),
  toUpdate: async () => ({}),
});

export { GET, POST };
