import { prisma } from '@/lib/prisma';
import { applyTranslationsAll, applyTranslations } from '@/lib/admin/i18n';
import { getServerLocale } from '@/lib/i18n/server';

export interface PublicJournalPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  image: string | null;
  author: string | null;
  tags: string[];
  publishedAt: Date | string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

const TRANSLATABLE = ['title', 'excerpt', 'body', 'seoTitle', 'seoDescription'] as const;

function serialize(r: {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  image: string | null;
  author: string | null;
  tags: string[];
  publishedAt: Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
  translations: unknown;
}) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    body: r.body,
    image: r.image,
    author: r.author,
    tags: r.tags,
    publishedAt: r.publishedAt,
    seoTitle: r.seoTitle,
    seoDescription: r.seoDescription,
    translations: r.translations,
  };
}

export async function listPublicJournalPosts(): Promise<PublicJournalPost[]> {
  const locale = getServerLocale();
  try {
    const rows = await prisma.journalPost.findMany({
      where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: 'desc' },
    });
    const overlaid = applyTranslationsAll(rows.map(serialize), TRANSLATABLE, locale);
    return overlaid.map(({ translations: _t, ...rest }) => rest as PublicJournalPost);
  } catch {
    return [];
  }
}

export async function getPublicJournalPostBySlug(slug: string): Promise<PublicJournalPost | null> {
  const locale = getServerLocale();
  try {
    const row = await prisma.journalPost.findFirst({
      where: { slug, status: 'PUBLISHED' },
    });
    if (!row) return null;
    const overlaid = applyTranslations(serialize(row), TRANSLATABLE, locale);
    const { translations: _t, ...rest } = overlaid as { translations?: unknown } & PublicJournalPost;
    return rest as PublicJournalPost;
  } catch {
    return null;
  }
}
