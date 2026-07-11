import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AddUserSkillInput,
  MatchResult,
  MatchSort,
  Skill,
  UserSkillView,
} from '@skillswap/shared';
import { api } from '@/lib/api';

export function useAllSkills() {
  return useQuery({
    queryKey: ['skills'],
    queryFn: async () => (await api.get<Skill[]>('/skills')).data,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserSkills(username: string | undefined) {
  return useQuery({
    queryKey: ['userSkills', username],
    queryFn: async () =>
      (await api.get<UserSkillView[]>(`/users/${username}/skills`)).data,
    enabled: !!username,
  });
}

export function useAddSkill(username: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: AddUserSkillInput) =>
      (await api.post<UserSkillView>('/users/me/skills', input)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['userSkills', username] });
    },
  });
}

export function useRemoveSkill(username: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (skillId: number) => {
      await api.delete(`/users/me/skills/${skillId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['userSkills', username] });
    },
  });
}

export function useMatches(skillId: number | null, sort: MatchSort) {
  return useQuery({
    queryKey: ['matches', skillId, sort],
    queryFn: async () =>
      (
        await api.get<MatchResult[]>('/matches', {
          params: { skillId, sort },
        })
      ).data,
    enabled: skillId !== null,
  });
}
