import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { commentCreateRateLimit } from "../../../middlewares/rate-limit.middleware.js";
import { CommentController } from "../controllers/comment.controller.js";
import { CreateCommentUseCase } from "../../../application/use-cases/comment/CreateCommentUseCase.js";
import { GetPostCommentsUseCase } from "../../../application/use-cases/comment/GetPostCommentsUseCase.js";
import { PrismaCommentRepository } from "../../../infrastructure/repositories/PrismaCommentRepository.js";
import { PrismaPostRepository } from "../../../infrastructure/repositories/PrismaPostRepository.js";
import { prisma } from "../../../infrastructure/database/prisma.js";
import { eventBus } from "../../../config/events.config.js";  // ← Importar de config
import {
  commentIdParamsSchema,
  createCommentSchema,
  paginationQuerySchema
} from "../validators/comment.schema.js";

const commentRepository = new PrismaCommentRepository(prisma);
const postRepository = new PrismaPostRepository(prisma);

// Use Cases
const createCommentUseCase = new CreateCommentUseCase(commentRepository, postRepository, eventBus);
const getPostCommentsUseCase = new GetPostCommentsUseCase(commentRepository);

const commentController = new CommentController(
  createCommentUseCase,
  {} as any,
  {} as any,
  getPostCommentsUseCase,
  {} as any
);

const router = Router();

router.post(
  "/:id/comments",
  authMiddleware,
  commentCreateRateLimit,
  validate({ params: commentIdParamsSchema, body: createCommentSchema }),
  (req, res) => commentController.create(req, res)
);

router.get(
  "/:id/comments",
  validate({ params: commentIdParamsSchema, query: paginationQuerySchema }),
  (req, res) => commentController.getByPost(req, res)
);

export default router;