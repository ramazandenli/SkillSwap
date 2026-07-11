import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MessageDto, SendMessageInput, ThreadPreview } from '@skillswap/shared';
import { api } from '@/lib/api';

export function useThreads() {
  return useQuery({
    queryKey: ['messages', 'threads'],
    queryFn: async () => (await api.get<ThreadPreview[]>('/messages/threads')).data,
  });
}

export function useThreadMessages(peerUsername: string | undefined) {
  return useQuery({
    queryKey: ['messages', 'thread', peerUsername],
    queryFn: async () =>
      (await api.get<{ messages: MessageDto[]; peerId: string }>(
        `/messages/with/${peerUsername}`,
      )).data,
    enabled: !!peerUsername,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SendMessageInput) =>
      (await api.post<MessageDto>('/messages', input)).data,
    onSuccess: (_msg, vars) => {
      qc.invalidateQueries({ queryKey: ['messages', 'thread', vars.toUsername] });
      qc.invalidateQueries({ queryKey: ['messages', 'threads'] });
    },
  });
}

export function useMarkThreadRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      await api.post(`/messages/mark-read/${username}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', 'threads'] });
    },
  });
}
