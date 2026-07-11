import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FollowCounts, FollowStatus, FollowUser } from '@skillswap/shared';
import { api } from '@/lib/api';
import { useAuth } from '@/auth/AuthContext';

export function useFollowers(username: string | undefined) {
  return useQuery({
    queryKey: ['followers', username],
    queryFn: async () =>
      (await api.get<FollowUser[]>(`/users/${username}/followers`)).data,
    enabled: !!username,
  });
}

export function useFollowing(username: string | undefined) {
  return useQuery({
    queryKey: ['following', username],
    queryFn: async () =>
      (await api.get<FollowUser[]>(`/users/${username}/following`)).data,
    enabled: !!username,
  });
}

export function useFollowCounts(username: string | undefined) {
  return useQuery({
    queryKey: ['followCounts', username],
    queryFn: async () =>
      (await api.get<FollowCounts>(`/users/${username}/follow-counts`)).data,
    enabled: !!username,
  });
}

export function useFollowStatus(
  targetUsername: string | undefined,
  viewerUsername: string | undefined,
) {
  return useQuery({
    queryKey: ['followStatus', targetUsername],
    queryFn: async () =>
      (await api.get<FollowStatus>(`/users/${targetUsername}/follow-status`)).data,
    enabled: !!targetUsername && !!viewerUsername && targetUsername !== viewerUsername,
  });
}

function bumpCounts(
  qc: ReturnType<typeof useQueryClient>,
  username: string | undefined,
  key: keyof FollowCounts,
  delta: number,
) {
  if (!username) return;
  qc.setQueryData<FollowCounts>(['followCounts', username], (prev) =>
    prev ? { ...prev, [key]: Math.max(0, prev[key] + delta) } : prev,
  );
}

async function refetchAllFollowQueries(qc: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    qc.refetchQueries({ queryKey: ['followStatus'] }),
    qc.refetchQueries({ queryKey: ['followCounts'] }),
    qc.refetchQueries({ queryKey: ['followers'] }),
    qc.refetchQueries({ queryKey: ['following'] }),
  ]);
}

export function useFollow(targetUsername: string) {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      await api.post(`/users/${targetUsername}/follow`);
    },
    onMutate: () => {
      // Target gains a follower; viewer gains a following. Update caches
      // immediately so counts flip in the same frame as the button.
      bumpCounts(qc, targetUsername, 'followers', +1);
      bumpCounts(qc, user?.username, 'following', +1);
      qc.setQueryData<FollowStatus>(['followStatus', targetUsername], (prev) => ({
        isFollowing: true,
        isFollowedBy: prev?.isFollowedBy ?? false,
      }));
    },
    onSettled: () => refetchAllFollowQueries(qc),
  });
}

export function useUnfollow(targetUsername: string) {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      await api.delete(`/users/${targetUsername}/follow`);
    },
    onMutate: () => {
      bumpCounts(qc, targetUsername, 'followers', -1);
      bumpCounts(qc, user?.username, 'following', -1);
      qc.setQueryData<FollowStatus>(['followStatus', targetUsername], (prev) => ({
        isFollowing: false,
        isFollowedBy: prev?.isFollowedBy ?? false,
      }));
    },
    onSettled: () => refetchAllFollowQueries(qc),
  });
}
