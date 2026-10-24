// Replace em-dashes (—) with a spaced hyphen ( - ) in all user-facing DB content
// (project rule: avoid "—"). Idempotent: only rows containing "—" are touched.
// Run: node scripts/fix-emdash-db.mjs
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const fix = (s) => (typeof s === 'string' ? s.replace(/\s*—\s*/g, ' - ') : s);
const deep = (v) => {
  if (typeof v === 'string') return fix(v);
  if (Array.isArray(v)) return v.map(deep);
  if (v && typeof v === 'object') {
    const o = {};
    for (const [k, val] of Object.entries(v)) o[k] = deep(val);
    return o;
  }
  return v;
};
const hasDash = (v) => JSON.stringify(v ?? '').includes('—');

const MODELS = {
  journalPost: ['title', 'excerpt', 'body'],
  galleryItem: ['caption', 'alt'],
  room: ['name', 'tagline', 'description'],
  experience: ['label', 'title', 'description'],
  treatment: ['name', 'description', 'category'],
  diningVenue: ['name', 'tagline', 'description', 'hours'],
  menuSection: ['name', 'description'],
  menuItem: ['name', 'description'],
  testimonial: ['quote'],
  dailyActivity: ['title', 'description', 'tag'],
  stayEnhancement: ['name', 'description', 'priceNote'],
  wellnessPackage: ['name', 'tagline', 'category', 'durationLabel', 'inclusions'],
  event: ['title', 'description'],
};

async function main() {
  let total = 0;
  for (const [model, fields] of Object.entries(MODELS)) {
    let rows;
    try { rows = await prisma[model].findMany(); } catch { continue; }
    for (const r of rows) {
      const data = {};
      for (const f of fields) if (hasDash(r[f])) data[f] = deep(r[f]);
      if (r.translations !== undefined && hasDash(r.translations)) data.translations = deep(r.translations);
      if (Object.keys(data).length) {
        await prisma[model].update({ where: { id: r.id }, data });
        total += Object.keys(data).length;
        console.log(`  ${model}#${r.id}: fixed ${Object.keys(data).join(', ')}`);
      }
    }
  }
  // Site settings (JSON blobs)
  const settings = await prisma.siteSetting.findMany();
  for (const s of settings) {
    if (hasDash(s.value)) {
      await prisma.siteSetting.update({ where: { key: s.key }, data: { value: deep(s.value) } });
      total += 1;
      console.log(`  siteSetting[${s.key}]: fixed`);
    }
  }
  console.log(`\nDone. ${total} field(s) updated.`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
