export interface CommentCreatedEvent {
  type: 'COMMENT_CREATED';
  postId: string;
  postAuthorId: string;      // Quién recibe la notificación
  commentId: string;
  commentAuthorId: string;   // Quién comentó (actor)
  commentContent: string;
  parentCommentId?: string;  // Si es respuesta
}