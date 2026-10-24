// Reusable zod fragments shared by every CMS model.

import { z } from 'zod';
import { SUPPORTED_LOCALES } from '@/lib/i18n/dictionaries';

export const localeEnum = z.enum(SUPPORTED_LOCALES as unknown as [string, ...string[]]);

/** Translations: `{ "fr": { fieldA: "...", fieldB: "..." } }` */
export const translationsSchema = z
  .record(localeEnum, z.record(z.string(), z.string().nullable().optional()))
  .nullable()
  .optional();

export const publishStatusEnum = z.enum(['DRAFT', 'PUBLISHED']);

export const urlOrEmpty = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => v === '' || /^https?:\/\//i.test(v) || v.startsWith('/'), {
    message: 'Must be a URL or absolute path',
  })
  .optional()
  .or(z.literal(''));

export const stringArray = z.array(z.string().trim()).default([]);

export const decimalLike = z.union([z.number(), z.string()]).transform((v) => {
  if (typeof v === 'number') return v;
  const n = Number(v);
  if (Number.isNaN(n)) throw new Error('Invalid number');
  return n;
});
