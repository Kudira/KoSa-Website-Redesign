import { prisma } from '@/lib/prisma';
import { applyTranslationsAll } from '@/lib/admin/i18n';
import { getServerLocale } from '@/lib/i18n/server';
import { experiences as fallback } from '@/lib/content/home';
import { translate } from '@/lib/i18n/dictionaries';
import type { PublicExperience } from '@/lib/cms/types';

export type { PublicExperience };

const TRANSLATABLE = ['label', 'title', 'description', 'longBody', 'duration'] as const;

export async function listPublicExperiences(): Promise<PublicExperience[]> {
  const locale = getServerLocale();
  try {
    const rows = await prisma.experience.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    if (rows.length) {
      const overlaid = applyTranslationsAll(
        rows.map((r) => ({
          id: r.id,
          slug: r.slug,
          label: r.label,
          title: r.title,
          description: r.description,
          longBody: r.longBody,
          image: r.image,
          gallery: r.gallery,
          adinkra: r.adinkra,
          duration: r.duration,
          sortOrder: r.sortOrder,
          translations: r.translations,
        })),
        TRANSLATABLE,
        locale,
      );
      return overlaid.map(({ translations: _t, ...rest }) => rest as PublicExperience);
    }
  } catch {
    /* fall through */
  }
  return fallback.map((e, i) => ({
    id: `fallback-${e.slug}`,
    slug: e.slug,
    label: translate(locale, `experiences.${e.slug}.label` as never),
    title: translate(locale, `experiences.${e.slug}.title` as never),
    description: translate(locale, `experiences.${e.slug}.description` as never),
    longBody: null,
    image: e.image,
    gallery: [],
    adinkra: e.adinkra,
    duration: null,
    sortOrder: i,
  }));
}

export async function getPublicExperienceBySlug(slug: string): Promise<PublicExperience | null> {
  const all = await listPublicExperiences();
  return all.find((e) => e.slug === slug) ?? null;
}
