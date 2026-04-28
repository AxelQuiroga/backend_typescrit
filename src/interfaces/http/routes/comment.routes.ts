import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { commentUpdateRateLimit } from "../../../middlewares/rate-limit.middleware.js";
import { CommentController } from "../controllers/comment.controller.js";
import { UpdateCommentUseCase } from "../../../application/use-cases/comment/UpdateCommentUseCase.js";
import { DeleteCommentUseCase } from "../../../application/use-cases/comment/DeleteCommentUseCase.js";
import { GetCommentRepliesUseCase } from "../../../application/use-cases/comment/GetCommentRepliesUseCase.js";
import { PrismaCommentRepository } from "../../../infrastructure/repositories/PrismaCommentRepository.js";
import { PrismaPostRepository } from "../../../infrastructure/repositories/PrismaPostRepository.js";
import { prisma } from "../../../infrastructure/database/prisma.js";
import {
  commentIdParamsSchema,
  updateCommentSchema,
  paginationQuerySchema
} from "../validators/comment.schema.js";

// Repositorios
const commentRepository = new PrismaCommentRepository(prisma);
const postRepository = new PrismaPostRepository(prisma);

// Use Cases (solo para rutas de comentarios individuales)
const updateCommentUseCase = new UpdateCommentUseCase(commentRepository);
const deleteCommentUseCase = new DeleteCommentUseCase(commentRepository, postRepository);
const getCommentRepliesUseCase = new GetCommentRepliesUseCase(commentRepository);

// Controller
const commentController = new CommentController(
  {} as any, // create - no usado aquí
  updateCommentUseCase,
  deleteCommentUseCase,
  {} as any, // getByPost - no usado aquí
  getCommentRepliesUseCase
);

const router = Router();

/**
 * PUT /comments/:id
 * Actualiza un comentario (solo el autor).
 * Rate limit: 20 ediciones por minuto por IP.
 */
router.put(
  "/:id",
  authMiddleware,
  commentUpdateRateLimit,
  validate({ params: commentIdParamsSchema, body: updateCommentSchema }),
  (req, res) => commentController.update(req, res)
);

/**
 * DELETE /comments/:id
 * Elimina un comentario (solo el autor, con cascada).
 */
router.delete(
  "/:id",
  authMiddleware,
  validate({ params: commentIdParamsSchema }),
  (req, res) => commentController.delete(req, res)
);

/**
 * GET /comments/:id/replies
 * Lista respuestas de un comentario (paginado).
 */
router.get(
  "/:id/replies",
  validate({ params: commentIdParamsSchema, query: paginationQuerySchema }),
  (req, res) => commentController.getReplies(req, res)
);

export default router;
