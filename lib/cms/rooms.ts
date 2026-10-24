// Read helpers for the public site. Anything imported from `lib/cms/` is safe
// to use in Server Components it pulls from Prisma, falls back to the
// editorial defaults in `lib/content/home.ts` when the DB is empty, and applies
// locale translations using the visitor's cookie.
//
// IMPORTANT: this module uses `next/headers` (via getServerLocale) never
// import it from client components. Use `lib/cms/types.ts` for shared types
// and helpers like `displayCategory`.

import { prisma } from '@/lib/prisma';
import { applyTranslationsAll } from '@/lib/admin/i18n';
import { getServerLocale } from '@/lib/i18n/server';
import { rooms as fallbackRooms } from '@/lib/content/home';
import { translate } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/dictionaries';
import type { PublicRoom } from '@/lib/cms/types';

export type { PublicRoom };
export { displayCategory } from '@/lib/cms/types';

const TRANSLATABLE = ['name', 'tagline', 'description', 'bedConfig'] as const;

function serialize(r: {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  category: string;
  description: string | null;
  price: { toString: () => string } | number;
  currency: string;
  maxGuests: number;
  bedConfig: string | null;
  sizeSqm: number | null;
  image: string | null;
  gallery: string[];
  amenities: string[];
  features: string[];
  available: boolean;
  sortOrder: number;
  translations: unknown;
}): PublicRoom & { translations?: unknown } {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    tagline: r.tagline,
    category: r.category,
    description: r.description,
    price: Number(r.price),
    currency: r.currency,
    maxGuests: r.maxGuests,
    bedConfig: r.bedConfig,
    sizeSqm: r.sizeSqm,
    image: r.image,
    gallery: r.gallery,
    amenities: r.amenities,
    features: r.features,
    available: r.available,
    sortOrder: r.sortOrder,
    translations: r.translations,
  };
}

/** Build fallback rooms from the editorial defaults so first-time visits don't 404. */
function getFallbackRooms(locale: Locale): PublicRoom[] {
  return fallbackRooms.map((r, i) => ({
    id: `fallback-${r.slug}`,
    slug: r.slug,
    name: translate(locale, `rooms.${r.slug}.name` as never),
    tagline: translate(locale, `rooms.${r.slug}.tagline` as never),
    category: r.category === 'Sea View' ? 'BEACH_VIEW' : r.category === 'Palm Side' ? 'PALM_SIDE' : 'BUNGALOW',
    description: null,
    price: r.price,
    currency: r.currency,
    maxGuests: 2,
    bedConfig: null,
    sizeSqm: null,
    image: r.image,
    gallery: [],
    amenities: [],
    features: [],
    available: true,
    sortOrder: i,
  }));
}

export async function listPublicRooms(): Promise<PublicRoom[]> {
  const locale = getServerLocale();
  try {
    const rows = await prisma.room.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    if (!rows.length) return getFallbackRooms(locale);
    const translated = applyTranslationsAll(rows.map(serialize), TRANSLATABLE, locale);
    return translated.map(({ translations: _t, ...r }) => r as PublicRoom);
  } catch {
    return getFallbackRooms(locale);
  }
}

export async function getPublicRoomBySlug(slug: string): Promise<PublicRoom | null> {
  const locale = getServerLocale();
  try {
    const row = await prisma.room.findFirst({
      where: { slug, status: 'PUBLISHED' },
    });
    if (row) {
      const [translated] = applyTranslationsAll([serialize(row)], TRANSLATABLE, locale);
      const { translations: _t, ...rest } = translated as PublicRoom & { translations?: unknown };
      return rest as PublicRoom;
    }
  } catch {
    /* fall through */
  }
  // Fallback for legacy slugs
  return getFallbackRooms(locale).find((r) => r.slug === slug) ?? null;
}
