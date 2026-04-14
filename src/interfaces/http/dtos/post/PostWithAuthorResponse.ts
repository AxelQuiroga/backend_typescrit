export interface PostWithAuthorResponse {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO string
  author: {
    id: string;
    username: string;
  };
  likesCount: number;
  userHasLiked: boolean;
}