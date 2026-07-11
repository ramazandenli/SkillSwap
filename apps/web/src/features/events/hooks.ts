import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateEventInput, EventDto } from '@skillswap/shared';
import { api } from '@/lib/api';
import { useAuth } from '@/auth/AuthContext';

export function useUserEvents(username: string | undefined) {
  return useQuery({
    queryKey: ['events', username],
    queryFn: async () => (await api.get<EventDto[]>(`/users/${username}/events`)).data,
    enabled: !!username,
  });
}

function invalidateEvents(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['events'] });
  qc.invalidateQueries({ queryKey: ['userProfile'] });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateEventInput) =>
      (await api.post<EventDto>('/events', input)).data,
    onSuccess: () => invalidateEvents(qc),
  });
}

export function useAcceptEvent() {
  const qc = useQueryClient();
  const { refreshMe } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => (await api.post<EventDto>(`/events/${id}/accept`)).data,
    onSuccess: async () => {
      invalidateEvents(qc);
      // Accepting an event grants +10 points to both participants; refresh
      // the local user so the header points count reflects it immediately.
      await refreshMe();
    },
  });
}

export function useCompleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.post<EventDto>(`/events/${id}/complete`)).data,
    onSuccess: () => invalidateEvents(qc),
  });
}

export function useCancelEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/events/${id}`);
    },
    onSuccess: () => invalidateEvents(qc),
  });
}
