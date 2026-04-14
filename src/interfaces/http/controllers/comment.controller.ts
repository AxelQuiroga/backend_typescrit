import type { Request, Response } from "express";
import { CreateCommentUseCase } from "../../../application/use-cases/comment/CreateCommentUseCase.js";
import { UpdateCommentUseCase } from "../../../application/use-cases/comment/UpdateCommentUseCase.js";
import { DeleteCommentUseCase } from "../../../application/use-cases/comment/DeleteCommentUseCase.js";
import { GetPostCommentsUseCase } from "../../../application/use-cases/comment/GetPostCommentsUseCase.js";
import { GetCommentRepliesUseCase } from "../../../application/use-cases/comment/GetCommentRepliesUseCase.js";
import type { CreateCommentRequest } from "../dtos/comment/CreateCommentRequest.js";
import type { UpdateCommentRequest } from "../dtos/comment/UpdateCommentRequest.js";
import {
  toCreateCommentInput,
  toUpdateCommentInput,
  toCommentResponse,
  toPaginatedCommentsResponse,
  extractCommentId,
  extractPostId
} from "../mappers/comment.mapper.js";

export class CommentController {
  constructor(
    private createCommentUseCase: CreateCommentUseCase,
    private updateCommentUseCase: UpdateCommentUseCase,
    private deleteCommentUseCase: DeleteCommentUseCase,
    private getPostCommentsUseCase: GetPostCommentsUseCase,
    private getCommentRepliesUseCase: GetCommentRepliesUseCase
  ) {}

  /**
   * POST /posts/:id/comments
   * Crea un comentario o respuesta en un post.
   */
  async create(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "No autorizado" });
      }

      // postId viene de la URL
      const postId = extractPostId(res.locals.validated.params as { id: string });

      // Body validado
      const body = res.locals.validated.body as CreateCommentRequest;

      // Combinar postId del URL con el body
      const input = toCreateCommentInput({
        ...body,
        postId
      });

      const comment = await this.createCommentUseCase.execute(userId, input);
      return res.status(201).json(toCommentResponse(comment));
    } catch (error: any) {
      const status =
        error.message === "Post no encontrado" ? 404 :
        error.message === "Comentario padre no encontrado" ? 404 :
        error.message === "El comentario padre no pertenece a este post" ? 400 :
        error.message === "No se puede responder a una respuesta" ? 400 :
        error.message === "El contenido es requerido" ? 400 :
        500;
      return res.status(status).json({ error: error.message });
    }
  }

  /**
   * PUT /comments/:id
   * Actualiza un comentario (solo el autor).
   */
  async update(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "No autorizado" });
      }

      const commentId = extractCommentId(res.locals.validated.params as { id: string });
      const body = res.locals.validated.body as UpdateCommentRequest;

      const input = toUpdateCommentInput(body);
      const comment = await this.updateCommentUseCase.execute(userId, commentId, input);

      return res.json(toCommentResponse(comment));
    } catch (error: any) {
      const status =
        error.message === "Comentario no encontrado" ? 404 :
        error.message === "No autorizado para editar este comentario" ? 403 :
        error.message === "El contenido es requerido" ? 400 :
        500;
      return res.status(status).json({ error: error.message });
    }
  }

  /**
   * DELETE /comments/:id
   * Elimina un comentario (solo el autor, con cascada de respuestas).
   */
  async delete(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "No autorizado" });
      }

      const commentId = extractCommentId(res.locals.validated.params as { id: string });
      const deleted = await this.deleteCommentUseCase.execute(userId, commentId);

      if (!deleted) {
        return res.status(404).json({ error: "Comentario no encontrado" });
      }

      return res.status(204).send();
    } catch (error: any) {
      const status =
        error.message === "No autorizado para eliminar este comentario" ? 403 :
        500;
      return res.status(status).json({ error: error.message });
    }
  }

  /**
   * GET /posts/:id/comments
   * Lista comentarios raíz de un post (paginado).
   */
  async getByPost(req: Request, res: Response) {
    try {
      const postId = extractPostId(res.locals.validated.params as { id: string });
      const { page, limit } = res.locals.validated.query as { page: number; limit: number };

      const result = await this.getPostCommentsUseCase.execute(postId, page, limit);
      return res.json(toPaginatedCommentsResponse(result));
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Error obteniendo comentarios" });
    }
  }

  /**
   * GET /comments/:id/replies
   * Lista respuestas de un comentario (paginado).
   */
  async getReplies(req: Request, res: Response) {
    try {
      const commentId = extractCommentId(res.locals.validated.params as { id: string });
      const { page, limit } = res.locals.validated.query as { page: number; limit: number };

      const result = await this.getCommentRepliesUseCase.execute(commentId, page, limit);
      return res.json(toPaginatedCommentsResponse(result));
    } catch (error: any) {
      const status =
        error.message === "Comentario padre no encontrado" ? 404 :
        500;
      return res.status(status).json({ error: error.message });
    }
  }
}
