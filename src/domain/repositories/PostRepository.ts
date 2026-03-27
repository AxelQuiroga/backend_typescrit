import type { Post } from "../entities/Post.js";

export interface PostRepository {
  create(data: {
    title: string;
    content: string;
    authorId: string;
  }): Promise<Post>;
}