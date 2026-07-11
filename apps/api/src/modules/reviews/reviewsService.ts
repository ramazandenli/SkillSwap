import type { CreateReviewInput, ReviewDto, UserRatingSummary } from '@skillswap/shared';
import { prisma } from '../../prisma.js';

export class ReviewError extends Error {
  constructor(
    public code: 'NOT_FOUND' | 'FORBIDDEN' | 'BAD_STATE' | 'CONFLICT',
    message: string,
  ) {
    super(message);
  }
}

export async function createReview(
  authorId: string,
  eventId: string,
  input: CreateReviewInput,
): Promise<ReviewDto> {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new ReviewError('NOT_FOUND', 'event not found');
  if (event.user1Id !== authorId && event.user2Id !== authorId) {
    throw new ReviewError('FORBIDDEN', 'not a participant');
  }
  if (event.status !== 'completed') {
    throw new ReviewError('BAD_STATE', 'event is not completed');
  }
  const targetId = event.user1Id === authorId ? event.user2Id : event.user1Id;

  try {
    const created = await prisma.review.create({
      data: {
        eventId,
        fromId: authorId,
        toId: targetId,
        rating: input.rating,
        comment: input.comment ?? null,
      },
      include: {
        from: { select: { id: true, username: true, name: true, surname: true, avatarUrl: true } },
      },
    });
    return {
      id: created.id,
      eventId: created.eventId,
      rating: created.rating,
      comment: created.comment,
      createdAt: created.createdAt.toISOString(),
      from: created.from,
    };
  } catch (err) {
    if ((err as { code?: string }).code === 'P2002') {
      throw new ReviewError('CONFLICT', 'already reviewed this event');
    }
    throw err;
  }
}

export async function listReviewsForUser(username: string): Promise<ReviewDto[]> {
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!user) throw new ReviewError('NOT_FOUND', 'user not found');
  const rows = await prisma.review.findMany({
    where: { toId: user.id },
    include: {
      from: { select: { id: true, username: true, name: true, surname: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((r) => ({
    id: r.id,
    eventId: r.eventId,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    from: r.from,
  }));
}

export async function getRatingSummary(username: string): Promise<UserRatingSummary> {
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!user) throw new ReviewError('NOT_FOUND', 'user not found');
  const agg = await prisma.review.aggregate({
    where: { toId: user.id },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return {
    average: agg._avg.rating ?? 0,
    count: agg._count._all,
  };
}

export async function myReviewOnEvent(userId: string, eventId: string): Promise<ReviewDto | null> {
  const r = await prisma.review.findFirst({
    where: { eventId, fromId: userId },
    include: {
      from: { select: { id: true, username: true, name: true, surname: true, avatarUrl: true } },
    },
  });
  if (!r) return null;
  return {
    id: r.id,
    eventId: r.eventId,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    from: r.from,
  };
}
