import { z } from 'zod';
import { publishStatusEnum, translationsSchema } from './common';

export const virtualTourSceneInputSchema = z.object({
  sceneId: z.string().trim().min(1).max(120).optional(),
  name: z.string().trim().min(1).max(160),
  imageUrl: z.string().trim().min(1).max(2048),
  thumbnailUrl: z.string().trim().max(2048).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  status: publishStatusEnum.default('PUBLISHED'),
  sortOrder: z.coerce.number().int().default(0),
  translations: translationsSchema,
});

export type VirtualTourSceneInput = z.infer<typeof virtualTourSceneInputSchema>;
