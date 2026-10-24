// Replace the two Traveling Palm rooms' photos with the new edited images.
// Uploads to NEW filenames (busts the 1-year image cache) and repoints each
// room's image + gallery. Run: node scripts/upload-traveling-palm-july1.mjs
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'files', 'Kosa-Images', 'Editted Images to be Used', 'Stays', 'Actual Rooms');

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

// slug -> ordered source files (relative to SRC). First becomes the hero image.
const ROOMS = {
  'traveling-palm-double-garden': ['Traveling Palm Double Garden Room/Traveling_Palm_Double_Garden_Room_00001_.png'],
  'traveling-palm-twin-garden': [
    'Traveling Palm Twin Garden Room/Traveling_Palm_Twin_Garden_Room_00001_.png',
    'Traveling Palm Twin Garden Room/Traveling_Palm_Twin_Garden_Room_00002_.png',
  ],
};

async function main() {
  const prisma = new PrismaClient();
  for (const [slug, files] of Object.entries(ROOMS)) {
    const urls = [];
    for (let i = 0; i < files.length; i++) {
      const buf = await sharp(readFileSync(join(SRC, files[i])), { failOn: 'none' })
        .rotate()
        .resize({ width: 2200, height: 2200, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 84 })
        .toBuffer();
      const dest = `rooms/${slug}/v2-0${i + 1}.webp`;
      const { error } = await supabase.storage.from(BUCKET).upload(dest, buf, {
        contentType: 'image/webp',
        upsert: true,
      });
      if (error) throw error;
      urls.push(`${BASE}/${dest}`);
      console.log(`  ok ${dest} (${(buf.byteLength / 1024).toFixed(0)} KB)`);
    }
    const res = await prisma.room.updateMany({
      where: { slug },
      data: { image: urls[0], gallery: urls },
    });
    console.log(`  room ${slug}: image + ${urls.length} gallery image(s) (updated ${res.count})`);
  }
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
