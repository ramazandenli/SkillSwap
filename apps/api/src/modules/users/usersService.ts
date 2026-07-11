import type { PublicUser, UpdateProfileInput } from '@skillswap/shared';
import type { User } from '@prisma/client';
import { prisma } from '../../prisma.js';
import { removeUploadIfLocal } from '../../lib/uploads.js';

export class UserError extends Error {
  constructor(
    public code: 'NOT_FOUND',
    message: string,
  ) {
    super(message);
  }
}

function toPublicUser(u: User): PublicUser {
  return {
    id: u.id,
    username: u.username,
    name: u.name,
    surname: u.surname,
    avatarUrl: u.avatarUrl,
    bio: u.bio,
    points: u.points,
  };
}

export async function getPublicProfileByUsername(username: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new UserError('NOT_FOUND', 'user not found');
  return toPublicUser(user);
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      surname: input.surname,
      bio: input.bio,
      birthdate: input.birthdate ? new Date(input.birthdate) : undefined,
      gender: input.gender ?? undefined,
    },
  });
  return toPublicUser(user);
}

export async function setAvatar(userId: string, publicUrl: string) {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true },
  });
  removeUploadIfLocal(existing?.avatarUrl ?? null);
  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: publicUrl },
  });
  return toPublicUser(user);
}

export async function removeAvatar(userId: string) {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true },
  });
  removeUploadIfLocal(existing?.avatarUrl ?? null);
  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: null },
  });
  return toPublicUser(user);
}
