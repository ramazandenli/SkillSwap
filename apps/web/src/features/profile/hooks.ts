import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PublicUser, UpdateProfileInput } from '@skillswap/shared';
import { api } from '@/lib/api';

export function useUserProfile(username: string | undefined) {
  return useQuery({
    queryKey: ['userProfile', username],
    queryFn: async () =>
      (await api.get<{ user: PublicUser }>(`/users/${username}`)).data.user,
    enabled: !!username,
  });
}

function invalidateProfileCaches(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['userProfile'] });
  qc.invalidateQueries({ queryKey: ['auth', 'me'] });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateProfileInput) =>
      (await api.patch<{ user: PublicUser }>('/users/me', input)).data.user,
    onSuccess: () => invalidateProfileCaches(qc),
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await api.post<{ user: PublicUser }>('/users/me/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.user;
    },
    onSuccess: () => invalidateProfileCaches(qc),
  });
}

export function useRemoveAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.delete<{ user: PublicUser }>('/users/me/avatar')).data.user,
    onSuccess: () => invalidateProfileCaches(qc),
  });
}
