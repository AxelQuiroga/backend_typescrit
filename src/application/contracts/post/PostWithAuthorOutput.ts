export interface PostWithAuthorOutput {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  likesCount: number;
  userHasLiked: boolean;
  author: {
    id: string;
    username: string;
  };

}