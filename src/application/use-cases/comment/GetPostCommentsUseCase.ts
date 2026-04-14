import type { CommentRepository } from "../../../domain/repositories/CommentRepository.js";
import type { PaginatedCommentsOutput } from "../../contracts/comment/PaginatedCommentsOutput.js";

/**
 * Caso de uso para obtener los comentarios de un post.
 *
 * @remarks
 * Devuelve SOLO comentarios raíz (parentId = null).
 * Las respuestas se cargan por separado con GetCommentRepliesUseCase.
 *
 * Ordenamiento: más recientes primero (createdAt DESC).
 *
 * @example
 * ```typescript
 * const useCase = new GetPostCommentsUseCase(commentRepo);
 * const result = await useCase.execute("post-123", 1, 10);
 * console.log(result.comments.length); // 10 comentarios raíz
 * console.log(result.meta.total);      // Total de comentarios
 * ```
 */
export class GetPostCommentsUseCase {
  constructor(private commentRepository: CommentRepository) {}

  /**
   * Ejecuta la consulta de comentarios de un post.
   *
   * @param postId - ID del post
   * @param page - Número de página (1-based)
   * @param limit - Comentarios por página
   * @returns Lista paginada de comentarios raíz
   */
  async execute(
    postId: string,
    page: number,
    limit: number
  ): Promise<PaginatedCommentsOutput> {
    const { comments, total } = await this.commentRepository.findByPostId(
      postId,
      page,
      limit
    );

    return {
      comments: comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        authorId: comment.authorId,
        postId: comment.postId,
        parentId: comment.parentId,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: {
          id: comment.authorId,
          username: "" // Se completa en el mapper con join o query adicional
        },
        repliesCount: 0 // Se calcula con countByParentId en el repo
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
