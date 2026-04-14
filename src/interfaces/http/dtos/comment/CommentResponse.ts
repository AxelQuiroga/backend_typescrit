/**
 * DTO para la respuesta HTTP de un comentario.
 *
 * @remarks
 * Incluye información del autor enriquecida para el frontend.
 * Las fechas se devuelven en formato ISO 8601.
 */
export interface CommentResponse {
  /** ID único del comentario (UUID) */
  id: string;

  /** Contenido del comentario */
  content: string;

  /** ID del autor */
  authorId: string;

  /** Información del autor para mostrar en UI */
  author: {
    id: string;
    username: string;
  };

  /** ID del post al que pertenece */
  postId: string;

  /** ID del comentario padre (null si es comentario raíz) */
  parentId: string | null;

  /** Fecha de creación en formato ISO */
  createdAt: string;

  /** Fecha de última modificación en formato ISO */
  updatedAt: string;

  /** Cantidad de respuestas a este comentario */
  repliesCount: number;
}
