import type { Like } from "../../domain/entities/Like.js";
import type { LikeRepository } from "../../domain/repositories/LikeRepository.js";
import type { PostRepository } from "../../domain/repositories/PostRepository.js";
import { PrismaLikeRepository } from "./PrismaLikeRepository.js";
import { PrismaPostRepository } from "./PrismaPostRepository.js";

/**
 * Decorator que añade lógica de retries a los repositories.
 * 
 * @remarks
 * Esta es una preocupación de infraestructura, no de lógica de negocio.
 * Los Use Cases deben permanecer limpios de detalles técnicos como retries.
 */
export class RetryableLikeRepository implements LikeRepository {
  constructor(
    private decorated: LikeRepository,
    private postRepository: PostRepository,
    private maxRetries: number = 6,
    private retryDelay: number = 300
  ) {}

  async create(userId: string, postId: string) {
    let retries = 0;
    
    while (retries < this.maxRetries) {
      try {
        return await this.decorated.create(userId, postId);
      } catch (error) {
        retries++;
        
        if (retries >= this.maxRetries) {
          if (error instanceof Error && error.message.includes('Foreign key constraint')) {
            throw new Error(`Usuario ${userId} o post ${postId} no encontrado`);
          }
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
    
    throw new Error("Error al crear el like después de reintentos");
  }

  async exists(userId: string, postId: string): Promise<boolean> {
    return this.decorated.exists(userId, postId);
  }

  async delete(userId: string, postId: string): Promise<boolean> {
    return this.decorated.delete(userId, postId);
  }

  async countByPostId(postId: string): Promise<number> {
    return this.decorated.countByPostId(postId);
  }

  async findByPostId(postId: string): Promise<Like[]> {
    return this.decorated.findByPostId(postId);
  }

  async countByPostIdsBatch(postIds: string[]): Promise<Map<string, number>> {
    return this.decorated.countByPostIdsBatch(postIds);
  }

  async existsBatch(userId: string, postIds: string[]): Promise<Map<string, boolean>> {
    return this.decorated.existsBatch(userId, postIds);
  }
}

/**
 * Factory para crear RetryableLikeRepository con las dependencias correctas
 */
export function createRetryableLikeRepository(
  likeRepository: PrismaLikeRepository,
  postRepository: PrismaPostRepository
): RetryableLikeRepository {
  return new RetryableLikeRepository(likeRepository, postRepository);
}
