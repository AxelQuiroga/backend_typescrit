import type { Request, Response } from "express";
import { CreatePostUseCase } from "../../../application/use-cases/post/CreatePostUseCase.js";
import { GetPostsUseCase } from "../../../application/use-cases/post/GetPostsUseCase.js";
import { GetMyPostsUseCase } from "../../../application/use-cases/post/GetMyPostsUseCase.js";
import { DeletePostUseCase } from "../../../application/use-cases/post/DeletePostUseCase.js";
import { UpdatePostUseCase } from "../../../application/use-cases/post/UpdatePostUseCase.js";
import { GetPostsByUserUseCase } from "../../../application/use-cases/post/GetPostsByUserUseCase.js";
import { GetUserPublicProfileUseCase } from "../../../application/use-cases/user/GetUserPublicProfileUseCase.js";
import type { PostWithAuthorPublicOutput } from "../../../application/contracts/post/PostWithAuthorPublicOutput.js";
import type { CreatePostRequest } from "../dtos/post/CreatePostRequest.js";
import type { UpdatePostRequest } from "../dtos/post/UpdatePostRequest.js";
import type { GetPostsResponse } from "../dtos/post/GetPostsResponse.js";
import {
  toCreatePostInput,
  toPostResponse,
  toPostWithAuthorResponse,
  toPostWithAuthorPublicResponse,
  toUpdatePostInput
} from "../mappers/post.mapper.js";

export class PostController {
  constructor(
    private createPostUseCase: CreatePostUseCase,
    private getPostsUseCase: GetPostsUseCase,
    private getMyPostsUseCase: GetMyPostsUseCase,
    private deletePostUseCase: DeletePostUseCase,
    private updatePostUseCase: UpdatePostUseCase,
    private getPostsByUserUseCase: GetPostsByUserUseCase,
    private getUserPublicProfileUseCase: GetUserPublicProfileUseCase
  ) { }

  async handle(req: Request, res: Response)  {
    try {
      const userId = req.user?.userId; //  viene del middleware

      if (!userId) {
        return res.status(401).json({ error: "No autorizado" });
      }

      const input = toCreatePostInput(res.locals.validated.body as CreatePostRequest);

      const post = await this.createPostUseCase.execute(userId, input);

      return res.status(201).json(toPostResponse(post));
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || "Error creando post"
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      // Extraer y validar query params
      const { page, limit } = res.locals.validated.query as { page: number; limit: number };

      // Extraer userId del JWT (puede ser undefined si no está autenticado)
      const userId = req.user?.userId;

      const { posts, total } = await this.getPostsUseCase.execute(page, limit, userId);
      const response: GetPostsResponse = {
        data: posts.map(toPostWithAuthorResponse),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };

      return res.json(response);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || "Error obteniendo posts"
      });
    }
  }

  async getMyPosts(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "No autorizado" });
      }

      const posts = await this.getMyPostsUseCase.execute(userId);

      return res.json(posts.map(toPostWithAuthorResponse));
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || "Error obteniendo posts"
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id: postId } = res.locals.validated.params as { id: string };


      if (!userId) {
        return res.status(401).json({ error: "No autorizado" });
      }

      await this.deletePostUseCase.execute(postId, userId);

      return res.status(204).send(); // 204 = No Content (éxito sin body)
    } catch (error: any) {
      const status = error.message === "Post no encontrado" ? 404 :
        error.message === "No autorizado" ? 403 : 500;
      return res.status(status).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      const { id: postId } = res.locals.validated.params as { id: string };
      const data = toUpdatePostInput(
        res.locals.validated.body as UpdatePostRequest
      );


      if (!userId) {
        return res.status(401).json({ error: "No autorizado" });
      }

      const post = await this.updatePostUseCase.execute(postId, userId, data);

      return res.json(toPostResponse(post));
    } catch (error: any) {
      const status = error.message === "Post no encontrado" ? 404 :
        error.message === "No autorizado" ? 403 : 500;
      return res.status(status).json({ error: error.message });
    }
  }

  async getPostsByUser(req: Request, res: Response) {
    try {
      const { username } = res.locals.validated.params as { username: string };
      const { page, limit } = res.locals.validated.query as { page: number; limit: number };
      
      // Usuario logueado (opcional)
      const currentUserId = req.user?.userId;

      // Obtener el usuario para validar que existe
      const user = await this.getUserPublicProfileUseCase.execute(username);

      // Obtener posts paginados del usuario (con auth opcional)
      const { data: posts, total } = await this.getPostsByUserUseCase.execute(
        user.id,
        currentUserId,
        page,
        limit
      );

      return res.json({
        data: posts.map(toPostWithAuthorResponse),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error: any) {
      const status = error.message === "Usuario no encontrado" ? 404 : 500;
      return res.status(status).json({
        error: error.message || "Error obteniendo posts del usuario"
      });
    }
  }
}
