import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { prisma } from '@/lib/prisma';
import { rooms as fallbackRooms, experiences as fallbackExperiences } from '@/lib/content/home';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPaths = [
    '/',
    '/rooms',
    '/experiences',
    // '/virtual-tour', // temporarily hidden from the public nav + sitemap
    '/dining',
    '/wellness',
    '/about',
    '/gallery',
    '/blog',
    '/contact',
    '/book',
  ];

  // Pull live slugs from the CMS. Fall back to the editorial defaults when the
  // DB is empty or unreachable so the sitemap never blanks.
  const [roomRows, experienceRows, postRows] = await Promise.all([
    prisma.room.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, updatedAt: true } }).catch(() => [] as { slug: string; updatedAt: Date }[]),
    prisma.experience.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, updatedAt: true } }).catch(() => [] as { slug: string; updatedAt: Date }[]),
    prisma.journalPost.findMany({
      where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
      select: { slug: true, updatedAt: true },
    }).catch(() => [] as { slug: string; updatedAt: Date }[]),
  ]);

  const roomSlugs = roomRows.length ? roomRows.map((r) => r.slug) : fallbackRooms.map((r) => r.slug);
  const experienceSlugs = experienceRows.length
    ? experienceRows.map((e) => e.slug)
    : fallbackExperiences.map((e) => e.slug);

  const dynamicPaths = [
    ...roomSlugs.map((s) => `/rooms/${s}`),
    ...experienceSlugs.map((s) => `/experiences/${s}`),
    ...postRows.map((p) => `/blog/${p.slug}`),
  ];

  return [...staticPaths, ...dynamicPaths].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path.startsWith('/book') ? 0.9 : 0.7,
  }));
}
