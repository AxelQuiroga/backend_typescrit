export interface Notification {
  id: string;
  userId: string;
  type: 'COMMENT_ON_POST' | 'REPLY_ON_COMMENT' | 'LIKE_ON_POST';
  title: string;
  message: string;
  read: boolean;
  actorId: string;
  postId?: string;
  commentId?: string;
  createdAt: Date;
}