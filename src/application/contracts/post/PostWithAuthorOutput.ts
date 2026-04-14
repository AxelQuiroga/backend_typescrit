export interface PostWithAuthorOutput {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    username: string;
  };
  /** Cantidad total de likes del post */
  likesCount: number;
  /** True si el usuario autenticado dio like a este post */
  userHasLiked: boolean;
}