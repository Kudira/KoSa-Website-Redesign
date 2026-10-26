// Builds lib/content/registry.generated.ts: for every public page, the words,
// photos and prices it shows, so /admin/pages can list them page by page.
// Run after adding or changing page code:  npx tsx scripts/build-page-registry.ts

import fs from 'fs';
import path from 'path';
import { translate } from '../lib/i18n/dictionaries';
import { mediaDefaults } from '../lib/content/media';
import { pageTextDefaults } from '../lib/content/page-text';

const ROOT = path.resolve(__dirname, '..');
const DICT = fs.readFileSync(path.join(ROOT, 'lib/i18n/dictionaries.ts'), 'utf8') + fs.readFileSync(path.join(ROOT, 'lib/i18n/redesign.ts'), 'utf8');
// Every English key (keys appear as 'a.b.c': in the dictionary sources).
const ALL_KEYS = new Set(Array.from(DICT.matchAll(/^\s*'([a-zA-Z0-9_.]+)':/gm)).map((m) => m[1]).filter((k) => translate('en', k as never) !== k));

const PAGES: { id: string; label: string; path: string; files: string[] }[] = [
  { id: 'home', label: 'Home', path: '/', files: ['app/(site)/page.tsx'] },
  { id: 'rooms', label: 'Rooms (list)', path: '/rooms', files: ['app/(site)/rooms/page.tsx'] },
  { id: 'room', label: 'Room page (every room)', path: '/rooms', files: ['app/(site)/rooms/[slug]/page.tsx'] },
  { id: 'wellness', label: 'Wellness & spa', path: '/wellness', files: ['app/(site)/wellness/page.tsx'] },
  { id: 'dining', label: 'Dining', path: '/dining', files: ['app/(site)/dining/page.tsx'] },
  { id: 'experiences', label: 'Experiences', path: '/experiences', files: ['app/(site)/experiences/page.tsx'] },
  { id: 'experience', label: 'Experience page (each one)', path: '/experiences', files: ['app/(site)/experiences/[slug]/page.tsx'] },
  { id: 'events', label: 'Events', path: '/events', files: ['app/(site)/events/page.tsx'] },
  { id: 'groups', label: 'Groups & tours', path: '/groups', files: ['app/(site)/groups/page.tsx'] },
  { id: 'plan', label: 'Plan your visit', path: '/plan', files: ['app/(site)/plan/page.tsx'] },
  { id: 'about', label: 'Our story', path: '/about', files: ['app/(site)/about/page.tsx'] },
  { id: 'philosophy', label: 'Our philosophy', path: '/about/philosophy', files: ['app/(site)/about/philosophy/page.tsx'] },
  { id: 'gallery', label: 'Gallery', path: '/gallery', files: ['app/(site)/gallery/page.tsx'] },
  { id: 'blog', label: 'Journal', path: '/blog', files: ['app/(site)/blog/page.tsx', 'app/(site)/blog/[slug]/page.tsx'] },
  { id: 'book', label: 'Book', path: '/book', files: ['app/(site)/book/page.tsx', 'app/(site)/book/confirmed/page.tsx'] },
  { id: 'contact', label: 'Contact', path: '/contact', files: ['app/(site)/contact/page.tsx'] },
  { id: 'virtual-tour', label: 'Virtual tour', path: '/virtual-tour', files: ['app/(site)/virtual-tour/page.tsx'] },
  { id: 'privacy', label: 'Privacy policy', path: '/legal/privacy', files: ['app/(site)/legal/privacy/page.tsx'] },
  { id: 'terms', label: 'Terms of service', path: '/legal/terms', files: ['app/(site)/legal/terms/page.tsx'] },
  { id: 'not-found', label: 'Page not found', path: '/this-page-does-not-exist', files: ['app/not-found.tsx'] },
  {
    id: 'site',
    label: 'Menu, footer & chat (every page)',
    path: '/',
    files: ['app/(site)/layout.tsx'],
  },
];

// Room prices are edited per room in Admin > Rooms, not here.
const PRICING_CONSTS = ['PACKAGES', 'ESCAPES', 'RETREAT_TIERS', 'RETREAT_TRACKS', 'EXPERIENCE_DETAILS'];

function resolveImport(from: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith('@/')) base = path.join(ROOT, spec.slice(2));
  else if (spec.startsWith('.')) base = path.resolve(path.dirname(from), spec);
  else return null;
  for (const ext of ['.tsx', '.ts', '/index.tsx', '/index.ts']) {
    const f = base + ext;
    if (fs.existsSync(f)) return f;
  }
  return null;
}

/** The page file plus every component it pulls in (not lib/ helpers, which hold no page copy). */
function collect(entry: string, seen = new Set<string>()): string[] {
  const abs = path.join(ROOT, entry);
  const walk = (file: string) => {
    if (seen.has(file)) return;
    seen.add(file);
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(/from\s+'([^']+)'/g)) {
      const f = resolveImport(file, m[1]);
      if (!f) continue;
      const rel = path.relative(ROOT, f);
      if (rel.startsWith('components/admin')) continue;
      if (rel.startsWith('components/') || rel.startsWith('app/')) walk(f);
    }
  };
  walk(abs);
  return Array.from(seen);
}

