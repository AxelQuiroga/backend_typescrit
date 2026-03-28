import type { Post } from "../entities/Post.js";
import type { PostWithAuthor } from "../entities/PostWithAuthor.js";

export interface PostRepository {
  create(data: {
    title: string;
    content: string;
    authorId: string;
  }): Promise<Post>;


  findAll(page: number, limit: number): Promise<{ posts: PostWithAuthor[]; total: number }>;

  findByAuthorId(authorId: string): Promise<PostWithAuthor[]>;

  findById(id: string): Promise<Post | null>;   //  nuevo
  deleteById(id: string): Promise<void>;        //  nuevo
}