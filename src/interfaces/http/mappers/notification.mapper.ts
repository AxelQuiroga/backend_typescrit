import type { Notification } from "../../../domain/entities/Notification.js";
import type {
  NotificationResponse,
  NotificationsPaginatedResponse
} from "../dtos/notification/NotificationResponse.js";

/**
 * Convierte una entidad Notification a DTO NotificationResponse.
 */
export function toNotificationResponse(notification: Notification): NotificationResponse {
  const response: NotificationResponse = {
    id: notification.id,
    userId: notification.userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    actorId: notification.actorId,
    createdAt: notification.createdAt.toISOString()
  };

  if (notification.postId) {
    response.postId = notification.postId;
  }

  if (notification.commentId) {
    response.commentId = notification.commentId;
  }

  return response;
}

/**
 * Convierte un resultado paginado de notificaciones a DTO.
 */
export function toNotificationsPaginatedResponse(
  result: { notifications: Notification[]; total: number },
  page: number,
  limit: number
): NotificationsPaginatedResponse {
  return {
    data: result.notifications.map(toNotificationResponse),
    meta: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit)
    }
  };
}
