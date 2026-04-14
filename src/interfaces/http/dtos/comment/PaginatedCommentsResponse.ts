import type { CommentResponse } from "./CommentResponse.js";

/**
 * DTO para la respuesta HTTP paginada de comentarios.
 */
export interface PaginatedCommentsResponse {
  /** Lista de comentarios */
  data: CommentResponse[];

  /** Metadatos de paginación */
  meta: {
    /** Página actual */
    page: number;

    /** Items por página */
    limit: number;

    /** Total de items */
    total: number;

    /** Total de páginas */
    totalPages: number;
  };
}
