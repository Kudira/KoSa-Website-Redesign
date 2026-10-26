// Describes each editable field for the admin page editor: what it is, what
// the website shows by default, and what the admin has changed.

import 'server-only';
import { builtInText, translate, SUPPORTED_LOCALES, type DictKey, type Locale } from '@/lib/i18n/dictionaries';
import { mediaDefaults } from './media';
import { pageTextDefaults } from './page-text';
import * as pricing from '@/lib/pricing';
import { PAGE_REGISTRY } from './registry.generated';
import type { ContentData } from './store';

export type FieldKind = 'text' | 'longtext' | 'image' | 'video' | 'number';

export interface EditorField {
  id: string; // "text:key" or "value:path"
  scope: 'text' | 'value';
  key: string;
  section: string;
  label: string;
  kind: FieldKind;
  builtIn: string;
  current: string;
  translatable: boolean;
}

const WORDS: Record<string, string> = {
  eyebrow: 'small heading',
  headline: 'heading',
  heading: 'heading',
  title: 'title',
  body: 'text',
  intro: 'intro',
  description: 'description',
  subtitle: 'subheading',
  subhead: 'subheading',
  cta: 'button',
  ctaPrimary: 'main button',
  ctaSecondary: 'second button',
  urgency: 'booking nudge',
  q: 'question',
  a: 'answer',
  fromGhs: 'price from (GHS)',
  priceGhs: 'price (GHS)',
  originalGhs: 'price before discount (GHS)',
  spaGhs: 'spa price (GHS)',
  totalGhs: 'total price (GHS)',
  oneDayGhs: 'one-day price (GHS)',
  ghs: 'price (GHS)',
};

const human = (s: string) =>
  s
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .toLowerCase();

function labelFor(scope: 'text' | 'value', key: string): string {
  const segs = key.split('.');
  if (scope === 'text') {
    if (segs[0] === 'alt') return `Photo description: ${human(segs.slice(1).join(' '))}`;
    const last = segs[segs.length - 1];
    const prev = segs.length > 2 ? segs[segs.length - 2] : '';
    const what = WORDS[last] ?? human(last);
    const where = prev && !/Page$/.test(prev) ? `${human(prev)}, ` : '';
    return cap(`${where}${what}`);
  }
  const [root, ...rest] = segs;
  if (root === 'media') {
    const name = human(rest.join(' '));
    return cap(/video/i.test(rest.join('')) ? `Film: ${name}` : `Photo: ${name}`);
  }
  if (root === 'pricing') {
    const [, ...path] = rest;
    const last = path[path.length - 1];
    const lead = path.slice(0, -1).map((p) => (/^\d+$/.test(p) ? `#${Number(p) + 1}` : human(p))).join(', ');
    return cap(`${lead ? `${lead}: ` : ''}${WORDS[last] ?? human(last)}`);
  }
  if (root === 'text') return cap(human(rest.slice(1).join(' ')));
  return key;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function valueDefault(path: string): unknown {
  const [root, ...rest] = path.split('.');
  let node: unknown =
    root === 'media'
      ? mediaDefaults
      : root === 'text'
        ? pageTextDefaults
        : root === 'pricing'
          ? (pricing as unknown as Record<string, unknown>)[`RAW_${rest.shift()}`]
          : undefined;
  for (const part of rest) node = (node as Record<string, unknown> | undefined)?.[part];
  return node;
}

/** True when an admin may save this field. Protects the database from stray keys. */
export function isEditableKey(scope: 'text' | 'value', key: string): boolean {
  if (scope === 'text') return translate('en', key as DictKey) !== key;
  const d = valueDefault(key);
  return typeof d === 'string' || typeof d === 'number';
}

export function valueIsNumber(key: string): boolean {
  return typeof valueDefault(key) === 'number';
}

export function editorFields(pageId: string, locale: Locale, content: ContentData): EditorField[] {
  const page = PAGE_REGISTRY.find((p) => p.id === pageId);
  if (!page) return [];
  return page.fields
    .filter((f) => isEditableKey(f.kind, f.key))
    .map((f) => {
      const id = `${f.kind}:${f.key}`;
      if (f.kind === 'text') {
        const builtIn = builtInText(locale, f.key as DictKey) || builtInText('en', f.key as DictKey);
        const current = content.texts[locale]?.[f.key] ?? '';
        return {
          id,
          scope: 'text' as const,
          key: f.key,
          section: f.section,
          label: labelFor('text', f.key),
          kind: (builtIn.length > 90 ? 'longtext' : 'text') as FieldKind,
          builtIn,
          current,
          translatable: true,
        };
      }
      const d = valueDefault(f.key);
      const isMedia = f.key.startsWith('media.');
      const kind: FieldKind = isMedia
        ? /video/i.test(f.key)
          ? 'video'
          : 'image'
        : typeof d === 'number'
          ? 'number'
          : String(d).length > 90
            ? 'longtext'
            : 'text';
      const cur = content.values[f.key];
      return {
        id,
        scope: 'value' as const,
        key: f.key,
        section: f.section,
        label: labelFor('value', f.key),
        kind,
        builtIn: String(d ?? ''),
        current: cur === undefined || cur === null ? '' : String(cur),
        translatable: false,
      };
    });
}

/** How many fields on each page have been changed in the admin. */
export function editedCounts(content: ContentData): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of PAGE_REGISTRY) {
    out[p.id] = p.fields.filter((f) =>
      f.kind === 'text'
        ? SUPPORTED_LOCALES.some((l) => content.texts[l]?.[f.key])
        : content.values[f.key] !== undefined && content.values[f.key] !== '',
    ).length;
  }
  return out;
}

export { PAGE_REGISTRY };
