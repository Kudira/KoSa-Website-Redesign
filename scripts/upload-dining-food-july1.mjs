// Convert + upload the selected dining photos with purposeful names. New
// filenames bust the 1-year image cache. WebP q84, max 2200px, auto-rotate.
// Run: node scripts/upload-dining-food-july1.mjs
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'files', 'Kosa-Images', 'Ko-Sa Edited-Food');

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

// source file -> purposeful destination (dining page slot).
const MAP = [
  ['IMG_7766.jpg', 'media/dining/hero-seafood-grill.webp'],          // page hero
  ['IMG_7759.jpg', 'media/dining/the-restaurant-jollof-chicken.webp'], // The Restaurant
  ['IMG_6839.jpg', 'media/dining/the-bar-cocktails.webp'],           // The Bar
  ['IMG_7196.jpg', 'media/dining/breakfast-pancakes.webp'],          // Breakfast
  ['IMG_7955.jpg', 'media/dining/private-beach-dining.webp'],        // Private & Beach Dining
];

async function main() {
  let ok = 0;
  for (const [rel, dest] of MAP) {
    const { data: buf, info } = await sharp(readFileSync(join(SRC, rel)), { failOn: 'none' })
      .rotate()
      .resize({ width: 2200, height: 2200, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 84 })
      .toBuffer({ resolveWithObject: true });
    const { error } = await supabase.storage.from(BUCKET).upload(dest, buf, {
      contentType: 'image/webp',
      upsert: true,
    });
    if (error) throw error;
    ok += 1;
    console.log(`  ok ${dest} (${info.width}x${info.height}, ${(buf.byteLength / 1024).toFixed(0)} KB)`);
  }
  console.log(`\nUploaded ${ok}/${MAP.length} to ${BASE}/media/dining/`);
}
main().catch((e) => { console.error(e); process.exit(1); });