function leaves(prefix: string, obj: unknown, out: string[] = []): string[] {
  if (obj !== null && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) leaves(prefix ? `${prefix}.${k}` : k, v, out);
  } else if (typeof obj === 'string' || typeof obj === 'number') out.push(prefix);
  return out;
}

import * as pricingMod from '../lib/pricing';
const pricing = pricingMod as unknown as Record<string, unknown>;

type Field = { kind: 'text' | 'value'; key: string; section: string };

const SECTION_NAMES: Record<string, string> = {
  HeroFilm: 'Top of the page (hero)',
  Exhale: 'Opening words',
  DayAtKosa: 'A day at KoSa',
  RoomsDrift: 'Rooms',
  WellTable: 'Spa and the table',
  Homecoming: 'Welcome Home film',
  Stays: 'Ways to stay (packages)',
  Voices: 'Guest reviews',
  PageHero: 'Top of the page (hero)',
  Navbar: 'Menu',
  Footer: 'Footer',
  ChatWidget: 'Abena chat',
  ExitIntentPopup: 'Newsletter pop-up',
  NewsletterForm: 'Footer',
  SeaSound: 'Sea sound button',
};
const PREFIX_NAMES: Record<string, string> = { media: 'Photos and films', pricing: 'Prices and package details', text: 'Wording' };
const human = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

function sectionFor(file: string, key: string, isPage: boolean): string {
  const base = path.basename(file).replace(/\.tsx?$/, '');
  if (!isPage) return SECTION_NAMES[base] ?? human(base);
  const first = key.split('.')[0];
  if (PREFIX_NAMES[first]) {
    if (first === 'text') return human(key.split('.')[2] ?? 'Wording').split(' ')[0] === '' ? 'Wording' : 'Wording';
    if (first === 'pricing') return `Prices: ${human(key.split('.')[1]).toLowerCase()}`;
    return PREFIX_NAMES[first];
  }
  const segs = key.split('.');
  const sec = segs.length > 2 ? segs[1] : segs[0];
  return human(sec.replace(/Page$/, ''));
}

const registry = PAGES.map((page) => {
  const files = page.files.flatMap((f) => collect(f));
  const fields: Field[] = [];
  const have = new Set<string>();
  let current = '';
  let isPage = true;
  const add = (f0: Omit<Field, 'section'>) => {
    const f: Field = { ...f0, section: sectionFor(current, f0.key, isPage) };
    const id = `${f.kind}:${f.key}`;
    if (!have.has(id)) {
      have.add(id);
      fields.push(f);
    }
  };
  for (const file of files) {
    current = file;
    isPage = page.files.some((pf) => path.join(ROOT, pf) === file);
    const src = fs.readFileSync(file, 'utf8').replace(/^\s*\/\/.*$/gm, '');
    // Dictionary keys, in the order they appear.
    for (const m of src.matchAll(/['"`]([a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z0-9_]+)+)['"`]/g)) {
      if (ALL_KEYS.has(m[1])) add({ kind: 'text', key: m[1] });
    }
    // Template keys such as `booked.${state}Title` or `day.${m.key}.${f}`.
    for (const m of src.matchAll(/`([a-zA-Z][a-zA-Z0-9_]*\.[^`\s]*)`/g)) {
      const tpl = m[1];
      if (!tpl.includes('${')) continue;
      const rx = new RegExp('^' + tpl.split(/\$\{[^}]+\}/).map((p) => p.replace(/[.]/g, '\\.')).join('[a-zA-Z0-9_]+') + '$');
      for (const k of ALL_KEYS) if (rx.test(k)) add({ kind: 'text', key: k });
    }
    // Photos and films.
    for (const m of src.matchAll(/\bmedia\.([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*)/g)) {
      let node: unknown = mediaDefaults;
      for (const part of m[1].split('.')) node = (node as Record<string, unknown> | undefined)?.[part];
      if (node === undefined) continue;
      for (const leaf of leaves(m[1], node)) add({ kind: 'value', key: `media.${leaf}` });
    }
    // Prices and package details from lib/pricing.
    for (const name of PRICING_CONSTS) {
      if (new RegExp(`\\b${name}\\b`).test(src)) {
        for (const leaf of leaves(name, pricing[`RAW_${name}`])) add({ kind: 'value', key: `pricing.${leaf}` });
      }
    }
    // English-only page wording.
    for (const m of src.matchAll(/\bpageText\.([a-zA-Z0-9_]+)/g)) {
      const node = (pageTextDefaults as Record<string, unknown>)[m[1]];
      for (const leaf of leaves(m[1], node)) add({ kind: 'value', key: `text.${leaf}` });
    }
  }
  return { id: page.id, label: page.label, path: page.path, fields };
});

const out = `// Generated by scripts/build-page-registry.ts. Do not edit by hand.\n// Lists the editable words, photos and prices on each public page.\n\nexport const PAGE_REGISTRY: { id: string; label: string; path: string; fields: { kind: 'text' | 'value'; key: string; section: string }[] }[] = ${JSON.stringify(registry, null, 1)};\n`;
fs.writeFileSync(path.join(ROOT, 'lib/content/registry.generated.ts'), out);
for (const p of registry) console.log(p.id.padEnd(14), p.fields.length);
