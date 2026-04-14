import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { commentCreateRateLimit } from "../../../middlewares/rate-limit.middleware.js";
import { CommentController } from "../controllers/comment.controller.js";
import { CreateCommentUseCase } from "../../../application/use-cases/comment/CreateCommentUseCase.js";
import { GetPostCommentsUseCase } from "../../../application/use-cases/comment/GetPostCommentsUseCase.js";
import { PrismaCommentRepository } from "../../../infrastructure/repositories/PrismaCommentRepository.js";
import { PrismaPostRepository } from "../../../infrastructure/repositories/PrismaPostRepository.js";
import {
  commentIdParamsSchema,
  createCommentSchema,
  paginationQuerySchema
} from "../validators/comment.schema.js";

// Repositorios
const commentRepository = new PrismaCommentRepository();
const postRepository = new PrismaPostRepository();

// Use Cases (solo los necesarios para rutas de posts)
const createCommentUseCase = new CreateCommentUseCase(commentRepository, postRepository);
const getPostCommentsUseCase = new GetPostCommentsUseCase(commentRepository);

// Controller (con subset de use cases)
const commentController = new CommentController(
  createCommentUseCase,
  {} as any, // update - no usado aquí
  {} as any, // delete - no usado aquí
  getPostCommentsUseCase,
  {} as any  // getReplies - no usado aquí
);

const router = Router();

/**
 * POST /posts/:id/comments
 * Crea un comentario o respuesta en un post.
 * Rate limit: 10 comentarios por minuto por IP.
 */
router.post(
  "/:id/comments",
  authMiddleware,
  commentCreateRateLimit,
  validate({ params: commentIdParamsSchema, body: createCommentSchema }),
  (req, res) => commentController.create(req, res)
);

/**
 * GET /posts/:id/comments
 * Lista comentarios raíz de un post (paginado).
 */
router.get(
  "/:id/comments",
  validate({ params: commentIdParamsSchema, query: paginationQuerySchema }),
  (req, res) => commentController.getByPost(req, res)
);

export default router;
