import { z } from 'zod';

export const eventTypeSchema = z.enum(['exchange', 'teach']);
export type EventType = z.infer<typeof eventTypeSchema>;

export const eventStatusSchema = z.enum(['waiting', 'accepted', 'completed', 'cancelled', 'rejected']);
export type EventStatus = z.infer<typeof eventStatusSchema>;

export const createEventSchema = z.object({
  targetUsername: z.string().min(1),
  mySkillId: z.number().int().positive(),
  theirSkillId: z.number().int().positive(),
  startDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date'),
  endDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date'),
  type: eventTypeSchema,
});
export type CreateEventInput = z.infer<typeof createEventSchema>;

export type EventDto = {
  id: string;
  status: EventStatus;
  type: EventType;
  startDate: string;
  endDate: string;
  createdAt: string;
  requester: {
    id: string;
    username: string;
    name: string;
    surname: string;
    avatarUrl: string | null;
  };
  target: {
    id: string;
    username: string;
    name: string;
    surname: string;
    avatarUrl: string | null;
  };
  requesterSkill: { id: number; name: string };
  targetSkill: { id: number; name: string };
  role: 'requester' | 'target';
};
