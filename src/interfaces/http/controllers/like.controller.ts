import type { Request, Response } from "express";
import { LikePostUseCase } from "../../../application/use-cases/like/LikePostUseCase.js";
import { UnlikePostUseCase } from "../../../application/use-cases/like/UnlikePostUseCase.js";
import { GetPostLikesCountUseCase } from "../../../application/use-cases/like/GetPostLikesCountUseCase.js";
import type { LikePostRequest } from "../dtos/like/LikePostRequest.js";
import type { UnlikePostRequest } from "../dtos/like/UnlikePostRequest.js";
import type { LikeCountResponse } from "../dtos/like/LikeCountResponse.js";
import {
  toLikePostInput,
  toUnlikePostInput,
  toLikeResponse,
  toLikeCountResponse
} from "../mappers/like.mapper.js";

export class LikeController {
  constructor(
    private likePostUseCase: LikePostUseCase,
    private unlikePostUseCase: UnlikePostUseCase,
    private getPostLikesCountUseCase: GetPostLikesCountUseCase
  ) {}

  /**
   * POST /posts/:id/like
   * Da like a un post
   */
  async like(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "No autorizado" });
      }

      // postId viene de la URL: /posts/:id/like
      const { id: postId } = res.locals.validated.params as { id: string };

      const input = toLikePostInput({ postId });
      const like = await this.likePostUseCase.execute(userId, input);

      return res.status(201).json(toLikeResponse(like));
    } catch (error: any) {
      const status =
        error.message === "Post no encontrado" ? 404 :
        error.message === "Ya has dado like a este post" ? 409 : // Conflict
        500;
      return res.status(status).json({ error: error.message });
    }
  }

  /**
   * DELETE /posts/:id/like
   * Quita like a un post
   */
  async unlike(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "No autorizado" });
      }

      // postId viene de la URL: /posts/:id/like
      const { id: postId } = res.locals.validated.params as { id: string };

      const input = toUnlikePostInput({ postId });
      const deleted = await this.unlikePostUseCase.execute(userId, input);

      if (!deleted) {
        // El like no existía, pero devolvemos 204 igual (idempotente)
        return res.status(204).send();
      }

      return res.status(204).send(); // 204 = No Content (éxito sin body)
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Error al quitar like" });
    }
  }

  /**
   * GET /posts/:id/likes
   * Obtiene conteo de likes y si el usuario actual dio like
   */
  async getLikes(req: Request, res: Response) {
    try {
      const userId = req.user?.userId; // Opcional (para saber si dio like)

      const { id: postId } = res.locals.validated.params as { id: string };

      const result = await this.getPostLikesCountUseCase.execute(postId, userId);

      const response = toLikeCountResponse({
        postId,
        likesCount: result.count,
        userHasLiked: result.userHasLiked
      });

      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Error obteniendo likes" });
    }
  }
}
