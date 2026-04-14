import type { Comment } from "../entities/Comment.js";

/**
 * Interface del repositorio de comentarios.
 *
 * Define el contrato de persistencia para comentarios sin acoplarse
 * a la implementación específica (Prisma).
 */
export interface CommentRepository {
  /** Crea un comentario. Retorna el comentario creado. */
  create(data: {
    content: string;
    authorId: string;
    postId: string;
    parentId?: string | null;
  }): Promise<Comment>;

  /** Actualiza el contenido de un comentario. Retorna null si no existe. */
  update(id: string, content: string): Promise<Comment | null>;

  /** Elimina un comentario. Retorna true si se eliminó. */
  delete(id: string): Promise<boolean>;

  /** Busca un comentario por ID. Retorna null si no existe. */
  findById(id: string): Promise<Comment | null>;

  /** Lista comentarios de un post (solo raíces, sin respuestas). */
  findByPostId(postId: string, page: number, limit: number): Promise<{
    comments: Comment[];
    total: number;
  }>;

  /** Lista respuestas de un comentario padre. */
  findRepliesByParentId(parentId: string, page: number, limit: number): Promise<{
    comments: Comment[];
    total: number;
  }>;

  /** Cuenta comentarios de un post. */
  countByPostId(postId: string): Promise<number>;

  /** Verifica si el usuario es autor del comentario. */
  isAuthor(commentId: string, userId: string): Promise<boolean>;
}
