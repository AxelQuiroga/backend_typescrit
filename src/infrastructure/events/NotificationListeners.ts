import type { NotificationRepository } from "../../domain/repositories/NotificationRepository.js";
import type { CommentRepository } from "../../domain/repositories/CommentRepository.js";
import type { EventBus } from "../../domain/events/EventBus.js";
import { CommentCreatedEventSchema } from "../../domain/events/NotificationEvents.js";

export class NotificationListeners {
  constructor(
    private notificationRepo: NotificationRepository,
    private commentRepo: CommentRepository, 
    private eventBus: EventBus
  ) {
    this.register();
  }

  private register() {
    // Listener 1: Notificar al autor del post
    this.eventBus.on('comment.created', async (event) => {
      try {
        const validated = CommentCreatedEventSchema.parse(event);

        // No notificar si el autor se comenta a sí mismo
        if (validated.postAuthorId === validated.commentAuthorId) {
          return;
        }

        await this.notificationRepo.create({
          userId: validated.postAuthorId,
          type: 'COMMENT_ON_POST',
          title: 'Nuevo comentario',
          message: 'Alguien comentó en tu post',
          actorId: validated.commentAuthorId,
          postId: validated.postId,
          commentId: validated.commentId,
          read: false
        });
      } catch (error) {
        console.error('[NotificationListener] Error al crear notificación:', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          event: {
            type: event.type,
            postId: event.postId,
            postAuthorId: event.postAuthorId,
            commentId: event.commentId,
            commentAuthorId: event.commentAuthorId
          },
          timestamp: new Date().toISOString()
        });
      }
    });

    // Listener 2: Si es respuesta, notificar al autor del comentario padre
    this.eventBus.on('comment.created', async (event) => {
      try {
        const validated = CommentCreatedEventSchema.parse(event);

        if (!validated.parentCommentId) return;

        const parentComment = await this.commentRepo.findById(validated.parentCommentId);
        if (!parentComment || parentComment.authorId === validated.commentAuthorId) return;

        await this.notificationRepo.create({
          userId: parentComment.authorId,
          type: 'REPLY_ON_COMMENT',
          title: 'Nueva respuesta',
          message: 'Alguien respondió tu comentario',
          actorId: validated.commentAuthorId,
          postId: validated.postId,
          commentId: validated.commentId,
          read: false
        });
      } catch (error) {
        console.error('[NotificationListener] Error al crear notificación de respuesta:', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          event: {
            type: event.type,
            postId: event.postId,
            commentId: event.commentId,
            parentCommentId: event.parentCommentId,
            commentAuthorId: event.commentAuthorId
          },
          timestamp: new Date().toISOString()
        });
      }
    });
  }
}