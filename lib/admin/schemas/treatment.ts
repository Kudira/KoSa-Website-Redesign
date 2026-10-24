import { z } from 'zod';
import { publishStatusEnum, translationsSchema, urlOrEmpty } from './common';

export const treatmentInputSchema = z.object({
  slug: z.string().trim().max(120).optional(),
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(8000).optional().nullable(),
  durationMin: z.coerce.number().int().min(1).max(720).default(60),
  price: z.coerce.number().min(0).max(1_000_000),
  currency: z.string().trim().min(3).max(3).default('GHS'),
  image: urlOrEmpty,
  category: z.string().trim().max(60).optional().nullable(),
  status: publishStatusEnum.default('PUBLISHED'),
  sortOrder: z.coerce.number().int().default(0),
  translations: translationsSchema,
});

export type TreatmentInput = z.infer<typeof treatmentInputSchema>;
