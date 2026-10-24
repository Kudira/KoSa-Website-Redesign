// Editorial fallback content for the homepage.
// All translatable text lives in `lib/i18n/dictionaries.ts` keyed by item slug/id.
// This file holds structural data only: slugs, prices, images, icon refs.
// To localize a field at render time, components call `t('rooms.<slug>.name')` etc.

import type { AdinkraName } from '@/components/shared/AdinkraIcon';
import type { DictKey } from '@/lib/i18n/dictionaries';

// ───────────────────────────────────────────────────────────────────────────────
// Experiences
// ───────────────────────────────────────────────────────────────────────────────

export interface Experience {
  slug: string;
  image: string;
  adinkra: AdinkraName;
}

export const experiences: Experience[] = [
  {
    slug: 'wellness',
    image:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1400',
    adinkra: 'denkyem',
  },
  {
    slug: 'ocean',
    image:
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&q=80&w=1400',
    adinkra: 'knonsonkonson',
  },
  {
    slug: 'dining',
    image:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1400',
    adinkra: 'asetena',
  },
  {
    slug: 'cultural',
    image:
      'https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&q=80&w=1400',
    adinkra: 'community',
  },
];

// ───────────────────────────────────────────────────────────────────────────────
// Rooms
// ───────────────────────────────────────────────────────────────────────────────

export interface Room {
  slug: string;
  price: number;
  currency: string;
  image: string;
  category: 'Sea View' | 'Garden View' | 'Palm Side';
}

export const rooms: Room[] = [
  {
    slug: 'beachfront-suite',
    price: 1850,
    currency: 'GHS',
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1400',
    category: 'Garden View',
  },
  {
    slug: 'palm-garden-villa',
    price: 1450,
    currency: 'GHS',
    image:
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=1400',
    category: 'Palm Side',
  },
  {
    slug: 'ocean-view-room',
    price: 1250,
    currency: 'GHS',
    image:
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=1400',
    category: 'Sea View',
  },
  {
    slug: 'signature-villa',
    price: 2200,
    currency: 'GHS',
    image:
      'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&q=80&w=1400',
    category: 'Garden View',
  },
  {
    slug: 'beach-bungalow',
    price: 1100,
    currency: 'GHS',
    image:
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=1400',
    category: 'Sea View',
  },
  {
    slug: 'garden-room',
    price: 980,
    currency: 'GHS',
    image:
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=1400',
    category: 'Palm Side',
  },
];

/** Map a category back to its dict key for localized filter labels. */
export const CATEGORY_DICT_KEY: Record<Room['category'], DictKey> = {
  'Garden View': 'rooms.filter.suite',
  'Palm Side': 'rooms.filter.palmSide',
  'Sea View': 'rooms.filter.beachView',
};

// ───────────────────────────────────────────────────────────────────────────────
// Adinkra guide
// ───────────────────────────────────────────────────────────────────────────────

/** Twi names are kept in source language (proper nouns); only `meaning`/`line` are localized via dict keys. */
export const adinkraGuide: { name: AdinkraName; twi: string }[] = [
  { name: 'knonsonkonson', twi: 'Knonsonkonson' },
  { name: 'asetena', twi: 'Asetena Pa' },
  { name: 'denkyem', twi: 'Denkyem' },
  { name: 'community', twi: 'Nkabom' },
];

// ───────────────────────────────────────────────────────────────────────────────
// Testimonials
// ───────────────────────────────────────────────────────────────────────────────

export interface Testimonial {
  /** stable index used to look up `testimonials.<index>.country` / `.quote`. */
  index: number;
  name: string;
  rating: number;
  avatar: string;
}

export const testimonials: Testimonial[] = [
  { index: 0, name: 'Amara K.', rating: 5, avatar: 'https://i.pravatar.cc/120?img=47' },
  { index: 1, name: 'James W.', rating: 5, avatar: 'https://i.pravatar.cc/120?img=12' },
  { index: 2, name: 'Léa M.', rating: 5, avatar: 'https://i.pravatar.cc/120?img=23' },
  { index: 3, name: 'David O.', rating: 5, avatar: 'https://i.pravatar.cc/120?img=33' },
];

// ───────────────────────────────────────────────────────────────────────────────
// Wellness treatments
// ───────────────────────────────────────────────────────────────────────────────

export interface Treatment {
  /** slug used as dict key suffix: `treatments.<slug>.name`. */
  slug: string;
  duration: string;
  price: number;
}

// Real KoSa spa menu (prices in GHS). Kept in sync with TREATMENTS_FALLBACK.
export const treatments: Treatment[] = [
  { slug: 'deepcore-massage', duration: '45 min', price: 350 },
  { slug: 'swedish-massage', duration: '45 min', price: 300 },
  { slug: 'holistic-massage', duration: '45 min', price: 330 },
  { slug: 'couples-massage', duration: '45 min', price: 550 },
  { slug: 'reflexology', duration: '30 min', price: 200 },
  { slug: 'pedicure', duration: '45 min', price: 150 },
];

// ───────────────────────────────────────────────────────────────────────────────
// Gallery
// ───────────────────────────────────────────────────────────────────────────────

export const gallery = [
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=900',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=900',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=900',
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&q=80&w=900',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=900',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=900',
  'https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&q=80&w=900',
  'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&q=80&w=900',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=900',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=900',
  'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?auto=format&fit=crop&q=80&w=900',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=900',
];
