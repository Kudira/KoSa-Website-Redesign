// Convert a local folder of images to WebP and upload them to Supabase Storage.
//
// Usage:
//   node scripts/upload-images.mjs --src "files/Kosa-Images/<folder>" --dest "rooms/<room-slug>"
//   node scripts/upload-images.mjs --src "files/Kosa-Images/<folder>" --dest "media/<section>" --prefix "section-"
//
// Recurses into subfolders: each subfolder becomes a sub-path under --dest, so
// you can drop a Drive folder that has one subfolder per room and run it once
// with --dest rooms (each subfolder -> rooms/<subfolder-slug>/...).
//
// Flags:
//   --src     local source directory (required)
//   --dest    destination path prefix inside the bucket (required)
//   --prefix  optional filename prefix (e.g. "highlight-")
//   --bucket  storage bucket (default from env SUPABASE_STORAGE_BUCKET)
//   --flat    do NOT recurse; upload only files directly in --src
//
// Conversion matches the app's grade: auto-rotate, max 2200px, WebP quality 84.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function arg(name, fallback = undefined) {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1];
  if (i !== -1) return true; // boolean flag
  return fallback;
}

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

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function collect(dir, recurse) {
  // returns [{ abs, relDir }] where relDir is the sub-path under src
  const out = [];
  function walk(abs, rel) {
    for (const entry of readdirSync(abs)) {
      const full = join(abs, entry);
      const st = statSync(full);
      if (st.isDirectory()) {
        if (recurse) walk(full, rel ? `${rel}/${slug(entry)}` : slug(entry));
      } else if (/\.(jpe?g|png|webp|heic|heif|tiff?)$/i.test(entry)) {
        out.push({ abs: full, relDir: rel });
      }
    }
  }
  walk(dir, '');
  return out;
}

async function main() {
  const srcArg = arg('src');
  const destArg = arg('dest');
  const prefix = arg('prefix', '') === true ? '' : arg('prefix', '');
  const flat = arg('flat', false) === true;
  if (!srcArg || !destArg) {
    console.error('Required: --src <dir> --dest <bucket-path>');
    process.exit(1);
  }

  const env = loadEnv();
  const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
  const BUCKET = arg('bucket', env.SUPABASE_STORAGE_BUCKET || 'kosa-public');
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  const SRC = join(ROOT, srcArg);
  const DEST = destArg.replace(/(^\/+|\/+$)/g, '');
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const files = collect(SRC, !flat).sort((a, b) => a.abs.localeCompare(b.abs));
  console.log(`Found ${files.length} images in ${SRC}`);
  console.log(`Uploading to ${BUCKET}/${DEST}/\n`);

  let ok = 0;
  const urls = [];
  for (const { abs, relDir } of files) {
    const base = slug(basename(abs, extname(abs)));
    const folderPath = relDir ? `${DEST}/${relDir}` : DEST;
    const destPath = `${folderPath}/${prefix}${base}.webp`;
    try {
      const webp = await sharp(readFileSync(abs), { failOn: 'none' })
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
      console.log(`  ✓ ${destPath}  (${(webp.byteLength / 1024).toFixed(0)} KB)`);
    } catch (e) {
      console.error(`  ✗ ${abs}: ${e.message}`);
    }
  }

  console.log(`\nDone: ${ok}/${files.length} uploaded.\n`);
  urls.forEach((u) => console.log(u));
}

main().catch((e) => { console.error(e); process.exit(1); });
