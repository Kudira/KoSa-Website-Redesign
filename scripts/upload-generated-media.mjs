// Upload the generated media images (public/media/**, excluding video/) to
// Supabase Storage under the same media/... paths, so the site serves them from
// the CDN and they can be re-managed from the admin dashboard. They are already
// optimized WebP, so bytes are uploaded as-is. Run: node scripts/upload-generated-media.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MEDIA = join(ROOT, 'public', 'media');

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

function walk(dir, acc) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'video') walk(p, acc); }
    else if (/\.(webp|jpe?g|png)$/i.test(e.name)) acc.push(p);
  }
}

async function main() {
  const files = [];
  walk(MEDIA, files);
  let ok = 0;
  for (const f of files) {
    const dest = 'media/' + relative(MEDIA, f).split('\\').join('/'); // e.g. media/packages/kosa-reset.webp
    const { error } = await supabase.storage.from(BUCKET).upload(dest, readFileSync(f), {
      contentType: 'image/webp',
      upsert: true,
    });
    if (error) { console.error('  FAIL ' + dest + ': ' + error.message); continue; }
    ok += 1;
    console.log(`  ok ${dest} (${(statSync(f).size / 1024).toFixed(0)} KB)`);
  }
  console.log(`\nUploaded ${ok}/${files.length} to ${BASE}/media/`);
}
main().catch((e) => { console.error(e); process.exit(1); });
