/**
 * Datos de entrada para crear un comentario.
 *
 * @remarks
 * - authorId NO va aquí (viene del JWT en controller)
 * - parentId es opcional: null/undefined = comentario raíz
 */
export interface CreateCommentInput {
  /** Contenido del comentario (mínimo 1 carácter) */
  content: string;

  /** ID del post a comentar */
  postId: string;

  /** ID del comentario padre (para respuestas anidadas) */
  parentId?: string | null;
}
