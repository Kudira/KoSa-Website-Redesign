// Replace the photos for 4 rooms with the new shots in
// files/Kosa-Images/NEW/Rooms/**. Each PNG is optimized to WebP (rotate, max
// 2200px, q84 - same as the rest of the pipeline), uploaded to Supabase under
// rooms/<slug>/NN.webp, then the room's `image` (cover = first) and `gallery`
// (all, in order) are rewritten in the DB. Everything stays editable in the
// admin Room editor (Hero image + Gallery pickers). Idempotent.
// Run: node scripts/wire-new-rooms.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'files', 'Kosa-Images', 'NEW', 'Rooms');

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
const PUB = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;
const prisma = new PrismaClient();

// slug -> source folder + explicit file order (cover first).
const ROOMS = [
  {
    slug: 'deluxe-twin-sea-view',
    folder: 'Deluxe Twin Room with Sea View',
    files: [
      'Deluxe_Twin_Room_with_Sea_View_00001_.png',
      'Deluxe_Twin_Room_with_Sea_View_00002_.png',
      'Deluxe_Twin_Room_with_Sea_View_00003_.png',
      'Deluxe_Twin_Room_with_Sea_View_00004_.png',
      'Deluxe_Twin_Room_with_Sea_View_00005_.png',
    ],
  },
  {
    slug: 'family-room-private-bathroom',
    folder: 'Family Room with Private Bathroom',
    files: [
      'Family_Room_with_Private_Bathroom_00001_.png',
      'Family_Room_with_Private_Bathroom_00002_.png',
    ],
  },
  {
    slug: 'luxury-double-sea-view',
    folder: 'Luxury Double Room with Sea View',
    files: [
      'Luxury_Double_Room_with_Sea_View_00001_.png',
      'Luxury_Double_Room_with_Sea_View_00002_.png',
      'Luxury_Double_Room_with_Sea_View_00003_.png',
      'Deluxe_Twin_Room_with_Sea_View_00004_.png',
    ],
  },
  {
    slug: 'triple-room-private-bathroom',
    folder: 'Triple Room with Private Bathroom',
    files: [
      'Triple_Room_with_Private_Bathroom_00001_.png',
      'Triple_Room_with_Private_Bathroom_00002_.png',
      'Triple_Room_with_Private_Bathroom_00003_.png',
      'Triple_Room_with_Private_Bathroom_00004_.png',
      'Triple_Room_with_Private_Bathroom_00005_.png',
    ],
  },
];

async function main() {
  for (const room of ROOMS) {
    const dir = join(SRC, room.folder);
    const available = new Set(readdirSync(dir));
    const gallery = [];
    let n = 0;
    for (const file of room.files) {
      if (!available.has(file)) { console.warn(`  MISSING ${room.folder}/${file}`); continue; }
      n += 1;
      const webp = await sharp(join(dir, file))
        .rotate()
        .resize(2200, 2200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 84 })
        .toBuffer();
      const dest = `rooms/${room.slug}/${String(n).padStart(2, '0')}.webp`;
      const { error } = await supabase.storage.from(BUCKET).upload(dest, webp, {
        contentType: 'image/webp',
        upsert: true,
      });
      if (error) { console.error(`  FAIL ${dest}: ${error.message}`); continue; }
      gallery.push(`${PUB}/${dest}`);
      console.log(`  ok ${dest} (${(webp.length / 1024).toFixed(0)} KB)`);
    }
    if (!gallery.length) { console.error(`  no images uploaded for ${room.slug}`); continue; }
    await prisma.room.update({
      where: { slug: room.slug },
      data: { image: gallery[0], gallery },
    });
    console.log(`${room.slug}: cover + ${gallery.length} gallery set\n`);
  }
  await prisma.$disconnect();
  console.log('Done.');
}
main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
