// Standardize the brand name to "Ko Sa" in user-facing DB content. Applies only
// to text fields (never imageUrl / slug / URL fields) and the per-locale
// translations JSON. Uses the same guarded patterns as the source pass so URLs
// and identifiers are never touched. Idempotent.
// Run: node scripts/standardize-brand-db.mjs
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Display brand is "KoSa" (no space/hyphen). Identifiers (kosa-public bucket,
// ko-sa.com, kosa-breeze slug, kosa-shimmer CSS) stay lowercase and are guarded.
const HY = /(?<![/\w-])(?:Ko-Sa|KO-SA|Ko-sa|Ko-SA)(?![\w])/g;
const NH = /(?<![/\w-])(?:Kosa|KOSA)(?![-\w])(?! Brand)/g;
const SP = /Ko Sa/g;
const isUrlish = (s) => /https?:\/\/|:\/\//i.test(s) || s.startsWith('/') || /\.(com|webp|jpg|jpeg|png|mp4|svg)\b/i.test(s);
const fixStr = (s) => (typeof s === 'string' && !isUrlish(s) ? s.replace(HY, 'KoSa').replace(NH, 'KoSa').replace(SP, 'KoSa') : s);
const deep = (v) => {
  if (typeof v === 'string') return fixStr(v);
  if (Array.isArray(v)) return v.map(deep);
  if (v && typeof v === 'object') {
    const o = {};
    for (const [k, val] of Object.entries(v)) o[k] = deep(val);
    return o;
  }
  return v;
};
const changed = (a, b) => JSON.stringify(a) !== JSON.stringify(b);

const MODELS = {
  room: ['name', 'tagline', 'description'],
  journalPost: ['title', 'excerpt', 'body'],
  galleryItem: ['caption', 'alt'],
  experience: ['label', 'title', 'description'],
  treatment: ['name', 'description', 'category'],
  diningVenue: ['name', 'tagline', 'description', 'hours'],
  menuSection: ['name', 'description'],
  menuItem: ['name', 'description'],
  testimonial: ['quote'],
  dailyActivity: ['title', 'description', 'tag'],
  stayEnhancement: ['name', 'description', 'priceNote'],
  wellnessPackage: ['name', 'tagline', 'category', 'durationLabel', 'inclusions'],
  event: ['title', 'description', 'location'],
};

async function main() {
  let total = 0;
  for (const [model, fields] of Object.entries(MODELS)) {
    let rows;
    try { rows = await prisma[model].findMany(); } catch { continue; }
    for (const r of rows) {
      const data = {};
      for (const f of fields) {
        if (r[f] == null) continue;
        const nv = deep(r[f]);
        if (changed(r[f], nv)) data[f] = nv;
      }
      if (r.translations != null) {
        const nt = deep(r.translations);
        if (changed(r.translations, nt)) data.translations = nt;
      }
      if (Object.keys(data).length) {
        await prisma[model].update({ where: { id: r.id }, data });
        total += Object.keys(data).length;
        console.log(`  ${model}#${r.id}: ${Object.keys(data).join(', ')}`);
      }
    }
  }
  // Site settings JSON (skip URL-ish leaves automatically).
  const settings = await prisma.siteSetting.findMany();
  for (const s of settings) {
    const nv = deep(s.value);
    if (changed(s.value, nv)) {
      await prisma.siteSetting.update({ where: { key: s.key }, data: { value: nv } });
      total += 1;
      console.log(`  siteSetting[${s.key}]: value`);
    }
  }
  console.log(`\nDone. ${total} field(s) updated.`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
