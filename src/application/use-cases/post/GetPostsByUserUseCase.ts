import type { PostRepository } from "../../../domain/repositories/PostRepository.js";
import type { PostWithAuthorOutput } from "../../contracts/post/PostWithAuthorOutput.js";
import type { LikeRepository } from "../../../domain/repositories/LikeRepository.js";

/**
 * Caso de uso para obtener posts públicos de un usuario específico.
 * 
 * @remarks
 * Devuelve los posts de un usuario paginados, sin información de likes del usuario actual
 * ya que es un endpoint público. Incluye el conteo total de likes por post.
 * 
 * @example
 * ```typescript
 * const useCase = new GetPostsByUserUseCase(postRepository, likeRepository);
 * const result = await useCase.execute("user-456", 1, 10);
 * console.log(result.data);     // Array de posts con autor
 * console.log(result.total);    // Total de posts del usuario
 * ```
 */
export class GetPostsByUserUseCase {
  constructor(
    private postRepository: PostRepository,
    private likeRepository: LikeRepository
  ) {}

  async execute(
    userId: string,
    currentUserId?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: PostWithAuthorOutput[]; total: number }> {
    if (!userId) {
      throw new Error("ID de usuario requerido");
    }

    // Validar parámetros de paginación
    if (page < 1) page = 1;
    if (limit < 1 || limit > 50) limit = 10;

    const { posts, total } = await this.postRepository.findByAuthorIdPaginated(
      userId,
      page,
      limit
    );

    // Optimización: Obtener likes en batch para evitar N+1 queries
    const postIds = posts.map(post => post.id);
    
    // Batch query: obtener conteo de likes para todos los posts
    const likesCounts = await this.likeRepository.countByPostIdsBatch(postIds);
    
    // Batch query: obtener likes del usuario actual (si está logueado)
    const userLikes = currentUserId ? 
      await this.likeRepository.existsBatch(currentUserId, postIds) : null;

    // Enriquecer posts con los datos de likes
    const postsWithLikes = posts.map((post) => {
      const likesCount = likesCounts.get(post.id) || 0;
      const userHasLiked = userLikes ? userLikes.get(post.id) || false : false;

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        likesCount,
        userHasLiked,
        author: {
          id: post.author.id,
          username: post.author.username
        }
      };
    });

    return { data: postsWithLikes, total };
  }
}
