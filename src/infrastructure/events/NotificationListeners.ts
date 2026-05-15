import type { EventBus } from "../../domain/events/EventBus.js";
import type { NotificationService } from "../../application/services/NotificationService.js";
import { CommentCreatedEventSchema } from "../../domain/events/NotificationEvents.js";
import { LikeCreatedEventSchema, LikeRemovedEventSchema } from "../../domain/events/LikeEvents.js";
import { PostDeletedEventSchema } from "../../domain/events/PostEvents.js";

export class NotificationListeners {
  constructor(
    private notificationService: NotificationService,
    private eventBus: EventBus
  ) {
    this.register();
  }

  private register() {
    // Listener: Comentarios
    this.eventBus.on('comment.created', async (event) => {
      try {
        const validated = CommentCreatedEventSchema.parse(event);
        await this.notificationService.handleCommentCreated(validated);
      } catch (error) {
        console.error('Error al procesar notificación de comentario:', error);
      }
    });

    // Listener: Like Creado
    this.eventBus.on('like.created', async (event) => {
      try {
        const validated = LikeCreatedEventSchema.parse(event);
        await this.notificationService.handleLikeCreated(validated);
      } catch (error) {
        console.error('Error al procesar notificación de like:', error);
      }
    });

    // Listener: Like Eliminado
    this.eventBus.on('like.removed', async (event) => {
      try {
        const validated = LikeRemovedEventSchema.parse(event);
        await this.notificationService.handleLikeRemoved(validated);
      } catch (error) {
        console.error('Error al eliminar notificación de like:', error);
      }
    });

    // Listener: Post Eliminado (Cleanup)
    this.eventBus.on('post.deleted', async (event) => {
      try {
        const validated = PostDeletedEventSchema.parse(event);
        await this.notificationService.handlePostDeleted(validated.postId);
      } catch (error) {
        console.error('Error al limpiar notificaciones del post:', error);
      }
    });
  }
}