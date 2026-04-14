import type { PostRepository } from "../../../domain/repositories/PostRepository.js";
import type { PostWithAuthorOutput } from "../../contracts/post/PostWithAuthorOutput.js";
import { GetPostLikesCountUseCase } from "../like/GetPostLikesCountUseCase.js";

export class GetPostsUseCase {
  constructor(
    private postRepository: PostRepository,
    private getPostLikesCountUseCase: GetPostLikesCountUseCase
  ) {}

  async execute(
    page: number,
    limit: number,
    userId?: string
  ): Promise<{ posts: PostWithAuthorOutput[]; total: number }> {
    const { posts, total } = await this.postRepository.findAll(page, limit);

    // Obtener likes info para cada post
    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const likesInfo = await this.getPostLikesCountUseCase.execute(
          post.id,
          userId
        );

        return {
          id: post.id,
          title: post.title,
          content: post.content,
          createdAt: post.createdAt,
          author: {
            id: post.author.id,
            username: post.author.username
          },
          likesCount: likesInfo.count,
          userHasLiked: likesInfo.userHasLiked
        };
      })
    );

    return {
      posts: postsWithLikes,
      total
    };
  }
}
