import { prisma } from '@/lib/prisma';
import { applyTranslationsAll, applyTranslations } from '@/lib/admin/i18n';
import { getServerLocale } from '@/lib/i18n/server';
import { COMMUNITY_POSTS } from '@/lib/content/community';

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

// Ko-Sa no longer runs turtle walks. Older posts in the database may still
// carry a section about them; drop any heading that mentions turtles together
// with the paragraphs under it, up to the next heading.
function withoutTurtles(html: string) {
  return html.replace(/<h2>[^<]*turtle[^<]*<\/h2>[\s\S]*?(?=<h2>|$)/gi, '').trim();
}

const byDate = (a: PublicJournalPost, b: PublicJournalPost) =>
  new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime();

/** Admin posts first; the built-in community stories fill in any slug not in the admin. */
function withCommunity(posts: PublicJournalPost[]) {
  const have = new Set(posts.map((p) => p.slug));
  return [...posts, ...COMMUNITY_POSTS.filter((p) => !have.has(p.slug))].sort(byDate);
}

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
    body: withoutTurtles(r.body),
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
    return withCommunity(overlaid.map(({ translations: _t, ...rest }) => rest as PublicJournalPost));
  } catch {
    return withCommunity([]);
  }
}

export async function getPublicJournalPostBySlug(slug: string): Promise<PublicJournalPost | null> {
  const locale = getServerLocale();
  try {
    const row = await prisma.journalPost.findFirst({
      where: { slug, status: 'PUBLISHED' },
    });
    if (!row) return COMMUNITY_POSTS.find((p) => p.slug === slug) ?? null;
    const overlaid = applyTranslations(serialize(row), TRANSLATABLE, locale);
    const { translations: _t, ...rest } = overlaid as { translations?: unknown } & PublicJournalPost;
    return rest as PublicJournalPost;
  } catch {
    return COMMUNITY_POSTS.find((p) => p.slug === slug) ?? null;
  }
}
