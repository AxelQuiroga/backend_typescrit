import type { CommentRepository } from "../../../domain/repositories/CommentRepository.js";
import type { PaginatedCommentsOutput } from "../../contracts/comment/PaginatedCommentsOutput.js";

/**
 * Caso de uso para obtener las respuestas de un comentario.
 *
 * @remarks
 * Devuelve las respuestas directas de un comentario padre.
 * En nuestra arquitectura, solo hay 1 nivel de respuestas
 * (no se pueden responder a las respuestas).
 *
 * Ordenamiento: más recientes primero (createdAt DESC).
 *
 * @example
 * ```typescript
 * const useCase = new GetCommentRepliesUseCase(commentRepo);
 * const result = await useCase.execute("comment-456", 1, 5);
 * console.log(result.comments.length); // Respuestas del comentario
 * ```
 */
export class GetCommentRepliesUseCase {
  constructor(private commentRepository: CommentRepository) {}

  /**
   * Ejecuta la consulta de respuestas.
   *
   * @param parentId - ID del comentario padre
   * @param page - Número de página (1-based)
   * @param limit - Respuestas por página
   * @returns Lista paginada de respuestas
   * @throws {Error} "Comentario padre no encontrado" - Si no existe
   */
  async execute(
    parentId: string,
    page: number,
    limit: number
  ): Promise<PaginatedCommentsOutput> {
    // Opcional: validar que el comentario padre exista
    const parent = await this.commentRepository.findById(parentId);
    if (!parent) {
      throw new Error("Comentario padre no encontrado");
    }

    const { comments, total } =
      await this.commentRepository.findRepliesByParentId(parentId, page, limit);

    return {
      comments: comments.map((reply) => ({
        id: reply.id,
        content: reply.content,
        authorId: reply.authorId,
        postId: reply.postId,
        parentId: reply.parentId,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        author: {
          id: reply.authorId,
          username: "" // Se completa en el mapper
        },
        repliesCount: 0 // Las respuestas no pueden tener respuestas (1 nivel)
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
