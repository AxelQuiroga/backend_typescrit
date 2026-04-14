/**
 * Datos de entrada para actualizar un comentario.
 *
 * @remarks
 * Solo el autor puede actualizar. No se puede cambiar el post ni el parent.
 */
export interface UpdateCommentInput {
  /** Nuevo contenido del comentario */
  content: string;
}
