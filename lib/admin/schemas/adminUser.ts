import { z } from 'zod';

export const adminRoleEnum = z.enum(['OWNER', 'EDITOR', 'SUPPORT']);

export const adminUserCreateSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  name: z.string().trim().max(160).optional().nullable(),
  password: z.string().min(8).max(200),
  role: adminRoleEnum.default('EDITOR'),
});

export const adminUserUpdateSchema = z.object({
  name: z.string().trim().max(160).optional().nullable(),
  password: z.string().min(8).max(200).optional(),
  role: adminRoleEnum.optional(),
  active: z.boolean().optional(),
});

export type AdminUserCreateInput = z.infer<typeof adminUserCreateSchema>;
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;
