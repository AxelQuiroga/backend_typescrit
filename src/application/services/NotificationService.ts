import type { NotificationRepository } from "../../domain/repositories/NotificationRepository.js";
import type { CommentRepository } from "../../domain/repositories/CommentRepository.js";

export class NotificationService {
  constructor(
    private notificationRepo: NotificationRepository,
    private commentRepo: CommentRepository
  ) {}

    async handleCommentCreated(data: {
      postId: string;
      postAuthorId: string;
      commentId: string;
      commentAuthorId: string;
      parentCommentId?: string | null | undefined;
    }) {
    // 1. Notificar al autor del post (si no es él mismo)
    if (data.postAuthorId !== data.commentAuthorId) {
      await this.notificationRepo.create({
        userId: data.postAuthorId,
        type: 'COMMENT_ON_POST',
        title: 'Nuevo comentario',
        message: 'Alguien comentó en tu post',
        actorId: data.commentAuthorId,
        postId: data.postId,
        commentId: data.commentId,
        read: false
      });
    }

     // 2. Si es respuesta, notificar al autor del comentario padre
     if (data.parentCommentId && data.parentCommentId !== null) {
       const parentComment = await this.commentRepo.findById(data.parentCommentId);
       if (parentComment && parentComment.authorId !== data.commentAuthorId) {
         await this.notificationRepo.create({
           userId: parentComment.authorId,
           type: 'REPLY_ON_COMMENT',
           title: 'Nueva respuesta',
           message: 'Alguien respondió tu comentario',
           actorId: data.commentAuthorId,
           postId: data.postId,
           commentId: data.commentId,
           read: false
         });
       }
     }
  }

  async handleLikeCreated(data: {
    postId: string;
    postAuthorId: string;
    likerId: string;
  }) {
    // No notificar auto-likes
    if (data.postAuthorId === data.likerId) return;

    // Idempotencia: verificar si ya existe la notificación
    const existing = await this.notificationRepo.findByCriteria({
      userId: data.postAuthorId,
      actorId: data.likerId,
      postId: data.postId,
      type: 'LIKE_ON_POST'
    });

    if (existing.length > 0) return;

    await this.notificationRepo.create({
      userId: data.postAuthorId,
      type: 'LIKE_ON_POST',
      title: 'Nuevo me gusta',
      message: 'Alguien dio me gusta a tu post',
      actorId: data.likerId,
      postId: data.postId,
      read: false
    });
  }

  async handleLikeRemoved(data: {
    postId: string;
    postAuthorId: string;
    likerId: string;
  }) {
    await this.notificationRepo.deleteByCriteria({
      userId: data.postAuthorId,
      actorId: data.likerId,
      postId: data.postId,
      type: 'LIKE_ON_POST'
    });
  }

  async handlePostDeleted(postId: string) {
    await this.notificationRepo.deleteByCriteria({ postId });
  }
}
