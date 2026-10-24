// Seed the public Gallery from the media already ingested into Supabase
// Storage (by scripts/ingest-new-media.ts + scripts/seed-kosa-rooms.ts).
//
// - Curates by colourfulness so the gallery leads with vibrant, lively shots.
// - Groups everything into a small set of clean, user-facing categories.
// - Excludes specific images the owner asked to remove (e.g. their own photo).
//
//   npx tsx scripts/ingest-new-media.ts   # first, to (re)ingest files/* media
//   npm run seed:media                    # then, to (re)build the gallery
//
// Idempotent: clears GalleryItem rows and rebuilds. Storage objects are left in
// place (managed by the ingest scripts).

import './_env';
import fs from 'node:fs';
import { prisma } from '../lib/prisma';

type ManifestItem = { url: string; width: number; height: number; colour: number; src: string };
type Manifest = Record<string, ManifestItem[]>;

// Public category → which media/* source categories feed it, and its caption.
const GALLERY: { category: string; caption: string; from: string[]; cap: number }[] = [
  { category: 'beach', caption: 'Beach & Shore', from: ['beach', 'scenery'], cap: 14 },
  { category: 'resort', caption: 'The Resort', from: ['environment', 'rooms-extra'], cap: 16 },
  { category: 'dining', caption: 'Food & Drinks', from: ['food', 'drinks', 'dining-life'], cap: 18 },
  { category: 'wellness', caption: 'Wellness', from: ['wellness'], cap: 6 },
  { category: 'culture', caption: 'Culture & Community', from: ['culture'], cap: 5 },
  { category: 'events', caption: 'Events', from: ['events'], cap: 12 },
];

// Owner asked to remove these (their own photo, etc.) - match by URL substring.
const EXCLUDE = [
  '6-772A1875', // owner's photo on the old beach gallery
];

function excluded(url: string): boolean {
  return EXCLUDE.some((frag) => url.includes(frag));
}

async function main() {
  const manifestPath = '/tmp/media-manifest.json';
  if (!fs.existsSync(manifestPath)) {
    console.error('No media manifest. Run: npx tsx scripts/ingest-new-media.ts');
    process.exit(1);
  }
  const manifest: Manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  await prisma.galleryItem.deleteMany({});
  console.log('Gallery reset.');

  let sortOrder = 0;
  for (const g of GALLERY) {
    // Pool all source items, drop excluded, sort by colourfulness (vibrant first).
    const pool: ManifestItem[] = [];
    for (const src of g.from) pool.push(...(manifest[src] ?? []));
    const picked = pool
      .filter((i) => !excluded(i.url))
      .sort((a, b) => b.colour - a.colour)
      .slice(0, g.cap);

    for (const item of picked) {
      await prisma.galleryItem.create({
        data: {
          imageUrl: item.url,
          alt: `${g.caption} KO-SA Beach Resort`,
          caption: g.caption,
          category: g.category,
          width: item.width,
          height: item.height,
          status: 'PUBLISHED',
          sortOrder: sortOrder++,
        },
      });
    }
    console.log(`${g.category.padEnd(10)} ${picked.length} image(s)`);
  }

  // Rooms category - from already-ingested room media, lead image per room.
  const roomAssets = await prisma.mediaAsset.findMany({
    where: { folder: { startsWith: 'rooms/' } },
    orderBy: [{ folder: 'asc' }, { path: 'asc' }],
  });
  let roomCount = 0;
  for (const a of roomAssets) {
    if (excluded(a.url)) continue;
    await prisma.galleryItem.create({
      data: {
        imageUrl: a.url,
        alt: a.alt ?? 'KO-SA Beach Resort room',
        caption: 'Rooms & Chalets',
        category: 'rooms',
        width: a.width,
        height: a.height,
        status: 'PUBLISHED',
        sortOrder: sortOrder++,
      },
    });
    roomCount++;
  }
  console.log(`${'rooms'.padEnd(10)} ${roomCount} image(s)`);

  const total = await prisma.galleryItem.count();
  console.log(`\nDone. ${total} gallery items (curated by colour, categorised).`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('FAILED:', e);
    process.exit(1);
  });
