import type { Post } from "./Post.js";

export interface PostWithAuthor extends Post {
  author: {
    id: string;
    username: string;
  };
}
