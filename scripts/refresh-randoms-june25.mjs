// Refresh the 8 "Randoms" gallery photos with the re-edited versions
// (files/.../Randoms/Edited/1-8.png). Same scenes already in the Gallery, so we
// upload the new edits to NEW URLs (to bust the 1-year image cache) and update
// the existing GalleryItem rows in place (matched by their stable caption),
// keeping category + caption. Idempotent. Run: node scripts/refresh-randoms-june25.mjs

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'files', 'Kosa-Images', 'Editted Images to be Used', 'Randoms', 'Edited');

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

// new file -> existing gallery row (matched by caption) + new destination path.
const MAP = [
  { png: '1.png', caption: 'Time together by the bar',        dest: 'media/gallery/randoms/v2-relaxing.webp' },
  { png: '2.png', caption: 'After dark on the green',         dest: 'media/gallery/randoms/v2-evening-green.webp' },
  { png: '3.png', caption: 'Dinner under the canopy',         dest: 'media/gallery/randoms/v2-dinner-canopy.webp' },
  { png: '4.png', caption: 'Conversations after dark',        dest: 'media/gallery/randoms/v2-conversations.webp' },
  { png: '5.png', caption: 'Long-table evenings',             dest: 'media/gallery/randoms/v2-long-table.webp' },
  { png: '6.png', caption: 'The welcome at the front desk',   dest: 'media/gallery/randoms/v2-front-desk.webp' },
  { png: '7.png', caption: 'Evening craft by lamplight',      dest: 'media/gallery/randoms/v2-craft.webp' },
  { png: '8.png', caption: 'Hands-on at the craft table',     dest: 'media/gallery/randoms/v2-painting.webp' },
];

async function main() {
  const prisma = new PrismaClient();
  let ok = 0;
  let updated = 0;
  for (const m of MAP) {
    try {
      const { data: buf, info } = await sharp(readFileSync(join(SRC, m.png)), { failOn: 'none' })
        .rotate()
        .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 84 })
        .toBuffer({ resolveWithObject: true });
      const { error } = await supabase.storage.from(BUCKET).upload(m.dest, buf, {
        contentType: 'image/webp',
        upsert: true,
      });
      if (error) throw error;
      ok += 1;

      const res = await prisma.galleryItem.updateMany({
        where: { caption: m.caption },
        data: { imageUrl: `${BASE}/${m.dest}`, width: info.width, height: info.height },
      });
      updated += res.count;
      console.log(`  ok ${m.png} -> ${m.dest} (${info.width}x${info.height}); rows updated: ${res.count} [${m.caption}]`);
    } catch (e) {
      console.error(`  FAIL ${m.png}: ${e.message}`);
    }
  }
  console.log(`\nUploaded ${ok}/${MAP.length}; gallery rows updated: ${updated}.`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
