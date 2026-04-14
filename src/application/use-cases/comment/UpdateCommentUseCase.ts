import type { CommentRepository } from "../../../domain/repositories/CommentRepository.js";
import type { UpdateCommentInput } from "../../contracts/comment/UpdateCommentInput.js";
import type { CommentOutput } from "../../contracts/comment/CommentOutput.js";

/**
 * Caso de uso para actualizar un comentario.
 *
 * @remarks
 * Lógica de negocio:
 * 1. Validar que el comentario exista
 * 2. Verificar que el usuario sea el autor (autorización)
 * 3. Validar que el nuevo contenido no esté vacío
 * 4. Actualizar el comentario
 *
 * @example
 * ```typescript
 * const useCase = new UpdateCommentUseCase(commentRepo);
 * const result = await useCase.execute("user-123", "comment-456", {
 *   content: "Contenido actualizado"
 * });
 * ```
 */
export class UpdateCommentUseCase {
  constructor(private commentRepository: CommentRepository) {}

  /**
   * Ejecuta la actualización de un comentario.
   *
   * @param userId - ID del usuario autenticado (JWT)
   * @param commentId - ID del comentario a actualizar
   * @param data - Nuevo contenido
   * @returns Comentario actualizado
   * @throws {Error} "Comentario no encontrado" - Si no existe
   * @throws {Error} "No autorizado" - Si el usuario no es el autor
   * @throws {Error} "El contenido es requerido" - Si content está vacío
   */
  async execute(
    userId: string,
    commentId: string,
    data: UpdateCommentInput
  ): Promise<CommentOutput> {
    // 1. Buscar el comentario
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new Error("Comentario no encontrado");
    }

    // 2. Verificar autorización (solo el autor puede editar)
    if (comment.authorId !== userId) {
      throw new Error("No autorizado para editar este comentario");
    }

    // 3. Validar nuevo contenido
    if (!data.content || data.content.trim().length === 0) {
      throw new Error("El contenido es requerido");
    }

    // 4. Actualizar
    const updated = await this.commentRepository.update(
      commentId,
      data.content.trim()
    );

    if (!updated) {
      throw new Error("Error al actualizar el comentario");
    }

    // 5. Construir output
    return {
      id: updated.id,
      content: updated.content,
      authorId: updated.authorId,
      postId: updated.postId,
      parentId: updated.parentId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      author: {
        id: userId,
        username: "" // Se completa en el mapper
      },
      repliesCount: 0 // El use case de get se encarga de contar
    };
  }
}
