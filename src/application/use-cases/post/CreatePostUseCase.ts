import type { PostRepository } from "../../../domain/repositories/PostRepository.js";
import type { EventBus } from "../../../domain/events/EventBus.js";
import type { CreatePostInput } from "../../contracts/post/CreatePostInput.js";
import type { PostOutput } from "../../contracts/post/PostOutput.js";

/**
 * Caso de uso para crear un nuevo post en la red social.
 * 
 * @remarks
 * Este use case encapsula toda la lógica de negocio para la creación de posts:
 * - Validación de campos obligatorios (title, content)
 * - Validación de longitud mínima (title: 3 chars, content: 10 chars)
 * - Asignación automática del autor mediante userId
 * 
 * El post se crea con estado activo y fechas automáticas.
 * 
 * @example
 * ```typescript
 * const useCase = new CreatePostUseCase(postRepository);
 * const result = await useCase.execute("user-123", {
 *   title: "Mi primer post",
 *   content: "Este es el contenido de mi post..."
 * });
 * console.log(result.id); // ID del post creado
 * ```
 */
export class CreatePostUseCase {
  constructor(
    private postRepository: PostRepository,
    private eventBus: EventBus
  ) {}

  /**
   * Ejecuta la creación de un post.
   * 
   * @param userId - ID del usuario autenticado que crea el post
   * @param data - Datos del post (título y contenido validados)
   * @returns Post creado con metadatos completos (id, fechas)
   * @throws {Error} Si faltan campos obligatorios
   * @throws {Error} Si el título tiene menos de 3 caracteres
   * @throws {Error} Si el contenido tiene menos de 10 caracteres
   */
  async execute(
    userId: string,
    data: CreatePostInput
  ): Promise<PostOutput> {

    // Validar existencia
    if (!data.title || !data.content) {
      throw new Error("Faltan campos obligatorios");
    }

    //  Validar contenido
    if (data.title.length < 3) {
      throw new Error("El título es muy corto");
    }

    if (data.content.length < 10) {
      throw new Error("El contenido es muy corto");
    }

    //  Crear post
    const post = await this.postRepository.create({
      title: data.title,
      content: data.content,
      authorId: userId //  clave
    });

    // Emitir evento (para futuros listeners: analytics, followers, etc.)
    this.eventBus.emit('post.created', {
      type: 'POST_CREATED',
      postId: post.id,
      authorId: userId,
      title: post.title
    });

    // Response DTO
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    };
  }
}
