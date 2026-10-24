import { prisma } from '@/lib/prisma';
import { applyTranslationsAll } from '@/lib/admin/i18n';
import { getServerLocale } from '@/lib/i18n/server';
import { testimonials as fallback } from '@/lib/content/home';
import { translate } from '@/lib/i18n/dictionaries';
import type { PublicTestimonial } from '@/lib/cms/types';

export type { PublicTestimonial };

const TRANSLATABLE = ['country', 'quote'] as const;

export async function listPublicTestimonials(): Promise<PublicTestimonial[]> {
  const locale = getServerLocale();
  try {
    const rows = await prisma.testimonial.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    if (rows.length) {
      const overlaid = applyTranslationsAll(
        rows.map((r) => ({
          id: r.id,
          guestName: r.guestName,
          country: r.country,
          rating: r.rating,
          quote: r.quote,
          avatarUrl: r.avatarUrl,
          source: r.source,
          sortOrder: r.sortOrder,
          translations: r.translations,
        })),
        TRANSLATABLE,
        locale,
      );
      return overlaid.map(({ translations: _t, ...rest }) => rest as PublicTestimonial);
    }
  } catch {
    /* fall through */
  }
  return fallback.map((t, i) => ({
    id: `fallback-${t.index}`,
    guestName: t.name,
    country: translate(locale, `testimonials.${t.index}.country` as never),
    rating: t.rating,
    quote: translate(locale, `testimonials.${t.index}.quote` as never),
    avatarUrl: t.avatar,
    source: null,
    sortOrder: i,
  }));
}
