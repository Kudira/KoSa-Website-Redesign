// Real Ko-Sa photography, hosted in Supabase Storage (bucket: kosa-public).
// One place to swap any image used by the redesigned public pages. CMS
// content (rooms, gallery, experiences…) still comes from the admin; these are
// the editorial images around it.

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ubsgvfouroqkgqufzeat.supabase.co';
export const BUCKET_BASE = `${SUPA}/storage/v1/object/public/kosa-public`;
const m = (p: string) => `${BUCKET_BASE}/${p}`;

export const media = {
  banner: m('media/banner/banner1.webp'),
  feeling: m('media/feeling/slowing-down-guests.webp'),
  about: m('media/about/about-hero-kosa-scenery.webp'),
  beach: m('media/beach/beach-shots-img_3787.webp'),
  arrival: m('media/book/book-welcome-arrival.webp'),
  relaxing: m('media/gallery/randoms/v2-relaxing.webp'),
  suiteTeaser: m('media/home/virtual-tour-teaser-suite.webp'),
  scenery2: m('media/scenery/scenery-kosa2.webp'),
  scenery3: m('media/scenery/scenery-kosa3.webp'),
  environment1: m('media/environment/general-environment-img_3589.webp'),
  environment2: m('media/environment/general-environment-img_3964.webp'),
  commonSpaces: m('media/virtual-tour/vt-hero-common-spaces.webp'),
  drumCircle: m('media/highlights/drum-circle-sunset.webp'),

  experiences: {
    banner: m('media/experiences/banner.webp'),
    ghana: m('media/experiences/into-ghana.webp'),
    property: m('media/experiences/on-the-property.webp'),
  },
  wellness: {
    banner: m('media/wellness/banner.webp'),
    day: m('media/wellness/wellness-day-v2.webp'),
    journeys: m('media/wellness/wellness-journeys-v2.webp'),
    coaching: m('media/wellness/wellness-coaching-v2.webp'),
    spa: m('media/wellness/spa-services.webp'),
    tea: m('media/wellness/kosa-tea-bar.webp'),
    yoga: m('media/wellness/yoga-by-the-sea.webp'),
  },
  dining: {
    hero: m('media/dining/hero-plantain-platter.webp'),
    breakfast: m('media/dining/breakfast.webp'),
    restaurant: m('media/dining/the-restaurant.webp'),
    bar: m('media/dining/the-bar.webp'),
    privateBeach: m('media/dining/private-beach-dining-v2.webp'),
    grilled: m('media/dining/band-grilled-platter.webp'),
    seafood: m('media/dining/band-seafood-fruit.webp'),
  },
  events: {
    one: m('media/events/special-events-img_1126.webp'),
    two: m('media/events/special-events-img_1141.webp'),
    three: m('media/events/special-events-img_1181.webp'),
  },
  gallery: {
    beach0: m('gallery/beach/0-772A1802.webp'),
    beach1: m('gallery/beach/1-772A1842.webp'),
    beach11: m('gallery/beach/11-772A2002.webp'),
    beach12: m('gallery/beach/12-772A2007.webp'),
    dining0: m('gallery/dining/0-772A1897.webp'),
    dining2: m('gallery/dining/2-772A1911.webp'),
    resort0: m('gallery/resort/0-772A4907.webp'),
    resort1: m('gallery/resort/1-772A4909.webp'),
    resort10: m('gallery/resort/10-772A4925.webp'),
    resort11: m('gallery/resort/11-772A4926.webp'),
    resort12: m('gallery/resort/12-772A4928.webp'),
    wellness0: m('gallery/wellness/0-772A2086.webp'),
    wellness2: m('gallery/wellness/2-772A2097.webp'),
    wellness3: m('gallery/wellness/3-772A2129.webp'),
  },
  rooms: {
    luxuryDoubleSea: m('rooms/luxury-double-sea-view/01.webp'),
    deluxeTwinSea: m('rooms/deluxe-twin-sea-view/01.webp'),
    deluxeDoubleSea: m('rooms/deluxe-double-sea-view/0-DDRWSV.webp'),
  },
} as const;

/** Turn the old " · " sentence separators into real sentences. */
export function prose(text: string | null | undefined): string {
  if (!text) return '';
  const out = text
    .split(/\s+·\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (/[.!?…”"’)]$/.test(s) ? s : `${s}.`))
    .join(' ');
  return out;
}

/** Split " · " separated copy into an array of sentences. */
export function sentences(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\s+·\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
