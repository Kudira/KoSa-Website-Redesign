// Upload the new room photography + editorial content images to Supabase,
// and emit SQL to repoint each Room.image/gallery at the new uploads.
//
//   node scripts/upload-room-and-content.mjs
//   npx prisma db execute --file scripts/update-room-images.sql --schema prisma/schema.prisma
//
// Rooms: files/Kosa-Images/Edited/Actual Rooms/<Room Name>/*.png -> rooms/<slug>/
// Content: feeling + banner + 3 sea-view editorial covers.

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const EDITED = join(ROOT, 'files', 'Kosa-Images', 'Edited');
const ROOMS_DIR = join(EDITED, 'Actual Rooms');
const CONTENT_DIR = join(EDITED, 'Content');

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

const FOLDER_TO_SLUG = {
  'Deluxe Double Room with Sea View': 'deluxe-double-sea-view',
  'Deluxe Twin Room with Sea View': 'deluxe-twin-sea-view',
  'Double Room with Garden View': 'double-room-garden-view',
  'Family Room with Private Bathroom': 'family-room-private-bathroom',
  'Luxury Double Room with Sea View': 'luxury-double-sea-view',
  'Traveling Palm Double Garden Room': 'traveling-palm-double-garden',
  'Traveling Palm Twin Garden Room': 'traveling-palm-twin-garden',
  'Triple Room with Private Bathroom': 'triple-room-private-bathroom',
  'Twin Room with Garden View': 'twin-room-garden-view',
};

// Editorial single-shot covers (Content/"Room that belongs to coast").
const CONTENT_COVER = {
  'DeluxeDoubleRoomWithSeaView': 'deluxe-double-sea-view',
  'DeluxeTwinWithSeaView': 'deluxe-twin-sea-view',
  'luxuryDoubleRoomWithSeaView': 'luxury-double-sea-view',
};

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const slugFile = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function toWebp(absPath) {
  return sharp(readFileSync(absPath), { failOn: 'none' })
    .rotate()
    .resize({ width: 2200, height: 2200, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 84 })
    .toBuffer();
}

async function upload(destPath, buf) {
  const { error } = await supabase.storage.from(BUCKET).upload(destPath, buf, {
    contentType: 'image/webp',
    upsert: true,
  });
  if (error) throw error;
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${destPath}`;
}

async function main() {
  const roomImages = {}; // slug -> { cover, gallery: [] }
  for (const slug of Object.values(FOLDER_TO_SLUG)) roomImages[slug] = { cover: null, gallery: [] };

  // ── 1. Room folders ───────────────────────────────────────────────────
  for (const [folder, slug] of Object.entries(FOLDER_TO_SLUG)) {
    const dir = join(ROOMS_DIR, folder);
    if (!existsSync(dir)) { console.warn('missing room folder:', folder); continue; }
    const roomKey = norm(folder);
    const files = readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
    // Order: this room's own photos first (so the cover is correct), then any strays.
    files.sort((a, b) => {
      const am = norm(a).startsWith(roomKey) ? 0 : 1;
      const bm = norm(b).startsWith(roomKey) ? 0 : 1;
      return am - bm || a.localeCompare(b);
    });
    let idx = 1;
    for (const f of files) {
      const buf = await toWebp(join(dir, f));
      const destPath = `rooms/${slug}/${String(idx).padStart(2, '0')}-${slugFile(basename(f, extname(f)))}.webp`;
      const url = await upload(destPath, buf);
      roomImages[slug].gallery.push(url);
      console.log(`  ✓ ${destPath} (${(buf.byteLength / 1024).toFixed(0)} KB)`);
      idx += 1;
    }
    roomImages[slug].cover = roomImages[slug].gallery[0] ?? null;
  }

  // ── 2. Content: editorial sea-view covers (take priority as cover) ──────
  const coverDir = join(CONTENT_DIR, 'Room that belongs to coast');
  if (existsSync(coverDir)) {
    for (const f of readdirSync(coverDir).filter((x) => /\.(png|jpe?g|webp)$/i.test(x))) {
      const base = basename(f, extname(f));
      const slug = CONTENT_COVER[base];
      if (!slug) { console.warn('unmapped content cover:', f); continue; }
      const buf = await toWebp(join(coverDir, f));
      const destPath = `rooms/${slug}/00-cover.webp`;
      const url = await upload(destPath, buf);
      roomImages[slug].cover = url;
      roomImages[slug].gallery = [url, ...roomImages[slug].gallery.filter((u) => u !== url)];
      console.log(`  ✓ ${destPath} (editorial cover) (${(buf.byteLength / 1024).toFixed(0)} KB)`);
    }
  }

  // ── 3. Content: Feeling section + banners ───────────────────────────────
  const out = { feeling: null, banners: [] };
  const feelDir = join(CONTENT_DIR, 'This is what slowing down looks like');
  if (existsSync(feelDir)) {
    for (const f of readdirSync(feelDir).filter((x) => /\.(png|jpe?g|webp)$/i.test(x))) {
      const buf = await toWebp(join(feelDir, f));
      out.feeling = await upload(`media/feeling/${slugFile(basename(f, extname(f)))}.webp`, buf);
      console.log(`  ✓ media/feeling (${(buf.byteLength / 1024).toFixed(0)} KB)`);
    }
  }
  const bannerDir = join(CONTENT_DIR, 'banner');
  if (existsSync(bannerDir)) {
    for (const f of readdirSync(bannerDir).filter((x) => /\.(png|jpe?g|webp)$/i.test(x)).sort()) {
      const buf = await toWebp(join(bannerDir, f));
      const url = await upload(`media/banner/${slugFile(basename(f, extname(f)))}.webp`, buf);
      out.banners.push(url);
      console.log(`  ✓ media/banner/${slugFile(basename(f, extname(f)))}.webp (${(buf.byteLength / 1024).toFixed(0)} KB)`);
    }
  }

  // ── 4. Emit SQL to repoint Room.image + Room.gallery ────────────────────
  const lines = ['-- Repoint room images to the new uploads. Generated by upload-room-and-content.mjs'];
  for (const [slug, { cover, gallery }] of Object.entries(roomImages)) {
    if (!cover || gallery.length === 0) { console.warn('no images for', slug); continue; }
    const arr = gallery.map((u) => `'${u.replace(/'/g, "''")}'`).join(', ');
    lines.push(
      `UPDATE "Room" SET "image" = '${cover}', "gallery" = ARRAY[${arr}]::text[], "updatedAt" = now() WHERE "slug" = '${slug}';`,
    );
  }
  const sqlPath = join(ROOT, 'scripts', 'update-room-images.sql');
  writeFileSync(sqlPath, lines.join('\n') + '\n', 'utf8');

  console.log('\nWrote', sqlPath);
  console.log('\n--- WIRE THESE INTO COMPONENTS ---');
  console.log('Feeling image:', out.feeling);
  console.log('Banner image(s):', out.banners.join('\n               '));
}

main().catch((e) => { console.error(e); process.exit(1); });
