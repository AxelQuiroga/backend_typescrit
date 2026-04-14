/**
 * DTO para la petición HTTP de crear un comentario.
 *
 * @remarks
 * El authorId NO va aquí - viene del JWT en el controller.
 * El postId puede venir del body o de los parámetros de URL.
 */
export interface CreateCommentRequest {
  /** Contenido del comentario (mínimo 1 carácter, máximo 2000) */
  content: string;

  /** ID del post a comentar (UUID) */
  postId: string;

  /** ID del comentario padre para respuestas (null o undefined = comentario raíz) */
  parentId?: string | null;
}
