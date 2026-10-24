import { z } from 'zod';
import { publishStatusEnum, stringArray, translationsSchema, urlOrEmpty } from './common';

export const experienceInputSchema = z.object({
  slug: z.string().trim().max(120).optional(),
  label: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2000),
  longBody: z.string().trim().max(20000).optional().nullable(),
  image: urlOrEmpty,
  gallery: stringArray.default([]),
  adinkra: z.string().trim().max(80).optional().nullable(),
  duration: z.string().trim().max(60).optional().nullable(),
  status: publishStatusEnum.default('PUBLISHED'),
  sortOrder: z.coerce.number().int().default(0),
  translations: translationsSchema,
});

export type ExperienceInput = z.infer<typeof experienceInputSchema>;
