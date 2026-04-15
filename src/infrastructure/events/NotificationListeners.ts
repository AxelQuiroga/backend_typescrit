import type { NotificationRepository } from "../../domain/repositories/NotificationRepository.js";
import type { UserRepository } from "../../domain/repositories/UserRepository.js";
import type { CommentRepository } from "../../domain/repositories/CommentRepository.js";
import type { EventBus } from "../../domain/events/EventBus.js";

export class NotificationListeners {
  constructor(
    private notificationRepo: NotificationRepository,
    private userRepo: UserRepository,           
    private commentRepo: CommentRepository, 
    private eventBus: EventBus
  ) {
    this.register();
  }

  private register() {
    // Listener 1: Notificar al autor del post
    this.eventBus.on('comment.created', async (event) => {
      // No notificar si el autor se comenta a sí mismo
      if (event.postAuthorId === event.commentAuthorId) return;
      
      await this.notificationRepo.create({
        userId: event.postAuthorId,
        type: 'COMMENT_ON_POST',
        title: 'Nuevo comentario',
        message: 'Alguien comentó en tu post',
        actorId: event.commentAuthorId,
        postId: event.postId,
        commentId: event.commentId,
        read: false
      });
    });

    // Listener 2: Si es respuesta, notificar al autor del comentario padre
    this.eventBus.on('comment.created', async (event) => {
      if (!event.parentCommentId) return;
      
      const parentComment = await this.commentRepo.findById(event.parentCommentId);
      if (!parentComment || parentComment.authorId === event.commentAuthorId) return;
      
      await this.notificationRepo.create({
        userId: parentComment.authorId,
        type: 'REPLY_ON_COMMENT',
        title: 'Nueva respuesta',
        message: 'Alguien respondió tu comentario',
        actorId: event.commentAuthorId,
        postId: event.postId,
        commentId: event.commentId,
        read: false
      });
    });
  }
}