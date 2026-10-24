import { z } from 'zod';
import { publishStatusEnum, stringArray, translationsSchema, urlOrEmpty } from './common';

export const journalPostInputSchema = z.object({
  slug: z.string().trim().max(160).optional(),
  title: z.string().trim().min(1).max(280),
  excerpt: z.string().trim().max(2000).optional().nullable(),
  body: z.string().min(1),
  image: urlOrEmpty,
  author: z.string().trim().max(160).optional().nullable(),
  tags: stringArray.default([]),
  status: publishStatusEnum.default('DRAFT'),
  publishedAt: z.string().datetime().optional().nullable().or(z.literal('')),
  seoTitle: z.string().trim().max(200).optional().nullable(),
  seoDescription: z.string().trim().max(400).optional().nullable(),
  translations: translationsSchema,
});

export type JournalPostInput = z.infer<typeof journalPostInputSchema>;
