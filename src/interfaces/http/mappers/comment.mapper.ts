import type { CreateCommentRequest } from "../dtos/comment/CreateCommentRequest.js";
import type { UpdateCommentRequest } from "../dtos/comment/UpdateCommentRequest.js";
import type { CommentResponse } from "../dtos/comment/CommentResponse.js";
import type { PaginatedCommentsResponse } from "../dtos/comment/PaginatedCommentsResponse.js";
import type { CreateCommentInput } from "../../../application/contracts/comment/CreateCommentInput.js";
import type { UpdateCommentInput } from "../../../application/contracts/comment/UpdateCommentInput.js";
import type { CommentOutput } from "../../../application/contracts/comment/CommentOutput.js";
import type { PaginatedCommentsOutput } from "../../../application/contracts/comment/PaginatedCommentsOutput.js";

/**
 * Sanitiza el contenido para prevenir XSS.
 * Escapa caracteres HTML peligrosos.
 */
function sanitizeContent(content: string): string {
  return content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Transforma el request HTTP a contracto de aplicación para crear comentario.
 *
 * @param body - Body del request HTTP
 * @returns Contracto listo para el use case
 */
export function toCreateCommentInput(body: CreateCommentRequest): CreateCommentInput {
  return {
    content: sanitizeContent(body.content.trim()),
    postId: body.postId,
    parentId: body.parentId ?? null
  };
}

/**
 * Transforma el request HTTP a contracto de aplicación para actualizar comentario.
 *
 * @param body - Body del request HTTP
 * @returns Contracto listo para el use case
 */
export function toUpdateCommentInput(body: UpdateCommentRequest): UpdateCommentInput {
  return {
    content: sanitizeContent(body.content.trim())
  };
}

/**
 * Transforma la salida del use case a respuesta HTTP.
 *
 * @param output - Salida del use case
 * @returns Respuesta HTTP lista para JSON
 *
 * @remarks
 * Convierte Date a string ISO y enriquece con datos del autor si es necesario.
 */
export function toCommentResponse(output: CommentOutput): CommentResponse {
  return {
    id: output.id,
    content: output.content,
    authorId: output.authorId,
    author: output.author, // El use case ya debe incluir el author info
    postId: output.postId,
    parentId: output.parentId,
    createdAt: output.createdAt.toISOString(),
    updatedAt: output.updatedAt.toISOString(),
    repliesCount: output.repliesCount
  };
}

/**
 * Transforma la respuesta paginada del use case a respuesta HTTP.
 *
 * @param output - Salida paginada del use case
 * @returns Respuesta HTTP paginada
 */
export function toPaginatedCommentsResponse(
  output: PaginatedCommentsOutput
): PaginatedCommentsResponse {
  return {
    data: output.comments.map(toCommentResponse),
    meta: output.meta
  };
}

/**
 * Extrae el commentId de los parámetros de URL.
 *
 * @param params - Parámetros de Express (req.params)
 * @returns commentId como string
 */
export function extractCommentId(params: { id: string }): string {
  return params.id;
}

/**
 * Extrae el postId de los parámetros de URL.
 *
 * @param params - Parámetros de Express (req.params)
 * @returns postId como string
 */
export function extractPostId(params: { id: string }): string {
  return params.id;
}
