import type { AddUserSkillInput, MatchResult, MatchSort, UserSkillView } from '@skillswap/shared';
import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma.js';

export class SkillError extends Error {
  constructor(
    public code: 'CONFLICT' | 'NOT_FOUND' | 'BAD_REQUEST',
    message: string,
  ) {
    super(message);
  }
}

export async function listAllSkills() {
  return prisma.skill.findMany({ orderBy: { name: 'asc' } });
}

export async function getUserSkillsByUsername(username: string): Promise<UserSkillView[]> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (!user) throw new SkillError('NOT_FOUND', 'user not found');

  const rows = await prisma.userSkill.findMany({
    where: { userId: user.id },
    include: { skill: true },
  });
  return rows.map((r) => ({
    skillId: r.skillId,
    name: r.skill.name,
    category: r.skill.category,
    kind: r.kind,
  }));
}

export async function addUserSkill(userId: string, input: AddUserSkillInput) {
  const skill = await prisma.skill.findUnique({ where: { id: input.skillId } });
  if (!skill) throw new SkillError('NOT_FOUND', 'skill not found');

  const existing = await prisma.userSkill.findFirst({
    where: { userId, skillId: input.skillId },
  });
  if (existing) {
    throw new SkillError('CONFLICT', `already listed as ${existing.kind}`);
  }

  await prisma.userSkill.create({
    data: {
      userId,
      skillId: input.skillId,
      kind: input.kind,
    },
  });

  return {
    skillId: skill.id,
    name: skill.name,
    category: skill.category,
    kind: input.kind,
  } satisfies UserSkillView;
}

export async function removeUserSkill(userId: string, skillId: number) {
  const existing = await prisma.userSkill.findFirst({ where: { userId, skillId } });
  if (!existing) throw new SkillError('NOT_FOUND', 'not on your list');
  await prisma.userSkill.deleteMany({ where: { userId, skillId } });
}

/**
 * Matching algorithm (ported from v1's getSearchResultsByPoints/Count):
 *   Find users U such that:
 *     • U has the requested skill (they can teach it), AND
 *     • U needs at least one skill the caller already has (mutual value), AND
 *     • U ≠ caller.
 *   Rank by user.points (default) or by matchCount (how many of caller's
 *   skills U needs).
 */
export async function findMatches(
  callerId: string,
  skillId: number,
  sort: MatchSort,
): Promise<MatchResult[]> {
  const callerHas = await prisma.userSkill.findMany({
    where: { userId: callerId, kind: 'has' },
    select: { skillId: true },
  });
  const callerHasIds = callerHas.map((s) => s.skillId);
  if (callerHasIds.length === 0) return [];

  const orderBy: Prisma.Sql =
    sort === 'points' ? Prisma.sql`u.points DESC, "matchCount" DESC` : Prisma.sql`"matchCount" DESC, u.points DESC`;

  return prisma.$queryRaw<MatchResult[]>`
    SELECT
      u.id,
      u.username,
      u.name,
      u.surname,
      u.avatar_url        AS "avatarUrl",
      u.points,
      COUNT(n.skill_id)::int AS "matchCount",
      ARRAY_AGG(n.skill_id)  AS "offeredSkillIds"
    FROM users u
    JOIN user_skills h ON h.user_id = u.id AND h.kind = 'has'  AND h.skill_id = ${skillId}
    JOIN user_skills n ON n.user_id = u.id AND n.kind = 'needs'
    WHERE u.id != ${callerId}
      AND n.skill_id = ANY(${callerHasIds}::int[])
    GROUP BY u.id
    ORDER BY ${orderBy}
    LIMIT 50
  `;
}
