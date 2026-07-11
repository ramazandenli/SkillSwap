import { z } from 'zod';

export const signupSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscore'),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(30),
  surname: z.string().min(1).max(30),
  birthdate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date'),
  gender: z.enum(['F', 'M', 'O']).optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(1), // username or email
  password: z.string().min(1),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
