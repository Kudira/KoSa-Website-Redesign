// One-off: upload the "Welcome Home" promo video + a poster still to Supabase
// Storage. The default bucket cap is 50MB and the video is ~63MB, so we first
// raise the bucket file-size limit. Poster is generated from a naming-ceremony
// photo (matches the video's content). Run: node scripts/upload-welcome-video.mjs

import { readFileSync, statSync } from 'node:fs';
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
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const BUCKET = env.SUPABASE_STORAGE_BUCKET || 'kosa-public';
const BASE = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;

const VIDEO_SRC = join(SRC, 'kosa-welcome-home.mp4');
const POSTER_SRC = join(SRC, 'Naming Ceremony', 'Edited', '6.png');
const VIDEO_DEST = 'media/video/kosa-welcome-home.mp4';
const POSTER_DEST = 'media/video/welcome-home-poster.webp';

async function main() {
  // 1. Raise the bucket file-size limit so the ~63MB video is accepted.
  const { error: upErr } = await supabase.storage.updateBucket(BUCKET, {
    public: true,
    fileSizeLimit: '150MB',
  });
  if (upErr) throw new Error(`updateBucket: ${upErr.message}`);
  console.log('bucket file-size limit raised to 150MB');

  // 2. Poster (16:9-friendly, matches the on-screen video frame).
  const posterBuf = await sharp(readFileSync(POSTER_SRC), { failOn: 'none' })
    .rotate()
    .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 84 })
    .toBuffer();
  {
    const { error } = await supabase.storage.from(BUCKET).upload(POSTER_DEST, posterBuf, {
      contentType: 'image/webp',
      upsert: true,
    });
    if (error) throw new Error(`poster upload: ${error.message}`);
    console.log(`  ok ${POSTER_DEST} (${(posterBuf.byteLength / 1024).toFixed(0)} KB)`);
  }

  // 3. Video (uploaded as-is; ~63MB).
  const videoBuf = readFileSync(VIDEO_SRC);
  const mb = (statSync(VIDEO_SRC).size / 1024 / 1024).toFixed(1);
  {
    const { error } = await supabase.storage.from(BUCKET).upload(VIDEO_DEST, videoBuf, {
      contentType: 'video/mp4',
      upsert: true,
      cacheControl: '31536000',
    });
    if (error) throw new Error(`video upload: ${error.message}`);
    console.log(`  ok ${VIDEO_DEST} (${mb} MB)`);
  }

  console.log('\nURLs:');
  console.log('  poster:', `${BASE}/${POSTER_DEST}`);
  console.log('  video :', `${BASE}/${VIDEO_DEST}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
