import type { NotificationRepository } from "../../domain/repositories/NotificationRepository.js";
import type { CommentRepository } from "../../domain/repositories/CommentRepository.js";
import type { EventBus } from "../../domain/events/EventBus.js";
import { CommentCreatedEventSchema } from "../../domain/events/NotificationEvents.js";
import { LikeCreatedEventSchema, LikeRemovedEventSchema } from "../../domain/events/LikeEvents.js";
import { PostDeletedEventSchema } from "../../domain/events/PostEvents.js";

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
        console.error('Error al crear notificación:', error);
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
        console.error('Error al crear notificación de respuesta:', error);
      }
    });

    // Listener 3: Notificar al autor del post cuando le dan like
    this.eventBus.on('like.created', async (event) => {
      try {
        const validated = LikeCreatedEventSchema.parse(event);

        // No notificar auto-likes
        if (validated.postAuthorId === validated.likerId) {
          return;
        }

        // Idempotencia: verificar si ya existe la notificación
        const existing = await this.notificationRepo.findByCriteria({
          userId: validated.postAuthorId,
          actorId: validated.likerId,
          postId: validated.postId,
          type: 'LIKE_ON_POST'
        });
        if (existing.length > 0) {
          return;
        }

        await this.notificationRepo.create({
          userId: validated.postAuthorId,
          type: 'LIKE_ON_POST',
          title: 'Nuevo me gusta',
          message: 'Alguien dio me gusta a tu post',
          actorId: validated.likerId,
          postId: validated.postId,
          read: false
        });
      } catch (error) {
        console.error('Error al crear notificación de like:', error);
      }
    });

    // Listener 4: Eliminar notificación de like cuando se quita
    this.eventBus.on('like.removed', async (event) => {
      try {
        const validated = LikeRemovedEventSchema.parse(event);

        await this.notificationRepo.deleteByCriteria({
          userId: validated.postAuthorId,
          actorId: validated.likerId,
          postId: validated.postId,
          type: 'LIKE_ON_POST'
        });
      } catch (error) {
        console.error('Error al eliminar notificación de like:', error);
      }
    });

    // Listener 5: Cleanup - eliminar notificaciones huérfanas al borrar post
    this.eventBus.on('post.deleted', async (event) => {
      try {
        const validated = PostDeletedEventSchema.parse(event);

        await this.notificationRepo.deleteByCriteria({
          postId: validated.postId
        });
      } catch (error) {
        console.error('Error al limpiar notificaciones:', error);
      }
    });
  }
}