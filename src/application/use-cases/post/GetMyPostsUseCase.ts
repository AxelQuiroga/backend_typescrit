import type { PostRepository } from "../../../domain/repositories/PostRepository.js";
import type { PostWithAuthorDTO } from "../../dtos/PostWithAuthorDTO.js";

export class GetMyPostsUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(userId: string): Promise<PostWithAuthorDTO[]> {
    
    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    const posts = await this.postRepository.findByAuthorId(userId);

    return posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,

      author: {
        id: post.author.id,
        username: post.author.username
      }
    }));
  }
}