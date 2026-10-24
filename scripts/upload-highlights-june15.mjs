// One-off: convert + upload the two new "Highlights" images.
//   PIC 1.png  -> homepage "slowing down" (guests at the picnic table)
//   PIC 2.jpeg -> experiences page accent (beach drum circle at sunset)
// Run: node scripts/upload-highlights-june15.mjs
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'files', 'Kosa-Images', 'Editted Images to be Used', 'Highlights');

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

const MAP = [
  ['PIC 1.png', 'media/feeling/slowing-down-guests.webp'],
  ['PIC 2.jpeg', 'media/highlights/drum-circle-sunset.webp'],
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
