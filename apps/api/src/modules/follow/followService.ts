import type { FollowCounts, FollowStatus, FollowUser } from '@skillswap/shared';
import { prisma } from '../../prisma.js';

export class FollowError extends Error {
  constructor(
    public code: 'NOT_FOUND' | 'SELF_FOLLOW' | 'CONFLICT',
    message: string,
  ) {
    super(message);
  }
}

async function requireUserByUsername(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (!user) throw new FollowError('NOT_FOUND', 'user not found');
  return user;
}

export async function follow(followerId: string, targetUsername: string) {
  const target = await requireUserByUsername(targetUsername);
  if (target.id === followerId) {
    throw new FollowError('SELF_FOLLOW', 'cannot follow yourself');
  }
  try {
    await prisma.follow.create({
      data: { followerId, followedId: target.id },
    });
  } catch (err) {
    if ((err as { code?: string }).code === 'P2002') {
      throw new FollowError('CONFLICT', 'already following');
    }
    throw err;
  }
}

export async function unfollow(followerId: string, targetUsername: string) {
  const target = await requireUserByUsername(targetUsername);
  await prisma.follow.deleteMany({
    where: { followerId, followedId: target.id },
  });
}

export async function listFollowers(username: string): Promise<FollowUser[]> {
  const user = await requireUserByUsername(username);
  const rows = await prisma.follow.findMany({
    where: { followedId: user.id },
    include: {
      follower: {
        select: { id: true, username: true, name: true, surname: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((r) => r.follower);
}

export async function listFollowing(username: string): Promise<FollowUser[]> {
  const user = await requireUserByUsername(username);
  const rows = await prisma.follow.findMany({
    where: { followerId: user.id },
    include: {
      followed: {
        select: { id: true, username: true, name: true, surname: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((r) => r.followed);
}

export async function counts(username: string): Promise<FollowCounts> {
  const user = await requireUserByUsername(username);
  const [followers, following] = await Promise.all([
    prisma.follow.count({ where: { followedId: user.id } }),
    prisma.follow.count({ where: { followerId: user.id } }),
  ]);
  return { followers, following };
}

export async function status(viewerId: string, targetUsername: string): Promise<FollowStatus> {
  const target = await requireUserByUsername(targetUsername);
  if (target.id === viewerId) return { isFollowing: false, isFollowedBy: false };
  const [a, b] = await Promise.all([
    prisma.follow.findUnique({
      where: { followerId_followedId: { followerId: viewerId, followedId: target.id } },
    }),
    prisma.follow.findUnique({
      where: { followerId_followedId: { followerId: target.id, followedId: viewerId } },
    }),
  ]);
  return { isFollowing: !!a, isFollowedBy: !!b };
}
