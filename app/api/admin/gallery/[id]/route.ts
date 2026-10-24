import { prisma } from '@/lib/prisma';
import { galleryItemInputSchema } from '@/lib/admin/schemas/gallery';
import { sanitizeTranslations } from '@/lib/admin/i18n';
import { makeItemRoute } from '@/lib/admin/crud';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const { GET, PATCH, DELETE } = makeItemRoute({
  schema: galleryItemInputSchema,
  delegate: prisma.galleryItem as unknown as Parameters<typeof makeItemRoute>[0]['delegate'],
  collectionKey: 'items',
  itemKey: 'item',
  toCreate: async () => ({}),
  toUpdate: async (data) => {
    const out: Record<string, unknown> = {};
    if (data.imageUrl !== undefined) out.imageUrl = data.imageUrl;
    if (data.caption !== undefined) out.caption = data.caption;
    if (data.alt !== undefined) out.alt = data.alt;
    if (data.category !== undefined) out.category = data.category;
    if (data.width !== undefined) out.width = data.width;
    if (data.height !== undefined) out.height = data.height;
    if (data.status !== undefined) out.status = data.status;
    if (data.sortOrder !== undefined) out.sortOrder = data.sortOrder;
    if (data.translations !== undefined) out.translations = sanitizeTranslations(data.translations);
    return out;
  },
});

export { GET, PATCH, DELETE };
