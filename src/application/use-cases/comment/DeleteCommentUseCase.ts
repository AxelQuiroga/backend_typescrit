import type { CommentRepository } from "../../../domain/repositories/CommentRepository.js";
import type { PostRepository } from "../../../domain/repositories/PostRepository.js";

/**
 * Caso de uso para eliminar un comentario.
 *
 * @remarks
 * Lógica de negocio:
 * 1. Validar que el comentario exista
 * 2. Verificar que el usuario sea el autor (autorización) O autor del post
 * 3. Si tiene respuestas, eliminarlas en cascada
 * 4. Eliminar el comentario
 *
 * @example
 * ```typescript
 * const useCase = new DeleteCommentUseCase(commentRepo, postRepo);
 * const deleted = await useCase.execute("user-123", "comment-456");
 * console.log(deleted); // true si se eliminó (y sus respuestas)
 * ```
 */
export class DeleteCommentUseCase {
  constructor(
    private commentRepository: CommentRepository,
    private postRepository: PostRepository
  ) {}

  /**
   * Ejecuta la eliminación de un comentario.
   *
   * @param userId - ID del usuario autenticado (JWT)
   * @param commentId - ID del comentario a eliminar
   * @returns true si se eliminó, false si no existía
   * @throws {Error} "No autorizado" - Si el usuario no es el autor ni autor del post
   */
  async execute(userId: string, commentId: string): Promise<boolean> {
    // 1. Buscar el comentario
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      return false; // Idempotente: no hay error si no existe
    }

    // 2. Verificar autorización (autor del comentario O autor del post)
    const post = await this.postRepository.findById(comment.postId);
    const isCommentAuthor = comment.authorId === userId;
    const isPostAuthor = post && post.authorId === userId;

    if (!isCommentAuthor && !isPostAuthor) {
      throw new Error("No autorizado para eliminar este comentario");
    }

    // 3. Si es un comentario raíz con respuestas, eliminar las respuestas primero
    // (CASCADE DELETE manual - en Prisma podría configurarse en el schema)
    if (comment.parentId === null) {
      // Es comentario raíz, buscar y eliminar todas sus respuestas
      const { comments: replies } =
        await this.commentRepository.findRepliesByParentId(commentId, 1, 1000);

      // Eliminar respuestas en paralelo
      await Promise.all(
        replies.map((reply) => this.commentRepository.delete(reply.id))
      );
    }

    // 4. Eliminar el comentario (o respuesta)
    const deleted = await this.commentRepository.delete(commentId);

    return deleted;
  }
}
