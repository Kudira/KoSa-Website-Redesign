// Optimize + upload the new Dine photography (files/Kosa-Images/NEW/Dine/Edited)
// to Supabase under media/dining/. The dining page references these URLs
// (hero + the four sections + two full-width bands), consistent with every
// other page hero. Idempotent. Run: node scripts/wire-new-dining.mjs
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'files', 'Kosa-Images', 'NEW', 'Dine', 'Edited');

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

// source file -> dest under media/dining/
const MAP = [
  ['Banner 3.png', 'hero-plantain-platter.webp'],
  ['The Restaurant.png', 'the-restaurant.webp'],
  ['The Bar.png', 'the-bar.webp'],
  ['Breakfast.png', 'breakfast.webp'],
  ['Private And Beach dining.png', 'private-beach-dining-v2.webp'],
  ['Banner 1.png', 'band-seafood-fruit.webp'],
  ['Banner 2.png', 'band-grilled-platter.webp'],
];

async function main() {
  let ok = 0;
  for (const [src, name] of MAP) {
    const webp = await sharp(join(SRC, src))
      .rotate()
      .resize(2400, 2400, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 84 })
      .toBuffer();
    const dest = `media/dining/${name}`;
    const { error } = await supabase.storage.from(BUCKET).upload(dest, webp, {
      contentType: 'image/webp',
      upsert: true,
    });
    if (error) { console.error(`  FAIL ${dest}: ${error.message}`); continue; }
    ok += 1;
    console.log(`  ok ${dest} (${(webp.length / 1024).toFixed(0)} KB)`);
  }
  console.log(`\nUploaded ${ok}/${MAP.length}.`);
}
main().catch((e) => { console.error(e); process.exit(1); });
