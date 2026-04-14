/**
 * Entidad de dominio: Comment
 *
 * Representa un comentario o respuesta en la red social.
 * Puede ser un comentario raíz (parentId = null) o una respuesta a otro comentario.
 */
export interface Comment {
  /** ID único del comentario (UUID) */
  id: string;

  /** Contenido del comentario en texto plano */
  content: string;

  /** ID del usuario autor */
  authorId: string;

  /** ID del post al que pertenece */
  postId: string;

  /** ID del comentario padre (null si es comentario raíz) */
  parentId: string | null;

  /** Fecha de creación */
  createdAt: Date;

  /** Fecha de última modificación */
  updatedAt: Date;
}
