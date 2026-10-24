import { z } from 'zod';
import { publishStatusEnum, stringArray, translationsSchema, urlOrEmpty } from './common';

export const diningVenueInputSchema = z.object({
  slug: z.string().trim().max(120).optional(),
  name: z.string().trim().min(1).max(160),
  tagline: z.string().trim().max(280).optional().nullable(),
  description: z.string().trim().max(8000).optional().nullable(),
  hours: z.string().trim().max(200).optional().nullable(),
  image: urlOrEmpty,
  gallery: stringArray.default([]),
  status: publishStatusEnum.default('PUBLISHED'),
  sortOrder: z.coerce.number().int().default(0),
  translations: translationsSchema,
});

export const menuSectionInputSchema = z.object({
  venueId: z.string().min(1),
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  translations: translationsSchema,
});

export const menuItemInputSchema = z.object({
  sectionId: z.string().min(1),
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional().nullable(),
  price: z.coerce.number().min(0).max(1_000_000).optional().nullable(),
  currency: z.string().trim().min(3).max(3).default('GHS'),
  dietary: stringArray.default([]),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  translations: translationsSchema,
});

export type DiningVenueInput = z.infer<typeof diningVenueInputSchema>;
export type MenuSectionInput = z.infer<typeof menuSectionInputSchema>;
export type MenuItemInput = z.infer<typeof menuItemInputSchema>;
