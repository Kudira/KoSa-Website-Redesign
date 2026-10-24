// Point the CMS content at the generated (Supabase-hosted) images:
// wellness packages, events, and one representative daily activity per day.
// Idempotent; images remain editable from the admin dashboard. Run:
//   node scripts/set-media-images.mjs
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
function env(k) {
  const raw = readFileSync(join(ROOT, '.env'), 'utf8');
  const m = raw.match(new RegExp('^\\s*' + k + '\\s*=\\s*(.*)\\s*$', 'm'));
  let v = m ? m[1].trim() : '';
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  return v;
}
const BASE = `${env('NEXT_PUBLIC_SUPABASE_URL')}/storage/v1/object/public/${env('SUPABASE_STORAGE_BUCKET') || 'kosa-public'}/media`;
const prisma = new PrismaClient();

const PACKAGES = {
  'Weekend Getaway': 'weekend-getaway',
  'The KoSa Reset': 'kosa-reset',
  'The KoSa Romance': 'kosa-romance',
  'The Proposal Experience': 'proposal-experience',
  'Birthday Celebration': 'birthday-celebration',
  'Heritage and Soul Retreat': 'heritage-soul-retreat',
  'The KoSa Day Pass': 'kosa-day-pass',
  'The Slow Beach Escape': 'slow-beach-escape',
};
const EVENTS = {
  'Weddings & Celebrations': 'weddings',
  'Naming Ceremony': 'naming-ceremony',
  'Guided City Tour': 'city-tour',
  'Kakum Tour': 'kakum-tour',
  'Bead Making Class': 'bead-making',
  'Bird Watching': 'bird-watching',
  'Market Tour with Cooking': 'market-tour-cooking',
};
// day -> [title substring to match, image slug]
const DAILY = {
  MONDAY: ['Yoga', 'mon-beach-yoga'],
  TUESDAY: ['Beach Walk', 'tue-beach-walk'],
  WEDNESDAY: ['Meditation', 'wed-meditation'],
  THURSDAY: ['Fishing Village', 'thu-fishing-village'],
  FRIDAY: ['Drumming', 'fri-drumming'],
  SATURDAY: ['Tour of the Village', 'sat-village-tour'],
  SUNDAY: ['Sunset', 'sun-sunset'],
};

async function main() {
  let n = 0;
  for (const [name, slug] of Object.entries(PACKAGES)) {
    const r = await prisma.wellnessPackage.updateMany({ where: { name }, data: { image: `${BASE}/packages/${slug}.webp` } });
    n += r.count; console.log(`package "${name}" -> packages/${slug}.webp (${r.count})`);
  }
  for (const [title, slug] of Object.entries(EVENTS)) {
    const r = await prisma.event.updateMany({ where: { title }, data: { image: `${BASE}/events/${slug}.webp` } });
    n += r.count; console.log(`event "${title}" -> events/${slug}.webp (${r.count})`);
  }
  for (const [day, [contains, slug]] of Object.entries(DAILY)) {
    // clear other images for that day so exactly one drives the day-card banner
    await prisma.dailyActivity.updateMany({ where: { day }, data: { image: null } });
    const r = await prisma.dailyActivity.updateMany({
      where: { day, title: { contains, mode: 'insensitive' } },
      data: { image: `${BASE}/experiences/daily/${slug}.webp` },
    });
    n += r.count; console.log(`daily ${day} ("${contains}") -> experiences/daily/${slug}.webp (${r.count})`);
  }
  console.log(`\nUpdated ${n} row(s).`);
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
