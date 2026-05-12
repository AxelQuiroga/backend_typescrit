/**
 * DTO para la respuesta HTTP de conteo de likes.
 *
 * @remarks
 * Usado en GET /posts/:id/likes para retornar tanto el conteo
 * como el estado de like del usuario actual (si está autenticado).
 */
export interface LikeCountResponse {
  /** ID del post consultado */
  postId: string;
  
  /** Cantidad total de likes del post */
  likesCount: number;
  
  /** Si el usuario actual ha dado like (false si no autenticado) */
  userHasLiked: boolean;
}
