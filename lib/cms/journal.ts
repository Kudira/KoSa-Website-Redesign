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

/** Admin posts first; the built-in community stories fill in any slug not in the admin at all. */
function withCommunity(posts: PublicJournalPost[], adminSlugs: string[] = []) {
  const have = new Set([...posts.map((p) => p.slug), ...adminSlugs]);
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
    // A community story that exists in the admin (even as a draft) is governed by the admin.
    const all = await prisma.journalPost.findMany({ select: { slug: true } });
    return withCommunity(overlaid.map(({ translations: _t, ...rest }) => rest as PublicJournalPost), all.map((r: { slug: string }) => r.slug));
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
    if (!row) {
      const exists = await prisma.journalPost.count({ where: { slug } });
      return exists ? null : COMMUNITY_POSTS.find((p) => p.slug === slug) ?? null;
    }
    const overlaid = applyTranslations(serialize(row), TRANSLATABLE, locale);
    const { translations: _t, ...rest } = overlaid as { translations?: unknown } & PublicJournalPost;
    return rest as PublicJournalPost;
  } catch {
    return COMMUNITY_POSTS.find((p) => p.slug === slug) ?? null;
  }
}

/**
 * Copy the built-in community stories into the admin Journal (once), so they can
 * be edited, given new photos or unpublished there like any other post.
 */
export async function ensureCommunityPosts(): Promise<number> {
  const existing = new Set((await prisma.journalPost.findMany({ select: { slug: true } })).map((r: { slug: string }) => r.slug));
  const missing = COMMUNITY_POSTS.filter((p) => !existing.has(p.slug));
  for (const p of missing) {
    await prisma.journalPost.create({
      data: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        body: p.body.trim(),
        image: p.image,
        author: p.author,
        tags: p.tags,
        status: 'PUBLISHED',
        publishedAt: p.publishedAt ? new Date(p.publishedAt) : new Date(),
      },
    });
  }
  return missing.length;
}
