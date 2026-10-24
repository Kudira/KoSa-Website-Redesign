// Remove the trailing full stop from one-liner / sub-heading DB fields
// (package taglines, daily-activity tags, menu-section subtitles, venue
// taglines) while keeping internal punctuation and never touching full
// sentences/body copy. Also fixes the per-locale translations JSON for those
// fields. Idempotent. Run: node scripts/strip-db-oneliner-periods.mjs
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const needs = (s) => typeof s === 'string' && /[^.]\.\s*$/.test(s) && !s.trim().endsWith('...');
const strip = (s) => (needs(s) ? s.replace(/\.\s*$/, '') : s);

const MODELS = {
  wellnessPackage: ['tagline'],
  dailyActivity: ['tag'],
  menuSection: ['description'],
  diningVenue: ['tagline'],
};

async function main() {
  let total = 0;
  for (const [model, fields] of Object.entries(MODELS)) {
    let rows;
    try { rows = await prisma[model].findMany(); } catch { continue; }
    for (const r of rows) {
      const data = {};
      for (const f of fields) if (needs(r[f])) data[f] = strip(r[f]);
      // per-locale translations JSON: { fr: { tagline: '...' }, ... }
      if (r.translations && typeof r.translations === 'object') {
        let changed = false;
        const tr = JSON.parse(JSON.stringify(r.translations));
        for (const loc of Object.keys(tr)) {
          if (tr[loc] && typeof tr[loc] === 'object') {
            for (const f of fields) {
              if (needs(tr[loc][f])) { tr[loc][f] = strip(tr[loc][f]); changed = true; }
            }
          }
        }
        if (changed) data.translations = tr;
      }
      if (Object.keys(data).length) {
        await prisma[model].update({ where: { id: r.id }, data });
        total += Object.keys(data).length;
        console.log(`  ${model}#${r.id}: ${Object.keys(data).join(', ')}`);
      }
    }
  }
  console.log(`\nDone. ${total} field(s) updated.`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
