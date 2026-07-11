import { z } from 'zod';

export const skillKindSchema = z.enum(['has', 'needs']);
export type SkillKind = z.infer<typeof skillKindSchema>;

export const addUserSkillSchema = z.object({
  skillId: z.number().int().positive(),
  kind: skillKindSchema,
});
export type AddUserSkillInput = z.infer<typeof addUserSkillSchema>;

export const matchSortSchema = z.enum(['points', 'matchCount']).default('points');
export type MatchSort = z.infer<typeof matchSortSchema>;

export type Skill = {
  id: number;
  name: string;
  category: string | null;
};

export type UserSkillView = {
  skillId: number;
  name: string;
  category: string | null;
  kind: SkillKind;
};

export type MatchResult = {
  id: string;
  username: string;
  name: string;
  surname: string;
  avatarUrl: string | null;
  points: number;
  matchCount: number;
  offeredSkillIds: number[];
};
