// Seed the KO-SA Beach Resort room inventory to mirror the live ko-sa.com/rooms
// page exactly: the 9 official room types, their names, descriptions, amenity
// tags and their official images (ingested from ko-sa.com into Supabase
// Storage as optimized WebP).
//
// Every room is fully editable afterwards at /admin/rooms and renders on the
// public site from the database.
//
// Idempotent: upserts each Room by slug, removes any room not in this set, and
// clears prior room media from storage first.
//
//   npm run seed:rooms

import './_env';
import { prisma } from '../lib/prisma';
import { getSupabaseAdmin } from '../lib/supabase';
import { ingestImage } from './lib/ingest';

const CDN = 'https://ko-sa.com/Rooms';
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

/**
 * ko-sa.com serves a room's photos as <BASE>.jpg, <BASE>2.jpg, <BASE>3.jpg …
 * (real JPEGs); missing indices fall back to the SPA's HTML shell (text/html).
 * Probe sequentially until a non-image is hit, capped at 8.
 */
async function discoverRoomImages(base: string): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 1; i <= 8; i++) {
    const url = `${CDN}/${base}${i === 1 ? '' : i}.jpg`;
    const res = await fetch(url, { method: 'GET', headers: { 'User-Agent': UA } });
    const ct = res.headers.get('content-type') ?? '';
    if (res.ok && ct.startsWith('image/')) urls.push(url);
    else if (i > 1) break;
  }
  return urls;
}

type SeedRoom = {
  slug: string;
  name: string;
  category: 'SUITE' | 'PALM_SIDE' | 'BEACH_VIEW' | 'BUNGALOW' | 'VILLA';
  maxGuests: number;
  bedConfig: string;
  tagline: string;
  description: string;
  amenities: string[];
  features: string[];
  /** official ko-sa.com image file (without extension) */
  img: string;
  translations: Record<string, { name?: string; tagline?: string }>;
};

