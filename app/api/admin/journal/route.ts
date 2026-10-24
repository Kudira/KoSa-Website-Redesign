import { prisma } from '@/lib/prisma';
import { journalPostInputSchema } from '@/lib/admin/schemas/journal';
import { sanitizeTranslations } from '@/lib/admin/i18n';
import { ensureUniqueSlug } from '@/lib/admin/slug';
import { makeCollectionRoute } from '@/lib/admin/crud';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toDateOrNull(v: unknown): Date | null {
  if (!v) return null;
  if (typeof v !== 'string') return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

const { GET, POST } = makeCollectionRoute({
  schema: journalPostInputSchema,
  delegate: prisma.journalPost as unknown as Parameters<typeof makeCollectionRoute>[0]['delegate'],
  collectionKey: 'posts',
  itemKey: 'post',
  orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  search: (q) => ({
    OR: [
      { title: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
      { author: { contains: q, mode: 'insensitive' } },
    ],
  }),
  toCreate: async (data) => {
    const slug = await ensureUniqueSlug(
      data.slug,
      data.title,
      (s) => prisma.journalPost.findUnique({ where: { slug: s }, select: { id: true } }),
    );
    return {
      slug,
      title: data.title,
      excerpt: data.excerpt,
      body: data.body,
      image: data.image || null,
      author: data.author,
      tags: data.tags,
      status: data.status,
      publishedAt:
        data.publishedAt === undefined || data.publishedAt === ''
          ? data.status === 'PUBLISHED'
            ? new Date()
            : null
          : toDateOrNull(data.publishedAt),
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      translations: sanitizeTranslations(data.translations),
    };
  },
  toUpdate: async () => ({}),
});

export { GET, POST };
