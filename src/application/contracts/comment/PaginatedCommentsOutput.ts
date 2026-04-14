import type { CommentOutput } from "./CommentOutput.js";

/**
 * Respuesta paginada de comentarios.
 */
export interface PaginatedCommentsOutput {
  comments: CommentOutput[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