// Order = display order (sea-view premium → garden → value). Mirrors the live
// site's nine rooms; taglines added in the brand voice (one-line essence).
const ROOMS: SeedRoom[] = [
  {
    slug: 'luxury-double-sea-view',
    name: 'Luxury Double Room with Sea View',
    category: 'SUITE',
    maxGuests: 2,
    bedConfig: 'Double bed',
    tagline: 'Our finest, with the ocean at the foot of the bed',
    description:
      "This is the room you'll struggle to leave. The ocean fills the window from the moment you wake. The bed faces the sea. The air carries salt and quiet. Everything else - the cool bathroom, the private balcony, the soft light at golden hour - is the room working around that view.",
    amenities: ['Sea view', 'Double bed', 'Private bathroom', 'Air conditioning', 'WiFi', 'Balcony'],
    features: ['Sea view', 'Premium'],
    img: 'LDRWSV',
    translations: {
      fr: { name: 'Chambre double de luxe vue mer', tagline: "Notre plus belle, l'océan au pied du lit" },
      es: { name: 'Habitación doble de lujo con vista al mar', tagline: 'La mejor, con el mar a los pies de la cama' },
      de: { name: 'Luxus-Doppelzimmer mit Meerblick', tagline: 'Unser schönstes, das Meer zu Füßen des Betts' },
      nl: { name: 'Luxe tweepersoonskamer met zeezicht', tagline: 'Onze mooiste, de zee aan het voeteneind' },
    },
  },
  {
    slug: 'deluxe-double-sea-view',
    name: 'Deluxe Double Room with Sea View',
    category: 'BEACH_VIEW',
    maxGuests: 2,
    bedConfig: 'Double bed',
    tagline: 'Wake to the ocean, sleep to the surf',
    description:
      'Open your eyes and the sea is already there. A calm, light-filled double where the surf is your alarm and the balcony is where the day slows down. Everything you need, nothing you don’t.',
    amenities: ['Sea view', 'Double bed', 'Private bathroom', 'Air conditioning', 'WiFi', 'Balcony'],
    features: ['Sea view'],
    img: 'DDRWSV',
    translations: {
      fr: { name: 'Chambre double deluxe vue mer', tagline: "Réveil sur l'océan, sommeil bercé par les vagues" },
      es: { name: 'Habitación doble deluxe con vista al mar', tagline: 'Despierta con el mar, duerme con las olas' },
      de: { name: 'Deluxe-Doppelzimmer mit Meerblick', tagline: 'Erwachen am Meer, einschlafen mit der Brandung' },
      nl: { name: 'Deluxe tweepersoonskamer met zeezicht', tagline: 'Word wakker met de zee, slaap met de branding' },
    },
  },
  {
    slug: 'deluxe-twin-sea-view',
    name: 'Deluxe Twin Room with Sea View',
    category: 'BEACH_VIEW',
    maxGuests: 2,
    bedConfig: 'Twin beds',
    tagline: 'Two beds, one endless horizon',
    description:
      'Two beds, one wide horizon. Made for friends or family who want the ocean in view and the day at their own pace - sea breeze through the window, soft light at dusk.',
    amenities: ['Sea view', 'Twin beds', 'Private bathroom', 'Air conditioning', 'Balcony', 'WiFi'],
    features: ['Sea view', 'Twin'],
    img: 'DTRWSV',
    translations: {
      fr: { name: 'Chambre twin deluxe vue mer', tagline: 'Deux lits, un horizon sans fin' },
      es: { name: 'Habitación twin deluxe con vista al mar', tagline: 'Dos camas, un horizonte infinito' },
      de: { name: 'Deluxe-Zweibettzimmer mit Meerblick', tagline: 'Zwei Betten, ein endloser Horizont' },
      nl: { name: 'Deluxe twinkamer met zeezicht', tagline: 'Twee bedden, één eindeloze horizon' },
    },
  },
  {
    slug: 'family-room-private-bathroom',
    name: 'Family Room with Private Bathroom',
    category: 'VILLA',
    maxGuests: 4,
    bedConfig: 'Multiple beds',
    tagline: 'Room to breathe, together',
    description:
      'Room to spread out and still be together. Space for the whole family, a private bathroom, and the kind of easy comfort that lets everyone - the little ones included - settle into the slow rhythm of the coast.',
    amenities: ['Private bathroom', 'Multiple beds', 'Family friendly', 'Air conditioning', 'WiFi', 'Balcony'],
    features: ['Family-friendly', 'Spacious'],
    img: 'FRWPB',
    translations: {
      fr: { name: 'Chambre familiale avec salle de bain privée', tagline: "De l'espace pour respirer, ensemble" },
      es: { name: 'Habitación familiar con baño privado', tagline: 'Espacio para respirar, en familia' },
      de: { name: 'Familienzimmer mit eigenem Bad', tagline: 'Raum zum Atmen, gemeinsam' },
      nl: { name: 'Familiekamer met eigen badkamer', tagline: 'Ruimte om te ademen, samen' },
    },
  },
  {
    slug: 'triple-room-private-bathroom',
    name: 'Triple Room with Private Bathroom',
    category: 'BUNGALOW',
    maxGuests: 3,
    bedConfig: 'Three beds',
    tagline: 'Made for small groups and good company',
    description:
      'For small groups and good company. Three beds, a private bathroom, and plenty of room to come and go - close to the beach, easy on everyone.',
    amenities: ['Private bathroom', 'Three beds', 'Air conditioning', 'WiFi', 'Balcony'],
    features: ['Groups'],
    img: 'TBWPB',
    translations: {
      fr: { name: 'Chambre triple avec salle de bain privée', tagline: 'Pensée pour les petits groupes et la bonne compagnie' },
      es: { name: 'Habitación triple con baño privado', tagline: 'Para grupos pequeños y buena compañía' },
      de: { name: 'Dreibettzimmer mit eigenem Bad', tagline: 'Für kleine Gruppen und gute Gesellschaft' },
      nl: { name: 'Driepersoonskamer met eigen badkamer', tagline: 'Voor kleine groepen en goed gezelschap' },
    },
  },
  {
    slug: 'double-room-garden-view',
    name: 'Double Room with Garden View',
    category: 'BUNGALOW',
    maxGuests: 2,
    bedConfig: 'Double bed',
    tagline: 'Garden-facing calm for those who came to be still',
    description:
      'Garden-facing calm for those who came to be still. Wake to birdsong and green light, with the sea a short barefoot walk away. Quiet, simple, and deeply restful.',
    amenities: ['Garden view', 'Double bed', 'Private bathroom', 'Air conditioning', 'WiFi', 'Balcony'],
    features: ['Garden view'],
    img: 'DRWGV',
    translations: {
      fr: { name: 'Chambre double vue jardin', tagline: 'Le calme du jardin, pour qui vient se poser' },
      es: { name: 'Habitación doble con vista al jardín', tagline: 'La calma del jardín, para quien viene a calmarse' },
      de: { name: 'Doppelzimmer mit Gartenblick', tagline: 'Gartenruhe für alle, die zur Ruhe kommen wollen' },
      nl: { name: 'Tweepersoonskamer met tuinzicht', tagline: 'Tuinrust voor wie tot stilstand wil komen' },
    },
  },
  {
    slug: 'twin-room-garden-view',
    name: 'Twin Room with Garden View',
    category: 'PALM_SIDE',
    maxGuests: 2,
    bedConfig: 'Twin beds',
    tagline: 'Quiet mornings among the palms',
    description:
      'Quiet mornings among the palms. Two beds, garden views, and the unhurried hush of the gardens - a gentle base for a couple of friends or a restful solo stay.',
    amenities: ['Garden view', 'Twin beds', 'Private bathroom', 'Air conditioning', 'WiFi', 'Balcony'],
    features: ['Garden view', 'Twin'],
    img: 'TRWGV',
    translations: {
      fr: { name: 'Chambre twin vue jardin', tagline: 'Des matins paisibles au milieu des palmiers' },
      es: { name: 'Habitación twin con vista al jardín', tagline: 'Mañanas tranquilas entre las palmeras' },
      de: { name: 'Zweibettzimmer mit Gartenblick', tagline: 'Stille Morgen zwischen den Palmen' },
      nl: { name: 'Twinkamer met tuinzicht', tagline: 'Stille ochtenden tussen de palmen' },
    },
  },
  {
    slug: 'traveling-palm-double-garden',
    name: 'Traveling Palm Double Garden Room',
    category: 'PALM_SIDE',
    maxGuests: 2,
    bedConfig: 'Double bed · shared bathroom',
    tagline: 'Light on the wallet, easy on the soul',
    description:
      'Light on the wallet, easy on the soul. A simple, comfortable double among the palms with shared facilities - all the coast, none of the fuss.',
    amenities: ['Double bed', 'Shared bathroom', 'Fan', 'WiFi', 'Balcony'],
    features: ['Value', 'Shared bathroom'],
    img: 'SDRWSB',
    translations: {
      fr: { name: 'Chambre double jardin Traveling Palm', tagline: 'Léger pour le portefeuille, doux pour l’âme' },
      es: { name: 'Habitación doble jardín Traveling Palm', tagline: 'Ligera para el bolsillo, suave para el alma' },
      de: { name: 'Traveling Palm Doppel-Gartenzimmer', tagline: 'Leicht für den Geldbeutel, gut für die Seele' },
      nl: { name: 'Traveling Palm tweepersoons tuinkamer', tagline: 'Licht voor de portemonnee, goed voor de ziel' },
    },
  },
  {
    slug: 'traveling-palm-twin-garden',
    name: 'Traveling Palm Twin Garden Room',
    category: 'PALM_SIDE',
    maxGuests: 2,
    bedConfig: 'Twin beds · shared bathroom',
    tagline: 'Good company, by the sea',
    description:
      'Good company, by the sea. Two beds, garden surrounds and shared facilities - an easy, affordable way to wake up on the coast with the people you travel best with.',
    amenities: ['Twin beds', 'Shared bathroom', 'Fan', 'WiFi', 'Balcony'],
    features: ['Value', 'Shared bathroom', 'Twin'],
    img: 'STRWSB',
    translations: {
      fr: { name: 'Chambre twin jardin Traveling Palm', tagline: 'De la bonne compagnie, au bord de la mer' },
      es: { name: 'Habitación twin jardín Traveling Palm', tagline: 'Buena compañía, junto al mar' },
      de: { name: 'Traveling Palm Twin-Gartenzimmer', tagline: 'Gute Gesellschaft, am Meer' },
      nl: { name: 'Traveling Palm twin tuinkamer', tagline: 'Goed gezelschap, aan zee' },
    },
  },
];

