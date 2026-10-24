import { prisma } from '@/lib/prisma';
import { experienceInputSchema } from '@/lib/admin/schemas/experience';
import { sanitizeTranslations } from '@/lib/admin/i18n';
import { ensureUniqueSlug } from '@/lib/admin/slug';
import { makeCollectionRoute } from '@/lib/admin/crud';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const { GET, POST } = makeCollectionRoute({
  schema: experienceInputSchema,
  delegate: prisma.experience as unknown as Parameters<typeof makeCollectionRoute>[0]['delegate'],
  collectionKey: 'experiences',
  itemKey: 'experience',
  orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  search: (q) => ({
    OR: [
      { title: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
      { label: { contains: q, mode: 'insensitive' } },
    ],
  }),
  toCreate: async (data) => {
    const slug = await ensureUniqueSlug(
      data.slug,
      data.title,
      (s) => prisma.experience.findUnique({ where: { slug: s }, select: { id: true } }),
    );
    return {
      slug,
      label: data.label,
      title: data.title,
      description: data.description,
      longBody: data.longBody,
      image: data.image || null,
      gallery: data.gallery,
      adinkra: data.adinkra,
      duration: data.duration,
      status: data.status,
      sortOrder: data.sortOrder,
      translations: sanitizeTranslations(data.translations),
    };
  },
  toUpdate: async () => ({}),
});

export { GET, POST };
