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

  findByAuthorIdPaginated(authorId: string, page: number, limit: number): Promise<{ posts: PostWithAuthor[]; total: number }>;

  findById(id: string): Promise<Post | null>;  
  deleteById(id: string): Promise<void>;        

  update(id: string, data: { title?: string; content?: string }): Promise<Post | null>; 
}