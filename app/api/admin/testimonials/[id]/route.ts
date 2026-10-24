import { prisma } from '@/lib/prisma';
import { testimonialInputSchema } from '@/lib/admin/schemas/testimonial';
import { sanitizeTranslations } from '@/lib/admin/i18n';
import { makeItemRoute } from '@/lib/admin/crud';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const { GET, PATCH, DELETE } = makeItemRoute({
  schema: testimonialInputSchema,
  delegate: prisma.testimonial as unknown as Parameters<typeof makeItemRoute>[0]['delegate'],
  collectionKey: 'testimonials',
  itemKey: 'testimonial',
  toCreate: async () => ({}),
  toUpdate: async (data) => {
    const out: Record<string, unknown> = {};
    if (data.guestName !== undefined) out.guestName = data.guestName;
    if (data.country !== undefined) out.country = data.country;
    if (data.rating !== undefined) out.rating = data.rating;
    if (data.quote !== undefined) out.quote = data.quote;
    if (data.avatarUrl !== undefined) out.avatarUrl = data.avatarUrl || null;
    if (data.source !== undefined) out.source = data.source;
    if (data.status !== undefined) out.status = data.status;
    if (data.sortOrder !== undefined) out.sortOrder = data.sortOrder;
    if (data.translations !== undefined) out.translations = sanitizeTranslations(data.translations);
    return out;
  },
});

export { GET, PATCH, DELETE };
