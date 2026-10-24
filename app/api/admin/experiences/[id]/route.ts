import { prisma } from '@/lib/prisma';
import { experienceInputSchema } from '@/lib/admin/schemas/experience';
import { sanitizeTranslations } from '@/lib/admin/i18n';
import { ensureUniqueSlug } from '@/lib/admin/slug';
import { makeItemRoute } from '@/lib/admin/crud';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const { GET, PATCH, DELETE } = makeItemRoute({
  schema: experienceInputSchema,
  delegate: prisma.experience as unknown as Parameters<typeof makeItemRoute>[0]['delegate'],
  collectionKey: 'experiences',
  itemKey: 'experience',
  toCreate: async () => ({}),
  toUpdate: async (data, existing) => {
    const e = existing as { id: string; slug: string; title: string };
    let slug = e.slug;
    if (data.slug !== undefined || data.title !== undefined) {
      slug = await ensureUniqueSlug(
        data.slug ?? e.slug,
        data.title ?? e.title,
        (s) => prisma.experience.findUnique({ where: { slug: s }, select: { id: true } }),
        e.id,
      );
    }
    const out: Record<string, unknown> = { slug };
    if (data.label !== undefined) out.label = data.label;
    if (data.title !== undefined) out.title = data.title;
    if (data.description !== undefined) out.description = data.description;
    if (data.longBody !== undefined) out.longBody = data.longBody;
    if (data.image !== undefined) out.image = data.image || null;
    if (data.gallery !== undefined) out.gallery = data.gallery;
    if (data.adinkra !== undefined) out.adinkra = data.adinkra;
    if (data.duration !== undefined) out.duration = data.duration;
    if (data.status !== undefined) out.status = data.status;
    if (data.sortOrder !== undefined) out.sortOrder = data.sortOrder;
    if (data.translations !== undefined) out.translations = sanitizeTranslations(data.translations);
    return out;
  },
});

export { GET, PATCH, DELETE };
