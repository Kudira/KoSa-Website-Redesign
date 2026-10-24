// One-off: convert files/Kosa-Images/Highlights/*.JPG to WebP and upload them
// to Supabase Storage at kosa-public/media/highlights/<name>.webp.
//
// Run: node scripts/upload-highlights.mjs
//
// Conversion matches the app's upload grade (auto-rotate, max 2200px long edge,
// WebP quality 84). Uses the service-role key for direct, upsert uploads.

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC_DIR = join(ROOT, 'files', 'Kosa-Images', 'Highlights');
const DEST_PREFIX = 'media/highlights';

// ── Load required env vars from .env (this is a standalone script) ──────────
function loadEnv() {
  const raw = readFileSync(join(ROOT, '.env'), 'utf8');
  const env = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[m[1]] = v;
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = env.SUPABASE_STORAGE_BUCKET || 'kosa-public';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function destName(file) {
  // 772A1802.JPG -> highlight-772a1802.webp
  const base = file.replace(/\.[^.]+$/, '').toLowerCase();
  return `highlight-${base}.webp`;
}

async function main() {
  const files = readdirSync(SRC_DIR).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();
  console.log(`Found ${files.length} images in ${SRC_DIR}`);
  console.log(`Uploading to ${BUCKET}/${DEST_PREFIX}/\n`);

  let ok = 0;
  const urls = [];
  for (const file of files) {
    const srcPath = join(SRC_DIR, file);
    const outName = destName(file);
    const destPath = `${DEST_PREFIX}/${outName}`;
    try {
      const input = readFileSync(srcPath);
      const webp = await sharp(input, { failOn: 'none' })
        .rotate()
        .resize({ width: 2200, height: 2200, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 84 })
        .toBuffer();

      const { error } = await supabase.storage.from(BUCKET).upload(destPath, webp, {
        contentType: 'image/webp',
        upsert: true,
      });
      if (error) throw error;

      const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${destPath}`;
      urls.push(url);
      ok += 1;
      console.log(`  ✓ ${file}  ->  ${destPath}  (${(webp.byteLength / 1024).toFixed(0)} KB)`);
    } catch (e) {
      console.error(`  ✗ ${file}: ${e.message}`);
    }
  }

  console.log(`\nDone: ${ok}/${files.length} uploaded.`);
  console.log('\nPublic URLs:');
  urls.forEach((u) => console.log(u));
}

main().catch((e) => { console.error(e); process.exit(1); });
