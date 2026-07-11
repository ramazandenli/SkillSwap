import type { MessageDto, SendMessageInput, ThreadPreview } from '@skillswap/shared';
import type { Message } from '@prisma/client';
import { prisma } from '../../prisma.js';

export class MessageError extends Error {
  constructor(
    public code: 'NOT_FOUND' | 'SELF' | 'FORBIDDEN',
    message: string,
  ) {
    super(message);
  }
}

function toDto(m: Message): MessageDto {
  return {
    id: m.id,
    fromId: m.fromId,
    toId: m.toId,
    body: m.body,
    readAt: m.readAt?.toISOString() ?? null,
    createdAt: m.createdAt.toISOString(),
  };
}

export async function sendMessage(
  fromId: string,
  input: SendMessageInput,
): Promise<{ dto: MessageDto; toId: string }> {
  const to = await prisma.user.findUnique({
    where: { username: input.toUsername },
    select: { id: true },
  });
  if (!to) throw new MessageError('NOT_FOUND', 'recipient not found');
  if (to.id === fromId) throw new MessageError('SELF', 'cannot message yourself');

  const message = await prisma.message.create({
    data: {
      fromId,
      toId: to.id,
      body: input.body,
    },
  });
  return { dto: toDto(message), toId: to.id };
}

export async function listThreads(userId: string): Promise<ThreadPreview[]> {
  // Fetch the most recent message per counterpart. Uses a DISTINCT ON
  // Postgres extension via raw SQL for a single-round-trip fetch, then
  // hydrates the counterpart users and unread counts.
  const lastPerPeer = await prisma.$queryRaw<
    Array<{ peer_id: string; message_id: string; created_at: Date }>
  >`
    SELECT DISTINCT ON (peer_id) peer_id, message_id, created_at
    FROM (
      SELECT
        CASE WHEN from_id = ${userId} THEN to_id ELSE from_id END AS peer_id,
        id AS message_id,
        created_at
      FROM messages
      WHERE from_id = ${userId} OR to_id = ${userId}
    ) t
    ORDER BY peer_id, created_at DESC
  `;
  if (lastPerPeer.length === 0) return [];

  const messageIds = lastPerPeer.map((r) => r.message_id);
  const peerIds = lastPerPeer.map((r) => r.peer_id);

  const [messages, peers, unread] = await Promise.all([
    prisma.message.findMany({ where: { id: { in: messageIds } } }),
    prisma.user.findMany({
      where: { id: { in: peerIds } },
      select: { id: true, username: true, name: true, surname: true, avatarUrl: true },
    }),
    prisma.message.groupBy({
      by: ['fromId'],
      where: {
        toId: userId,
        fromId: { in: peerIds },
        readAt: null,
      },
      _count: { _all: true },
    }),
  ]);

  const messageById = new Map(messages.map((m) => [m.id, m]));
  const peerById = new Map(peers.map((p) => [p.id, p]));
  const unreadByPeer = new Map(unread.map((u) => [u.fromId, u._count._all]));

  return lastPerPeer
    .map((r) => {
      const msg = messageById.get(r.message_id);
      const peer = peerById.get(r.peer_id);
      if (!msg || !peer) return null;
      return {
        user: peer,
        lastMessage: toDto(msg),
        unreadCount: unreadByPeer.get(r.peer_id) ?? 0,
      };
    })
    .filter((x): x is ThreadPreview => x !== null)
    .sort((a, b) => (a.lastMessage.createdAt > b.lastMessage.createdAt ? -1 : 1));
}

export async function listThreadMessages(
  userId: string,
  peerUsername: string,
): Promise<{ messages: MessageDto[]; peerId: string }> {
  const peer = await prisma.user.findUnique({
    where: { username: peerUsername },
    select: { id: true },
  });
  if (!peer) throw new MessageError('NOT_FOUND', 'user not found');

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { fromId: userId, toId: peer.id },
        { fromId: peer.id, toId: userId },
      ],
    },
    orderBy: { createdAt: 'asc' },
    take: 500,
  });
  return { messages: messages.map(toDto), peerId: peer.id };
}

export async function markThreadRead(
  userId: string,
  peerUsername: string,
): Promise<{ peerId: string; lastReadMessageId: string | null }> {
  const peer = await prisma.user.findUnique({
    where: { username: peerUsername },
    select: { id: true },
  });
  if (!peer) throw new MessageError('NOT_FOUND', 'user not found');

  const lastFromPeer = await prisma.message.findFirst({
    where: { fromId: peer.id, toId: userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  });

  await prisma.message.updateMany({
    where: { fromId: peer.id, toId: userId, readAt: null },
    data: { readAt: new Date() },
  });
  return { peerId: peer.id, lastReadMessageId: lastFromPeer?.id ?? null };
}
