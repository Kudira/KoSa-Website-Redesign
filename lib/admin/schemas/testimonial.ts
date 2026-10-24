import { z } from 'zod';
import { publishStatusEnum, translationsSchema, urlOrEmpty } from './common';

export const testimonialInputSchema = z.object({
  guestName: z.string().trim().min(1).max(160),
  country: z.string().trim().max(120).optional().nullable(),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  quote: z.string().trim().min(1).max(2000),
  avatarUrl: urlOrEmpty,
  source: z.string().trim().max(120).optional().nullable(),
  status: publishStatusEnum.default('PUBLISHED'),
  sortOrder: z.coerce.number().int().default(0),
  translations: translationsSchema,
});

export type TestimonialInput = z.infer<typeof testimonialInputSchema>;
