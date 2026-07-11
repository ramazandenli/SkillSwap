import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(30).optional(),
  surname: z.string().min(1).max(30).optional(),
  bio: z.string().max(500).nullable().optional(),
  birthdate: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date')
    .optional(),
  gender: z.enum(['F', 'M', 'O']).nullable().optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
