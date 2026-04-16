import { z } from 'zod';

export const CommentCreatedEventSchema = z.object({
  type: z.literal('COMMENT_CREATED'),
  postId: z.string().uuid(),
  postAuthorId: z.string().uuid(),
  commentId: z.string().uuid(),
  commentAuthorId: z.string().uuid(),
  commentContent: z.string(),
  parentCommentId: z.string().uuid().nullable().optional()
});

export type CommentCreatedEvent = z.infer<typeof CommentCreatedEventSchema>;