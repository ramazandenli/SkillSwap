import type { CreateEventInput, EventDto } from '@skillswap/shared';
import { prisma } from '../../prisma.js';
import type { Event, Skill, User } from '@prisma/client';

export class EventError extends Error {
  constructor(
    public code: 'NOT_FOUND' | 'FORBIDDEN' | 'BAD_STATE' | 'SELF_REQUEST',
    message: string,
  ) {
    super(message);
  }
}

type EventWithRelations = Event & {
  user1: Pick<User, 'id' | 'username' | 'name' | 'surname' | 'avatarUrl'>;
  user2: Pick<User, 'id' | 'username' | 'name' | 'surname' | 'avatarUrl'>;
  skill1: Pick<Skill, 'id' | 'name'>;
  skill2: Pick<Skill, 'id' | 'name'>;
};

function toDto(e: EventWithRelations, viewerId: string): EventDto {
  return {
    id: e.id,
    status: e.status,
    type: e.type,
    startDate: e.startDate.toISOString().slice(0, 10),
    endDate: e.endDate.toISOString().slice(0, 10),
    createdAt: e.createdAt.toISOString(),
    requester: e.user1,
    target: e.user2,
    requesterSkill: e.skill1,
    targetSkill: e.skill2,
    role: e.user1Id === viewerId ? 'requester' : 'target',
  };
}

const includeRelations = {
  user1: { select: { id: true, username: true, name: true, surname: true, avatarUrl: true } },
  user2: { select: { id: true, username: true, name: true, surname: true, avatarUrl: true } },
  skill1: { select: { id: true, name: true } },
  skill2: { select: { id: true, name: true } },
} as const;

export async function createEvent(userId: string, input: CreateEventInput): Promise<EventDto> {
  const target = await prisma.user.findUnique({
    where: { username: input.targetUsername },
    select: { id: true },
  });
  if (!target) throw new EventError('NOT_FOUND', 'target user not found');
  if (target.id === userId) throw new EventError('SELF_REQUEST', 'cannot request from yourself');

  const event = await prisma.event.create({
    data: {
      user1Id: userId,
      skill1Id: input.mySkillId,
      user2Id: target.id,
      skill2Id: input.theirSkillId,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      status: 'waiting',
      type: input.type,
    },
    include: includeRelations,
  });
  return toDto(event, userId);
}

export async function acceptEvent(userId: string, eventId: string): Promise<EventDto> {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new EventError('NOT_FOUND', 'event not found');
  if (event.user2Id !== userId) throw new EventError('FORBIDDEN', 'only the target can accept');
  if (event.status !== 'waiting') throw new EventError('BAD_STATE', `event is ${event.status}`);

  // Points are awarded by the `trg_award_points_on_accept` trigger.
  const updated = await prisma.event.update({
    where: { id: eventId },
    data: { status: 'accepted' },
    include: includeRelations,
  });
  return toDto(updated, userId);
}

export async function completeEvent(userId: string, eventId: string): Promise<EventDto> {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new EventError('NOT_FOUND', 'event not found');
  if (event.user1Id !== userId && event.user2Id !== userId) {
    throw new EventError('FORBIDDEN', 'not a participant');
  }
  if (event.status !== 'accepted') throw new EventError('BAD_STATE', `event is ${event.status}`);

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: { status: 'completed' },
    include: includeRelations,
  });
  return toDto(updated, userId);
}

export async function cancelEvent(userId: string, eventId: string): Promise<void> {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new EventError('NOT_FOUND', 'event not found');
  if (event.user1Id !== userId && event.user2Id !== userId) {
    throw new EventError('FORBIDDEN', 'not a participant');
  }
  if (event.status === 'completed') {
    throw new EventError('BAD_STATE', 'completed events cannot be cancelled');
  }
  // Target rejecting a still-waiting request: keep the row and mark it
  // rejected so the requester sees the outcome instead of the event just
  // vanishing from their list.
  if (event.status === 'waiting' && event.user2Id === userId) {
    await prisma.event.update({
      where: { id: eventId },
      data: { status: 'rejected' },
    });
    return;
  }
  await prisma.event.delete({ where: { id: eventId } });
}

export async function listEventsForUsername(
  username: string,
  viewerId: string | undefined,
): Promise<EventDto[]> {
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!user) throw new EventError('NOT_FOUND', 'user not found');
  const events = await prisma.event.findMany({
    where: {
      OR: [
        // Requester sees everything they sent, including rejected ones.
        { user1Id: user.id },
        // Target sees everything except the ones they themselves rejected.
        { AND: [{ user2Id: user.id }, { NOT: { status: 'rejected' } }] },
      ],
    },
    include: includeRelations,
    orderBy: { createdAt: 'desc' },
  });
  return events.map((e) => toDto(e, viewerId ?? user.id));
}
