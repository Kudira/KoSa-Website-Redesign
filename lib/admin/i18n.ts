// CMS localisation helpers.
//
// Translatable models hold `translations` as JSON shaped:
//   { "fr": { name: "...", tagline: "..." }, "es": {...}, ... }
//
// `applyTranslations` overlays the requested locale onto the model's primary
// fields and returns a plain object the public site can render directly.

import { Prisma } from '@prisma/client';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from '@/lib/i18n/dictionaries';

export type TranslationMap = Partial<Record<Locale, Record<string, string>>>;

/**
 * Returns a new record where any field listed in `fields` is overridden by the
 * locale translation when present. Falls back silently to the primary field.
 */
export function applyTranslations<T extends object>(
  record: T,
  fields: readonly (keyof T & string)[],
  locale: Locale = DEFAULT_LOCALE,
): T {
  if (locale === DEFAULT_LOCALE) return record;
  const r = record as Record<string, unknown>;
  const tr = (r.translations as TranslationMap | null | undefined) ?? null;
  if (!tr) return record;
  const overlay = tr[locale];
  if (!overlay) return record;
  const out: Record<string, unknown> = { ...r };
  for (const f of fields) {
    const v = overlay[f];
    if (typeof v === 'string' && v.trim().length > 0) {
      out[f] = v;
    }
  }
  return out as T;
}

/** Apply translations across an array (helper for list endpoints). */
export function applyTranslationsAll<T extends object>(
  records: T[],
  fields: readonly (keyof T & string)[],
  locale: Locale = DEFAULT_LOCALE,
): T[] {
  return records.map((r) => applyTranslations(r, fields, locale));
}

function normaliseTranslations(input: unknown): TranslationMap | null {
  if (!input || typeof input !== 'object') return null;
  const out: TranslationMap = {};
  for (const [locale, value] of Object.entries(input as Record<string, unknown>)) {
    if (!(SUPPORTED_LOCALES as readonly string[]).includes(locale)) continue;
    if (locale === DEFAULT_LOCALE) continue; // English lives in primary fields
    if (!value || typeof value !== 'object') continue;
    const cleaned: Record<string, string> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (typeof v === 'string') cleaned[k] = v;
    }
    if (Object.keys(cleaned).length) out[locale as Locale] = cleaned;
  }
  return Object.keys(out).length ? out : null;
}

/**
 * Sanitise a translations payload and coerce to a Prisma-acceptable value
 * suitable for writing to a `Json` column.
 *
 * - `undefined`             → `undefined` (don't touch the column)
 * - `null` or empty/invalid → `Prisma.JsonNull` (clear the column)
 * - valid map               → the cleaned map
 *
 * On `update`, only call when the caller actually provided translations
 * (`data.translations !== undefined`) so we don't unintentionally clear.
 */
export function sanitizeTranslations(
  input: unknown,
): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (input === undefined) return undefined;
  if (input === null) return Prisma.JsonNull;
  const cleaned = normaliseTranslations(input);
  if (!cleaned) return Prisma.JsonNull;
  return cleaned as unknown as Prisma.InputJsonValue;
}
