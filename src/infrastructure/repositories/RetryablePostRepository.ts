import type { PostRepository } from "../../domain/repositories/PostRepository.js";

/**
 * Decorator que añade lógica de retries a PostRepository.
 * Especialmente útil para manejar condiciones de carrera donde un post
 * recién creado puede no estar disponible inmediatamente para lectura.
 */
export class RetryablePostRepository implements PostRepository {
  constructor(
    private decorated: PostRepository,
    private maxRetries: number = 6,
    private retryDelay: number = 300
  ) {}

  async findById(id: string) {
    let retries = 0;
    while (retries < this.maxRetries) {
      const post = await this.decorated.findById(id);
      if (post) return post;

      retries++;
      if (retries < this.maxRetries) {
        console.log(`[RetryablePostRepository] Post ${id} no encontrado. Reintento ${retries}/${this.maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
    return null;
  }

  async create(data: { title: string; content: string; authorId: string }) {
    return this.decorated.create(data);
  }

  async findAll(page: number, limit: number) {
    return this.decorated.findAll(page, limit);
  }

  async findByAuthorId(authorId: string) {
    return this.decorated.findByAuthorId(authorId);
  }

  async findByAuthorIdPaginated(authorId: string, page: number, limit: number) {
    return this.decorated.findByAuthorIdPaginated(authorId, page, limit);
  }

  async deleteById(id: string) {
    return this.decorated.deleteById(id);
  }

  async update(id: string, data: { title?: string; content?: string }) {
    return this.decorated.update(id, data);
  }
}