async function clearRoomMedia() {
  const old = await prisma.mediaAsset.findMany({
    where: { folder: { startsWith: 'rooms/' } },
    select: { path: true },
  });
  if (!old.length) return;
  const client = getSupabaseAdmin();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'kosa-public';
  if (client) await client.storage.from(bucket).remove(old.map((o) => o.path));
  await prisma.mediaAsset.deleteMany({ where: { folder: { startsWith: 'rooms/' } } });
  console.log(`Cleared ${old.length} previous room image(s) from storage.`);
}

async function main() {
  const keepSlugs = ROOMS.map((r) => r.slug);
  await clearRoomMedia();

  let sortOrder = 0;
  for (const room of ROOMS) {
    const sources = await discoverRoomImages(room.img);
    console.log(`\n${room.name}: ${sources.length} image(s) found, ingesting…`);

    const urls: string[] = [];
    for (let i = 0; i < sources.length; i++) {
      const asset = await ingestImage(sources[i], {
        folder: `rooms/${room.slug}`,
        name: `${i}-${room.img}${i === 0 ? '' : i + 1}`,
        alt: `${room.name} - KO-SA Beach Resort`,
        maxEdge: 2200,
        quality: 84,
      });
      urls.push(asset.url);
      process.stdout.write(`  ✓ ${asset.width}x${asset.height}\n`);
    }

    const data = {
      name: room.name,
      tagline: room.tagline,
      category: room.category,
      description: room.description,
      price: 0, // price hidden on the public site; Book Now → Cloudbeds
      currency: 'EUR',
      maxGuests: room.maxGuests,
      bedConfig: room.bedConfig,
      image: urls[0] ?? null,
      gallery: urls,
      amenities: room.amenities,
      features: room.features,
      status: 'PUBLISHED' as const,
      sortOrder: sortOrder++,
      translations: room.translations,
    };

    await prisma.room.upsert({
      where: { slug: room.slug },
      update: data,
      create: { slug: room.slug, ...data },
    });
    console.log(`  → upserted "${room.slug}"`);
  }

  const removed = await prisma.room.deleteMany({ where: { slug: { notIn: keepSlugs } } });
  console.log(`\nRemoved ${removed.count} stale room(s).`);
  const total = await prisma.room.count();
  console.log(`Done. ${total} rooms in the database.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('FAILED:', e);
    process.exit(1);
  });
