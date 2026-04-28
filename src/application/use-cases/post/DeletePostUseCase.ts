import type { PostRepository } from "../../../domain/repositories/PostRepository.js";
import type { EventBus } from "../../../domain/events/EventBus.js";

export class DeletePostUseCase {
  constructor(
    private postRepository: PostRepository,
    private eventBus: EventBus
  ) {}

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

    // 3. Emitir evento antes de eliminar (listeners necesitan postId para cleanup)
    this.eventBus.emit('post.deleted', {
      type: 'POST_DELETED',
      postId: postId,
      authorId: userId
    });

    // 4. Eliminar
    await this.postRepository.deleteById(postId);
  }
}