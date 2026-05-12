import type { LikePostRequest } from "../dtos/like/LikePostRequest.js";
import type { UnlikePostRequest } from "../dtos/like/UnlikePostRequest.js";
import type { LikeResponse } from "../dtos/like/LikeResponse.js";
import type { LikeCountResponse } from "../dtos/like/LikeCountResponse.js";
import type { LikePostInput } from "../../../application/contracts/like/LikePostInput.js";
import type { UnlikePostInput } from "../../../application/contracts/like/UnlikePostInput.js";
import type { LikeOutput } from "../../../application/contracts/like/LikeOutput.js";

/**
 * Transforma el request HTTP a contracto de aplicación para dar like.
 *
 * @param body - Body del request HTTP (LikePostRequest)
 * @returns Contracto listo para el use case (LikePostInput)
 */
export function toLikePostInput(body: LikePostRequest): LikePostInput {
  return {
    postId: body.postId
  };
}

/**
 * Transforma el request HTTP a contracto de aplicación para quitar like.
 *
 * @param body - Body del request HTTP (UnlikePostRequest)
 * @returns Contracto listo para el use case (UnlikePostInput)
 */
export function toUnlikePostInput(body: UnlikePostRequest): UnlikePostInput {
  return {
    postId: body.postId
  };
}

/**
 * Transforma la salida del use case a respuesta HTTP.
 *
 * @param output - Salida del use case (LikeOutput con Date)
 * @returns Respuesta HTTP lista para JSON (LikeResponse con string)
 *
 * @remarks
 * Convierte Date a string ISO porque JSON.stringify no preserva objetos Date.
 */
export function toLikeResponse(output: LikeOutput): LikeResponse {
  return {
    id: output.id,
    userId: output.userId,
    postId: output.postId,
    createdAt: output.createdAt.toISOString()
  };
}

/**
 * Extrae el postId de los parámetros de URL.
 *
 * @param params - Parámetros de Express (req.params)
 * @returns postId como string
 *
 * @remarks
 * Útil cuando el postId viene en la URL (/posts/:id/like) en lugar del body.
 */
export function toLikePostInputFromParams(params: { id: string }): LikePostInput {
  return {
    postId: params.id
  };
}

/**
 * Transforma el output del use case a response HTTP de conteo de likes.
 *
 * @param output - Datos del use case (LikeCountOutput)
 * @returns Response HTTP listo para enviar (LikeCountResponse)
 */
export function toLikeCountResponse(output: {
  postId: string;
  likesCount: number;
  userHasLiked: boolean;
}): LikeCountResponse {
  return {
    postId: output.postId,
    likesCount: output.likesCount,
    userHasLiked: output.userHasLiked
  };
}
