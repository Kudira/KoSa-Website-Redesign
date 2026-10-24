import { z } from 'zod';
import { publishStatusEnum, translationsSchema } from './common';

export const galleryItemInputSchema = z.object({
  imageUrl: z.string().trim().min(1).max(2048),
  caption: z.string().trim().max(280).optional().nullable(),
  alt: z.string().trim().max(280).optional().nullable(),
  category: z.string().trim().max(80).optional().nullable(),
  width: z.coerce.number().int().min(0).max(20_000).optional().nullable(),
  height: z.coerce.number().int().min(0).max(20_000).optional().nullable(),
  status: publishStatusEnum.default('PUBLISHED'),
  sortOrder: z.coerce.number().int().default(0),
  translations: translationsSchema,
});

export type GalleryItemInput = z.infer<typeof galleryItemInputSchema>;
