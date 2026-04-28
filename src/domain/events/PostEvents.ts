import { z } from 'zod';

export const PostCreatedEventSchema = z.object({
  type: z.literal('POST_CREATED'),
  postId: z.string().uuid(),
  authorId: z.string().uuid(),
  title: z.string()
});

export const PostDeletedEventSchema = z.object({
  type: z.literal('POST_DELETED'),
  postId: z.string().uuid(),
  authorId: z.string().uuid()
});

export type PostCreatedEvent = z.infer<typeof PostCreatedEventSchema>;
export type PostDeletedEvent = z.infer<typeof PostDeletedEventSchema>;
