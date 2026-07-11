import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateReviewInput, ReviewDto, UserRatingSummary } from '@skillswap/shared';
import { api } from '@/lib/api';

export function useUserReviews(username: string | undefined) {
  return useQuery({
    queryKey: ['reviews', username],
    queryFn: async () => (await api.get<ReviewDto[]>(`/users/${username}/reviews`)).data,
    enabled: !!username,
  });
}

export function useUserRating(username: string | undefined) {
  return useQuery({
    queryKey: ['rating', username],
    queryFn: async () =>
      (await api.get<UserRatingSummary>(`/users/${username}/rating`)).data,
    enabled: !!username,
  });
}

export function useMyReviewOnEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ['myReview', eventId],
    queryFn: async () =>
      (await api.get<{ review: ReviewDto | null }>(`/events/${eventId}/my-review`)).data.review,
    enabled: !!eventId,
  });
}

export function useCreateReview(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateReviewInput) =>
      (await api.post<ReviewDto>(`/events/${eventId}/reviews`, input)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myReview', eventId] });
      qc.invalidateQueries({ queryKey: ['reviews'] });
      qc.invalidateQueries({ queryKey: ['rating'] });
    },
  });
}
