import { prisma } from '@/lib/prisma';
import { applyTranslationsAll } from '@/lib/admin/i18n';
import { getServerLocale } from '@/lib/i18n/server';
import { treatments as fallback } from '@/lib/content/home';
import { translate } from '@/lib/i18n/dictionaries';
import type { PublicTreatment } from '@/lib/cms/types';

export type { PublicTreatment };

const TRANSLATABLE = ['name', 'description'] as const;

function durationStr(min: number): string {
  return `${min} min`;
}

export async function listPublicTreatments(): Promise<PublicTreatment[]> {
  const locale = getServerLocale();
  try {
    const rows = await prisma.treatment.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    if (rows.length) {
      const overlaid = applyTranslationsAll(
        rows.map((r) => ({
          id: r.id,
          slug: r.slug,
          name: r.name,
          description: r.description,
          durationMin: r.durationMin,
          price: Number(r.price),
          currency: r.currency,
          image: r.image,
          category: r.category,
          sortOrder: r.sortOrder,
          translations: r.translations,
        })),
        TRANSLATABLE,
        locale,
      );
      return overlaid.map(({ translations: _t, ...rest }) => rest as PublicTreatment);
    }
  } catch {
    /* fall through to fallback */
  }
  return fallback.map((t, i) => ({
    id: `fallback-${t.slug}`,
    slug: t.slug,
    name: translate(locale, `treatments.${t.slug}.name` as never),
    description: null,
    durationMin: parseInt(t.duration, 10) || 60,
    price: t.price,
    currency: 'GHS',
    image: null,
    category: null,
    sortOrder: i,
  }));
}

export { durationStr };
