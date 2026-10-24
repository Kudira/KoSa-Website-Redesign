// One-off (June 16 2026): convert + upload the new edited Experiences / Wellness
// / Plan images and the new Dine banner, then point the 4 CMS experiences at
// their new photos. WebP q84, max 2200px, auto-rotate. Idempotent (upsert + by
// slug). Run: node scripts/upload-images-june16.mjs

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

// source (relative to SRC) -> destination path in the bucket
const MAP = [
  // Experiences (new)
  ['Experiences/Edited/Banner_GhanaBeginsHere_can you make a sunrise shot.jpeg', 'media/experiences/banner.webp'],
  ['Experiences/Edited/On-The-Property.jpeg', 'media/experiences/on-the-property.webp'],
  ['Experiences/Edited/IntoGhana.png', 'media/experiences/into-ghana.webp'],
  ['Experiences/Edited/RitualsOfTheShore.jpeg', 'media/experiences/rituals-of-the-shore.webp'],
  ['Experiences/Edited/whereTheAtlanticSings.jpeg', 'media/experiences/where-the-atlantic-sings.webp'],
  ['Experiences/Edited/CoastOnThePlate.jpeg', 'media/experiences/coast-on-the-plate.webp'],
  // Wellness (refreshed edits -> same destinations the wellness page uses)
  ['Wellness/Edited/Banner.png', 'media/wellness/banner.webp'],
  ['Wellness/Edited/spaServices.png', 'media/wellness/spa-services.webp'],
  ['Wellness/Edited/kosaTeaBar.png', 'media/wellness/kosa-tea-bar.webp'],
  ['Wellness/Edited/bodyMindandSpirit.png', 'media/wellness/yoga-by-the-sea.webp'],
  ['Wellness/Edited/benefits-of-wellness-top-left-image.png', 'media/wellness/wellness-journeys.webp'],
  ['Wellness/Edited/benefits-of-wellness-bottom-left-image.png', 'media/wellness/coaching-stillness.webp'],
  ['Wellness/Edited/ChatGPT Image Jun 10, 2026, 06_35_55 AM (1).png', 'media/wellness/palm-grove-loungers.webp'],
  // Dine banner (new)
  ['dine-banner.png', 'media/dining/banner-main.webp'],
];

// experience slug -> new image bucket path
const EXPERIENCE_IMG = {
  wellness: 'media/experiences/rituals-of-the-shore.webp',
  ocean: 'media/experiences/where-the-atlantic-sings.webp',
  dining: 'media/experiences/coast-on-the-plate.webp',
  cultural: 'media/experiences/into-ghana.webp',
};

async function main() {
  let ok = 0;
  for (const [rel, dest] of MAP) {
    try {
      const buf = await sharp(readFileSync(join(SRC, rel)), { failOn: 'none' })
        .rotate()
        .resize({ width: 2200, height: 2200, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 84 })
        .toBuffer();
      const { error } = await supabase.storage.from(BUCKET).upload(dest, buf, {
        contentType: 'image/webp',
        upsert: true,
      });
      if (error) throw error;
      ok += 1;
      console.log(`  ok ${dest} (${(buf.byteLength / 1024).toFixed(0)} KB)`);
    } catch (e) {
      console.error(`  FAIL ${rel}: ${e.message}`);
    }
  }
  console.log(`\nUploaded ${ok}/${MAP.length}.`);

  const prisma = new PrismaClient();
  let updated = 0;
  for (const [slug, path] of Object.entries(EXPERIENCE_IMG)) {
    const res = await prisma.experience.updateMany({
      where: { slug },
      data: { image: `${BASE}/${path}` },
    });
    updated += res.count;
    console.log(`  experience ${slug} -> ${path} (${res.count})`);
  }
  console.log(`\nUpdated ${updated} experience image(s).`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
