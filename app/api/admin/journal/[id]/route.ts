import { prisma } from '@/lib/prisma';
import { journalPostInputSchema } from '@/lib/admin/schemas/journal';
import { sanitizeTranslations } from '@/lib/admin/i18n';
import { ensureUniqueSlug } from '@/lib/admin/slug';
import { makeItemRoute } from '@/lib/admin/crud';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toDateOrNull(v: unknown): Date | null {
  if (!v) return null;
  if (typeof v !== 'string') return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

const { GET, PATCH, DELETE } = makeItemRoute({
  schema: journalPostInputSchema,
  delegate: prisma.journalPost as unknown as Parameters<typeof makeItemRoute>[0]['delegate'],
  collectionKey: 'posts',
  itemKey: 'post',
  toCreate: async () => ({}),
  toUpdate: async (data, existing) => {
    const e = existing as { id: string; slug: string; title: string; publishedAt: Date | null; status: string };
    let slug = e.slug;
    if (data.slug !== undefined || data.title !== undefined) {
      slug = await ensureUniqueSlug(
        data.slug ?? e.slug,
        data.title ?? e.title,
        (s) => prisma.journalPost.findUnique({ where: { slug: s }, select: { id: true } }),
        e.id,
      );
    }
    const out: Record<string, unknown> = { slug };
    if (data.title !== undefined) out.title = data.title;
    if (data.excerpt !== undefined) out.excerpt = data.excerpt;
    if (data.body !== undefined) out.body = data.body;
    if (data.image !== undefined) out.image = data.image || null;
    if (data.author !== undefined) out.author = data.author;
    if (data.tags !== undefined) out.tags = data.tags;
    if (data.status !== undefined) {
      out.status = data.status;
      // Auto-set publishedAt the first time we publish
      if (data.status === 'PUBLISHED' && !e.publishedAt && data.publishedAt === undefined) {
        out.publishedAt = new Date();
      }
    }
    if (data.publishedAt !== undefined) {
      out.publishedAt = data.publishedAt === '' ? null : toDateOrNull(data.publishedAt);
    }
    if (data.seoTitle !== undefined) out.seoTitle = data.seoTitle;
    if (data.seoDescription !== undefined) out.seoDescription = data.seoDescription;
    if (data.translations !== undefined) out.translations = sanitizeTranslations(data.translations);
    return out;
  },
});

export { GET, PATCH, DELETE };
