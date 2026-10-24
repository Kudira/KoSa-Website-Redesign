import { z } from 'zod';
import { publishStatusEnum, stringArray, translationsSchema, urlOrEmpty } from './common';

export const roomCategoryEnum = z.enum(['SUITE', 'PALM_SIDE', 'BEACH_VIEW', 'BUNGALOW', 'VILLA']);

export const roomInputSchema = z.object({
  slug: z.string().trim().max(120).optional(),
  name: z.string().trim().min(1).max(160),
  tagline: z.string().trim().max(280).optional().nullable(),
  category: roomCategoryEnum,
  description: z.string().trim().max(8000).optional().nullable(),
  price: z.coerce.number().min(0).max(1_000_000),
  currency: z.string().trim().min(3).max(3).default('GHS'),
  maxGuests: z.coerce.number().int().min(1).max(20).default(2),
  bedConfig: z.string().trim().max(120).optional().nullable(),
  sizeSqm: z.coerce.number().int().min(0).max(10_000).optional().nullable(),
  image: urlOrEmpty,
  gallery: stringArray.default([]),
  amenities: stringArray.default([]),
  features: stringArray.default([]),
  cloudbedsRoomTypeId: z.string().trim().max(120).optional().nullable(),
  available: z.boolean().default(true),
  status: publishStatusEnum.default('PUBLISHED'),
  sortOrder: z.coerce.number().int().default(0),
  translations: translationsSchema,
});

export type RoomInput = z.infer<typeof roomInputSchema>;
