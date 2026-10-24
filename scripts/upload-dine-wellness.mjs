// One-off: convert the new Dine + Wellness images (files/Kosa-Images/
// "Editted Images to be Used") to WebP and upload to Supabase Storage under
// media/dining/ and media/wellness/ with clean, descriptive names.
//
// Run: node scripts/upload-dine-wellness.mjs
//
// Conversion matches the app's grade: auto-rotate, max 2200px, WebP q84.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

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
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = env.SUPABASE_STORAGE_BUCKET || 'kosa-public';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// source (relative to SRC) -> destination path in the bucket
const MAP = [
  // Dine
  ['Dine/Edited/Banner 1.png', 'media/dining/banner-1.webp'],
  ['Dine/Edited/Banner 2.png', 'media/dining/banner-2.webp'],
  ['Dine/Edited/Banner 3.png', 'media/dining/banner-3.webp'],
  ['Dine/Edited/The Restaurant.png', 'media/dining/the-restaurant.webp'],
  ['Dine/Edited/The Bar.png', 'media/dining/the-bar.webp'],
  ['Dine/Edited/Breakfast.png', 'media/dining/breakfast.webp'],
  ['Dine/Edited/Private And Beach dining.png', 'media/dining/private-and-beach-dining.webp'],
  // Wellness
  ['Wellness/Edited/Banner.png', 'media/wellness/banner.webp'],
  ['Wellness/Edited/spaServices.png', 'media/wellness/spa-services.webp'],
  ['Wellness/Edited/kosaTeaBar.png', 'media/wellness/kosa-tea-bar.webp'],
  ['Wellness/Edited/bodyMindandSpirit.png', 'media/wellness/yoga-by-the-sea.webp'],
  ['Wellness/Edited/benefits-of-wellness-top-left-image.png', 'media/wellness/wellness-journeys.webp'],
  ['Wellness/Edited/benefits-of-wellness-bottom-left-image.png', 'media/wellness/coaching-stillness.webp'],
  ['Wellness/Edited/ChatGPT Image Jun 10, 2026, 06_35_55 AM (1).png', 'media/wellness/palm-grove-loungers.webp'],
];

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
  console.log(`\nDone: ${ok}/${MAP.length} uploaded to ${BUCKET}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
