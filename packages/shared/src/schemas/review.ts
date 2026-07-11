import { z } from 'zod';

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).nullable().optional(),
});
export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export type ReviewDto = {
  id: string;
  eventId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  from: {
    id: string;
    username: string;
    name: string;
    surname: string;
    avatarUrl: string | null;
  };
};

export type UserRatingSummary = {
  average: number;
  count: number;
};
