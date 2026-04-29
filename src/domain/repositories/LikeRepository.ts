import type { Like } from "../entities/Like.js";

export interface LikeRepository {
  /** Crea un like. Devuelve el like o null si ya existe (unique constraint). */
  create(userId: string, postId: string): Promise<Like | null>;
  
  /** Elimina un like por userId + postId. Devuelve true si se eliminó. */
  delete(userId: string, postId: string): Promise<boolean>;
  
  /** Cuenta likes de un post */
  countByPostId(postId: string): Promise<number>;
  
  /** Cuenta likes de múltiples posts en batch */
  countByPostIdsBatch(postIds: string[]): Promise<Map<string, number>>;
  
  /** Verifica si un usuario dio like a un post */
  exists(userId: string, postId: string): Promise<boolean>;
  
  /** Verifica si un usuario dio like a múltiples posts en batch */
  existsBatch(userId: string, postIds: string[]): Promise<Map<string, boolean>>;
  
  /** Obtiene todos los likes de un post (con info del usuario) */
  findByPostId(postId: string): Promise<Like[]>;
}