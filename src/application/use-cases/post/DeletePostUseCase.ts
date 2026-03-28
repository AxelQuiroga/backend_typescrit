import type { PostRepository } from "../../../domain/repositories/PostRepository.js";

export class DeletePostUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(postId: string, userId: string): Promise<void> {
    // 1. Buscar post
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new Error("Post no encontrado");
    }

    // 2. Verificar autorización
    if (post.authorId !== userId) {
      throw new Error("No autorizado");
    }

    // 3. Eliminar
    await this.postRepository.deleteById(postId);
  }
}