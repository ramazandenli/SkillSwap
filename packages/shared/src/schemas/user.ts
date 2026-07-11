import { z } from 'zod';

export const publicUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string(),
  surname: z.string(),
  avatarUrl: z.string().url().nullable(),
  bio: z.string().nullable(),
  points: z.number().int(),
});

export type PublicUser = z.infer<typeof publicUserSchema>;

export type AuthResponse = {
  user: PublicUser;
  token: string;
};
