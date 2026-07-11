import { z } from 'zod';

export const sendMessageSchema = z.object({
  toUsername: z.string().min(1),
  body: z.string().min(1).max(2000),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export type MessageDto = {
  id: string;
  fromId: string;
  toId: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export type ThreadPreview = {
  user: {
    id: string;
    username: string;
    name: string;
    surname: string;
    avatarUrl: string | null;
  };
  lastMessage: MessageDto;
  unreadCount: number;
};
