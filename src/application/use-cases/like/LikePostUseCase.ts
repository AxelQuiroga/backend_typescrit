import type { LikeRepository } from "../../../domain/repositories/LikeRepository.js";
import type { PostRepository } from "../../../domain/repositories/PostRepository.js";
import type { EventBus } from "../../../domain/events/EventBus.js";
import type { LikePostInput } from "../../contracts/like/LikePostInput.js";
import type { LikeOutput } from "../../contracts/like/LikeOutput.js";

/**
 * Caso de uso para dar like a un post.
 *
 * @remarks
 * Lógica de negocio:
 * - Verifica que el post exista
 * - Verifica que el usuario no haya dado like previamente
 * - Crea el like si pasa las validaciones
 *
 * La autorización (userId) viene del JWT, no del input.
 *
 * @example
 * ```typescript
 * const useCase = new LikePostUseCase(likeRepository, postRepository);
 * const result = await useCase.execute("user-123", { postId: "post-456" });
 * console.log(result.id); // ID del like creado
 * ```
 */
export class LikePostUseCase {
  constructor(
    private likeRepository: LikeRepository,
    private postRepository: PostRepository,
    private eventBus: EventBus
  ) {}

  /**
   * Ejecuta la creación de un like.
   *
   * @param userId - ID del usuario autenticado (del JWT)
   * @param data - Datos de entrada (postId)
   * @returns Like creado con metadatos
   * @throws {Error} "Post no encontrado" - Si el post no existe
   * @throws {Error} "Ya has dado like a este post" - Si el like ya existe
   */
  async execute(userId: string, data: LikePostInput): Promise<LikeOutput> {

    const post = await this.postRepository.findById(data.postId);
    if (!post) {
      throw new Error("Post no encontrado");
    }

    const alreadyLiked = await this.likeRepository.exists(userId, data.postId);
    if (alreadyLiked) {
      throw new Error("Ya has dado like a este post");
    }

    const like = await this.likeRepository.create(userId, data.postId);
    if (!like) {
      throw new Error("Error al crear el like");
    }

    // Emitir evento (no esperamos respuesta)
    this.eventBus.emit('like.created', {
      type: 'LIKE_CREATED',
      postId: data.postId,
      postAuthorId: post.authorId,
      likerId: userId,
      likeId: like.id
    });

    return {
      id: like.id,
      userId: like.userId,
      postId: like.postId,
      createdAt: like.createdAt
    };
  }
}
