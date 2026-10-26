// Page content edited in /admin/pages.
//
// The site's words live in the i18n dictionaries, its photos in lib/content/media.ts
// and a few prices in lib/pricing.ts. The admin saves only what changed, as
// overrides, in one SiteSetting row ("content"). This module holds the current
// overrides so that every read (server or browser) picks them up:
//   texts   per language, keyed by dictionary key        -> translate()
//   values  photos, videos, numbers, keyed by their path -> media / pricing proxies
//   contact email, phone, WhatsApp, address, socials    -> site.contact / site.socials
//
// It is safe to import anywhere. The server fills it in lib/content/load.ts; the
// browser gets the same data from <ContentProvider> in the root layout.

export interface ContentData {
  texts: Record<string, Record<string, string>>;
  values: Record<string, string | number>;
  contact: Record<string, string>;
  flags: {
    maintenance?: { enabled?: boolean; message?: string };
    chatEnabled?: boolean;
    newsletterEnabled?: boolean;
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
  };
  seo: { siteTitle?: string; siteDescription?: string; ogImage?: string; twitterHandle?: string };
}

export const EMPTY_CONTENT: ContentData = { texts: {}, values: {}, contact: {}, flags: {}, seo: {} };

type G = { __kosaContent?: ContentData; __kosaMediaDefaults?: Record<string, unknown> };
const g = globalThis as unknown as G;

export function contentState(): ContentData {
  return g.__kosaContent ?? EMPTY_CONTENT;
}

export function setContentState(data: ContentData) {
  g.__kosaContent = data;
}

export function textOverride(locale: string, key: string): string | undefined {
  const v = contentState().texts[locale]?.[key];
  return typeof v === 'string' && v.trim() !== '' ? v : undefined;
}

export function valueOverride(path: string): string | number | undefined {
  const v = contentState().values[path];
  return v === undefined || v === null || v === '' ? undefined : v;
}

export function contactOverride(field: string, fallback: string): string {
  const v = contentState().contact[field];
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : fallback;
}

/**
 * Wrap a plain object so every leaf read checks for an admin override first.
 * Reads are live: an object read during render always sees the latest edits.
 */
export function overridable<T extends object>(prefix: string, target: T): T {
  return new Proxy(target, {
    get(t, prop, receiver) {
      const v = Reflect.get(t, prop, receiver);
      if (typeof prop !== 'string') return v;
      const path = `${prefix}.${prop}`;
      if (v !== null && typeof v === 'object') return overridable(path, v as object);
      if (typeof v === 'function') return v;
      const o = valueOverride(path);
      if (o === undefined) return v;
      if (typeof v === 'number') {
        const n = Number(o);
        return Number.isFinite(n) ? n : v;
      }
      return String(o);
    },
  });
}

/** Media defaults are registered by lib/content/media.ts so a photo URL can be swapped wherever it was captured. */
export function registerMediaDefaults(raw: Record<string, unknown>) {
  g.__kosaMediaDefaults = raw;
}

function defaultAt(path: string): unknown {
  let cur: unknown = g.__kosaMediaDefaults;
  for (const part of path.split('.')) {
    if (cur === null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

/** Original URL -> replacement URL, for photos changed in the admin. */
export function swapImage(src: string): string {
  const values = contentState().values;
  for (const [k, v] of Object.entries(values)) {
    if (!k.startsWith('media.') || typeof v !== 'string' || !v) continue;
    if (defaultAt(k.slice('media.'.length)) === src) return v;
  }
  return src;
}
