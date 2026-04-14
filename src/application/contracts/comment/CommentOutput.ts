/**
 * Datos de salida de un comentario.
 *
 * @remarks
 * Incluye información del autor y conteo de respuestas.
 */
export interface CommentOutput {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;

  /** Información del autor (para mostrar en UI) */
  author: {
    id: string;
    username: string;
  };

  /** Cantidad de respuestas a este comentario */
  repliesCount: number;
}
