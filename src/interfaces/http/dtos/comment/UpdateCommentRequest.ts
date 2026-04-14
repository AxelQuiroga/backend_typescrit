/**
 * DTO para la petición HTTP de actualizar un comentario.
 *
 * @remarks
 * Solo el contenido es editable. No se puede cambiar el post ni el parentId.
 */
export interface UpdateCommentRequest {
  /** Nuevo contenido del comentario */
  content: string;
}
