import { z } from 'zod';

export const LikeCreatedEventSchema = z.object({
  type: z.literal('LIKE_CREATED'),
  postId: z.string().uuid(),
  postAuthorId: z.string().uuid(),
  likerId: z.string().uuid(),
  likeId: z.string().uuid()
});

export const LikeRemovedEventSchema = z.object({
  type: z.literal('LIKE_REMOVED'),
  postId: z.string().uuid(),
  postAuthorId: z.string().uuid(),
  likerId: z.string().uuid()
});

export type LikeCreatedEvent = z.infer<typeof LikeCreatedEventSchema>;
export type LikeRemovedEvent = z.infer<typeof LikeRemovedEventSchema>;
