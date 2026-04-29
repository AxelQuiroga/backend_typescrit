export interface PostWithAuthorPublicOutput {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  likesCount: number;
  author: {
    id: string;
    username: string;
  };
}
