import type { CommentRepository } from "../../../domain/repositories/CommentRepository.js";
import type { PostRepository } from "../../../domain/repositories/PostRepository.js";
import type { CreateCommentInput } from "../../contracts/comment/CreateCommentInput.js";
import type { CommentOutput } from "../../contracts/comment/CommentOutput.js";

/**
 * Caso de uso para crear un comentario o respuesta.
 *
 * @remarks
 * Lógica de negocio:
 * 1. Si es comentario raíz (parentId = null): validar que el post exista
 * 2. Si es respuesta (parentId != null): validar que el comentario padre exista
 * 3. Validar que el contenido no esté vacío
 * 4. Crear el comentario
 *
 * @example
 * ```typescript
 * // Comentar un post
 * const useCase = new CreateCommentUseCase(commentRepo, postRepo);
 * const result = await useCase.execute("user-123", {
 *   content: "Gran post!",
 *   postId: "post-456",
 *   parentId: null
 * });
 *
 * // Responder a un comentario
 * const result = await useCase.execute("user-123", {
 *   content: "Gracias!",
 *   postId: "post-456",
 *   parentId: "comment-789"
 * });
 * ```
 */
export class CreateCommentUseCase {
  constructor(
    private commentRepository: CommentRepository,
    private postRepository: PostRepository
  ) {}

  /**
   * Ejecuta la creación de un comentario.
   *
   * @param userId - ID del usuario autenticado (JWT)
   * @param data - Datos del comentario
   * @returns Comentario creado con info del autor
   * @throws {Error} "Post no encontrado" - Si el post no existe
   * @throws {Error} "Comentario padre no encontrado" - Si el parent no existe
   * @throws {Error} "El comentario padre no pertenece a este post" - Validación de integridad
   * @throws {Error} "El contenido es requerido" - Si content está vacío
   */
  async execute(
    userId: string,
    data: CreateCommentInput
  ): Promise<CommentOutput> {
    // 1. Validar contenido
    if (!data.content || data.content.trim().length === 0) {
      throw new Error("El contenido es requerido");
    }

    // 2. Validar post exista
    const post = await this.postRepository.findById(data.postId);
    if (!post) {
      throw new Error("Post no encontrado");
    }

    // 3. Si es respuesta, validar que el comentario padre exista y pertenezca al mismo post
    if (data.parentId) {
      const parentComment = await this.commentRepository.findById(data.parentId);
      if (!parentComment) {
        throw new Error("Comentario padre no encontrado");
      }

      if (parentComment.postId !== data.postId) {
        throw new Error("El comentario padre no pertenece a este post");
      }

      // Opcional: evitar respuestas a respuestas (nesting de 1 nivel)
      if (parentComment.parentId !== null) {
        throw new Error("No se puede responder a una respuesta");
      }
    }

    // 4. Crear comentario
    const comment = await this.commentRepository.create({
      content: data.content.trim(),
      authorId: userId,
      postId: data.postId,
      parentId: data.parentId || null
    });

    // 5. Construir output (el repo no devuelve author info, lo armamos manual)
    return {
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      postId: comment.postId,
      parentId: comment.parentId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        id: userId,
        username: "" // Se completa en el mapper con info del token o query adicional
      },
      repliesCount: 0
    };
  }
}
