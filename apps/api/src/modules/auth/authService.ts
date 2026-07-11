import type { User } from '@prisma/client';
import type { SignupInput, LoginInput, PublicUser } from '@skillswap/shared';
import { prisma } from '../../prisma.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import { signToken } from '../../lib/jwt.js';

export class AuthError extends Error {
  constructor(
    public code: 'CONFLICT' | 'INVALID_CREDENTIALS',
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

export async function signup(input: SignupInput) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ username: input.username }, { email: input.email }] },
    select: { id: true },
  });
  if (existing) {
    throw new AuthError('CONFLICT', 'username or email already in use');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      username: input.username,
      email: input.email,
      name: input.name,
      surname: input.surname,
      birthdate: new Date(input.birthdate),
      gender: input.gender ?? null,
      passwordHash,
    },
  });

  const token = signToken({ sub: user.id, username: user.username });
  return { user: toPublicUser(user), token };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: input.identifier }, { email: input.identifier }],
    },
  });
  if (!user) throw new AuthError('INVALID_CREDENTIALS', 'invalid credentials');

  const ok = await verifyPassword(user.passwordHash, input.password);
  if (!ok) throw new AuthError('INVALID_CREDENTIALS', 'invalid credentials');

  const token = signToken({ sub: user.id, username: user.username });
  return { user: toPublicUser(user), token };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user ? toPublicUser(user) : null;
}
