import { prisma } from '@/lib/prisma';
import { applyTranslations, applyTranslationsAll } from '@/lib/admin/i18n';
import { getServerLocale } from '@/lib/i18n/server';

export interface PublicMenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  dietary: string[];
  isFeatured: boolean;
}

export interface PublicMenuSection {
  id: string;
  name: string;
  description: string | null;
  items: PublicMenuItem[];
}

export interface PublicDiningVenue {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  hours: string | null;
  image: string | null;
  gallery: string[];
  sections: PublicMenuSection[];
}

const VENUE_TRANSLATABLE = ['name', 'tagline', 'description', 'hours'] as const;
const SECTION_TRANSLATABLE = ['name', 'description'] as const;
const ITEM_TRANSLATABLE = ['name', 'description'] as const;

export async function listPublicDiningVenues(): Promise<PublicDiningVenue[]> {
  const locale = getServerLocale();
  try {
    const venues = await prisma.diningVenue.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' },
          include: { items: { orderBy: { sortOrder: 'asc' } } },
        },
      },
    });

    return venues.map((v) => {
      const venueOverlaid = applyTranslations(
        {
          id: v.id,
          slug: v.slug,
          name: v.name,
          tagline: v.tagline,
          description: v.description,
          hours: v.hours,
          image: v.image,
          gallery: v.gallery,
          translations: v.translations,
        },
        VENUE_TRANSLATABLE,
        locale,
      );
      const sections = v.sections.map((s) => {
        const sectionOverlaid = applyTranslations(
          {
            id: s.id,
            name: s.name,
            description: s.description,
            translations: s.translations,
          },
          SECTION_TRANSLATABLE,
          locale,
        );
        const items = applyTranslationsAll(
          s.items.map((it) => ({
            id: it.id,
            name: it.name,
            description: it.description,
            price: it.price === null ? null : Number(it.price),
            currency: it.currency,
            dietary: it.dietary,
            isFeatured: it.isFeatured,
            translations: it.translations,
          })),
          ITEM_TRANSLATABLE,
          locale,
        );
        return {
          id: sectionOverlaid.id,
          name: sectionOverlaid.name,
          description: sectionOverlaid.description,
          items: items.map(({ translations: _t, ...rest }) => rest as PublicMenuItem),
        };
      });
      const { translations: _t, ...rest } = venueOverlaid;
      return { ...(rest as Omit<PublicDiningVenue, 'sections'>), sections };
    });
  } catch {
    return [];
  }
}
