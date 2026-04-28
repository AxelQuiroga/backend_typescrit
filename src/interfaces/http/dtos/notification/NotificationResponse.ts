/**
 * DTO para la respuesta HTTP de una notificación.
 *
 * @remarks
 * Las fechas se devuelven como string ISO (JSON no soporta Date objects).
 */
export interface NotificationResponse {
  /** ID único de la notificación (UUID) */
  id: string;

  /** ID del usuario dueño de la notificación */
  userId: string;

  /** Tipo de notificación */
  type: 'COMMENT_ON_POST' | 'REPLY_ON_COMMENT' | 'LIKE_ON_POST';

  /** Título de la notificación */
  title: string;

  /** Mensaje de la notificación */
  message: string;

  /** Estado de lectura */
  read: boolean;

  /** ID del usuario que generó la notificación (actor) */
  actorId: string;

  /** ID del post relacionado (opcional) */
  postId?: string;

  /** ID del comentario relacionado (opcional) */
  commentId?: string;

  /** Fecha de creación en formato ISO 8601 */
  createdAt: string;
}

/**
 * DTO para la respuesta paginada de notificaciones.
 */
export interface NotificationsPaginatedResponse {
  /** Lista de notificaciones */
  data: NotificationResponse[];

  /** Metadatos de paginación */
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * DTO para la respuesta de conteo de no leídas.
 */
export interface UnreadCountResponse {
  /** Cantidad de notificaciones no leídas */
  count: number;
}

/**
 * DTO para la respuesta de marcar como leída.
 */
export interface MarkAsReadResponse {
  /** Indica si la operación fue exitosa */
  success: boolean;
}

/**
 * DTO para la respuesta de marcar todas como leídas.
 */
export interface MarkAllAsReadResponse {
  /** Cantidad de notificaciones marcadas como leídas */
  count: number;
}
