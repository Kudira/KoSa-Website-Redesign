import { prisma } from '@/lib/prisma';
import { treatmentInputSchema } from '@/lib/admin/schemas/treatment';
import { sanitizeTranslations } from '@/lib/admin/i18n';
import { ensureUniqueSlug } from '@/lib/admin/slug';
import { makeItemRoute } from '@/lib/admin/crud';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const { GET, PATCH, DELETE } = makeItemRoute({
  schema: treatmentInputSchema,
  delegate: prisma.treatment as unknown as Parameters<typeof makeItemRoute>[0]['delegate'],
  collectionKey: 'treatments',
  itemKey: 'treatment',
  toCreate: async () => ({}),
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

export { GET, PATCH, DELETE };
