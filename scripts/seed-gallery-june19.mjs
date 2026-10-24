// One-off (June 19 2026): convert + upload the new Naming Ceremony (culture) and
// Randoms (authentic life) photos, then seed GalleryItem rows so they appear in
// the CMS-driven Gallery with correct category, dimensions and captions.
// Idempotent: re-running re-uploads (upsert) and replaces the same rows by URL.
// Run: node scripts/seed-gallery-june19.mjs

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'files', 'Kosa-Images', 'Editted Images to be Used');

function loadEnv() {
  const raw = readFileSync(join(ROOT, '.env'), 'utf8');
  const env = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[m[1]] = v;
  }
  return env;
}
const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const BUCKET = env.SUPABASE_STORAGE_BUCKET || 'kosa-public';
const BASE = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;

const nc = (n, ext, caption, alt) => ({
  src: `Naming Ceremony/Edited/${n}.${ext}`,
  dest: `media/gallery/naming-ceremony/${String(n).padStart(2, '0')}.webp`,
  category: 'culture',
  caption,
  alt,
});
const rnd = (id, category, caption, alt) => ({
  src: `Randoms/Edited/${id}.JPG`,
  dest: `media/gallery/randoms/${id}.webp`,
  category,
  caption,
  alt,
});

// Naming-ceremony photos (a diaspora "welcome home" celebration on the beach).
const ITEMS = [
  nc(1, 'png', 'Welcome home in white', 'Guests gathered in white for a naming ceremony at Ko-Sa'),
  nc(2, 'png', 'Naming ceremony', 'A naming ceremony celebration at Ko-Sa Beach Resort'),
  nc(3, 'png', 'Honouring the moment', 'Family and friends during a naming ceremony at Ko-Sa'),
  nc(4, 'png', 'The procession', 'A procession through the Ko-Sa gardens during a naming ceremony'),
  nc(5, 'png', 'Together on the coast', 'Guests celebrating a naming ceremony by the sea at Ko-Sa'),
  nc(6, 'png', 'Drums on the sand', 'A drummer and dancers during a beach naming ceremony at Ko-Sa'),
  nc(7, 'png', 'Rhythm and welcome', 'Traditional drumming at a Ko-Sa naming ceremony'),
  nc(8, 'jpg', 'A coastal celebration', 'A naming ceremony gathering on the beach at Ko-Sa'),
  nc(9, 'png', 'Kente and the sea', 'Drummers in kente during a naming ceremony by the ocean at Ko-Sa'),
  nc(10, 'png', 'Seated in celebration', 'Guests seated under the canopy at a Ko-Sa naming ceremony'),
  // Randoms (authentic evening + communal life)
  rnd('772A4909', 'resort', 'Evening craft by lamplight', 'Children making batik craft in the evening at Ko-Sa'),
  rnd('772A4917', 'resort', 'After dark on the green', 'A child playing on the lawn at night at Ko-Sa'),
  rnd('772A4922', 'resort', 'Hands-on at the craft table', 'A guest painting at the evening craft table at Ko-Sa'),
  rnd('772A4934', 'dining', 'Dinner under the canopy', 'Guests sharing dinner under the canopy at Ko-Sa'),
  rnd('772A4935', 'dining', 'Long-table evenings', 'A long communal dinner table in the evening at Ko-Sa'),
  rnd('772A4942', 'resort', 'Conversations after dark', 'Guests talking over drinks in the evening at Ko-Sa'),
  rnd('772A4945', 'resort', 'Time together by the bar', 'A family relaxing together in the evening at Ko-Sa'),
  rnd('772A4952', 'resort', 'The welcome at the front desk', 'Ko-Sa’s host at the front desk in the evening'),
];

async function main() {
  const prisma = new PrismaClient();
  const start = (await prisma.galleryItem.aggregate({ _max: { sortOrder: true } }))._max.sortOrder ?? 0;

  const rows = [];
  let ok = 0;
  let sort = start;
  for (const it of ITEMS) {
    try {
      const { data: buf, info } = await sharp(readFileSync(join(SRC, it.src)), { failOn: 'none' })
        .rotate()
        .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 84 })
        .toBuffer({ resolveWithObject: true });
      const { error } = await supabase.storage.from(BUCKET).upload(it.dest, buf, {
        contentType: 'image/webp',
        upsert: true,
      });
      if (error) throw error;
      sort += 1;
      rows.push({
        imageUrl: `${BASE}/${it.dest}`,
        caption: it.caption,
        alt: it.alt,
        category: it.category,
        width: info.width,
        height: info.height,
        status: 'PUBLISHED',
        sortOrder: sort,
      });
      ok += 1;
      console.log(`  ok ${it.dest} (${info.width}x${info.height}, ${(buf.byteLength / 1024).toFixed(0)} KB)`);
    } catch (e) {
      console.error(`  FAIL ${it.src}: ${e.message}`);
    }
  }

  // Idempotent: drop any previous rows for exactly these URLs, then insert.
  const urls = rows.map((r) => r.imageUrl);
  const del = await prisma.galleryItem.deleteMany({ where: { imageUrl: { in: urls } } });
  const created = await prisma.galleryItem.createMany({ data: rows });

  console.log(`\nUploaded ${ok}/${ITEMS.length}. Removed ${del.count} prior row(s), created ${created.count}.`);
  const byCat = await prisma.galleryItem.groupBy({ by: ['category'], _count: true });
  console.log('Gallery now:', JSON.stringify(byCat));
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
