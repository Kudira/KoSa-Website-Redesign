// Wire the batch-2 generated images end-to-end:
//   1. Upload public/media-batch2/** to Supabase Storage under media/... (CDN).
//   2. Point the DB (treatments / events / blog posts / cultural experience) at
//      the Supabase URLs so the repeated fallback photos disappear. Every one of
//      these is editable afterwards from the admin dashboard (image pickers).
// The wellness-offering images (page-design) are hardcoded in the wellness page,
// like the heroes, and handled there.
// Idempotent. Run: node scripts/wire-media-batch2.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MEDIA = join(ROOT, 'public', 'media-batch2');

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
const BASE = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/media`;
const prisma = new PrismaClient();

function walk(dir, acc) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(webp|jpe?g|png)$/i.test(e.name)) acc.push(p);
  }
}

async function upload() {
  const files = [];
  walk(MEDIA, files);
  let ok = 0;
  for (const f of files) {
    const dest = 'media/' + relative(MEDIA, f).split('\\').join('/');
    const { error } = await supabase.storage.from(BUCKET).upload(dest, readFileSync(f), {
      contentType: 'image/webp',
      upsert: true,
    });
    if (error) { console.error('  FAIL ' + dest + ': ' + error.message); continue; }
    ok += 1;
    console.log(`  ok ${dest} (${(statSync(f).size / 1024).toFixed(0)} KB)`);
  }
  console.log(`Uploaded ${ok}/${files.length}\n`);
}

// Blog slug -> image filename (slug != filename in a few cases)
const BLOG = {
  'the-art-of-slowing-down': 'art-of-slowing-down',
  'a-day-in-the-canopy-kakum-and-beyond': 'kakum-canopy',
  'hands-on-ghana-cooking-drumming-and-craft': 'hands-on-ghana',
  'wellness-the-ko-sa-way': 'wellness-the-kosa-way',
  'eco-luxury-what-it-really-means': 'eco-luxury',
};
// Event title -> image filename
const EVENTS = {
  'Cooking Class': 'cooking-class',
  'Drumming and Dancing': 'drumming-dancing',
  'Castle Tours': 'castle-tours',
  'Market Tour': 'market-tour',
  'Batik Making': 'batik-making',
  'Painting Class': 'painting-class',
  'Horse Back Riding': 'horse-riding',
};

async function wireDb() {
  // Treatments: image filename = slug with any -45/-60 duration suffix stripped.
  const treatments = await prisma.treatment.findMany({ select: { id: true, slug: true } });
  let t = 0;
  for (const tr of treatments) {
    const base = tr.slug.replace(/-(45|60)$/, '');
    await prisma.treatment.update({ where: { id: tr.id }, data: { image: `${BASE}/wellness/treatments/${base}.webp` } });
    t += 1;
  }
  console.log(`treatments: ${t} rows set`);

  // Events
  let e = 0;
  for (const [title, file] of Object.entries(EVENTS)) {
    const r = await prisma.event.updateMany({ where: { title }, data: { image: `${BASE}/events/${file}.webp` } });
    if (r.count) e += r.count; else console.warn(`  event not found: ${title}`);
  }
  console.log(`events: ${e} set`);

  // Blog posts
  let b = 0;
  for (const [slug, file] of Object.entries(BLOG)) {
    const r = await prisma.journalPost.updateMany({ where: { slug }, data: { image: `${BASE}/blog/${file}.webp` } });
    if (r.count) b += r.count; else console.warn(`  blog post not found: ${slug}`);
  }
  console.log(`blog: ${b} set`);

  // Cultural experience
  const c = await prisma.experience.updateMany({ where: { slug: 'cultural' }, data: { image: `${BASE}/experiences/cultural-rituals.webp` } });
  console.log(`cultural experience: ${c.count} set`);
}

async function main() {
  await upload();
  await wireDb();
  await prisma.$disconnect();
  console.log('\nDone.');
}
main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
