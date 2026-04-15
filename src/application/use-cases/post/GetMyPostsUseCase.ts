import type { PostRepository } from "../../../domain/repositories/PostRepository.js";
import type { PostWithAuthorOutput } from "../../contracts/post/PostWithAuthorOutput.js";
import type { LikeRepository } from "../../../domain/repositories/LikeRepository.js";

export class GetMyPostsUseCase {
  constructor(private postRepository: PostRepository,
    private likeRepository: LikeRepository
  ) {}

  async execute(userId: string): Promise<PostWithAuthorOutput[]> {
    
    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    const posts = await this.postRepository.findByAuthorId(userId);

    // Enriquecer cada post con info de likes
    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const likesCount = await this.likeRepository.countByPostId(post.id);
        const userHasLiked = await this.likeRepository.exists(userId, post.id);

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
      })
    );

    return postsWithLikes;
  }
}
