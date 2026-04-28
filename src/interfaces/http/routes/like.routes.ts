import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { LikeController } from "../controllers/like.controller.js";
import { LikePostUseCase } from "../../../application/use-cases/like/LikePostUseCase.js";
import { UnlikePostUseCase } from "../../../application/use-cases/like/UnlikePostUseCase.js";
import { GetPostLikesCountUseCase } from "../../../application/use-cases/like/GetPostLikesCountUseCase.js";
import { PrismaLikeRepository } from "../../../infrastructure/repositories/PrismaLikeRepository.js";
import { PrismaPostRepository } from "../../../infrastructure/repositories/PrismaPostRepository.js";
import { eventBus } from "../../../config/events.config.js";
import { likePostParamsSchema } from "../validators/like.schema.js";

// Repositorios
const likeRepository = new PrismaLikeRepository();
const postRepository = new PrismaPostRepository();

// Use Cases
const likePostUseCase = new LikePostUseCase(likeRepository, postRepository, eventBus);
const unlikePostUseCase = new UnlikePostUseCase(likeRepository, postRepository, eventBus);
const getPostLikesCountUseCase = new GetPostLikesCountUseCase(likeRepository);

// Controller
const likeController = new LikeController(
  likePostUseCase,
  unlikePostUseCase,
  getPostLikesCountUseCase
);

const router = Router();

/**
 * POST /posts/:id/like
 * Da like a un post (requiere autenticación)
 */
router.post(
  "/:id/like",
  authMiddleware,
  validate({ params: likePostParamsSchema }),
  (req, res) => likeController.like(req, res)
);

/**
 * DELETE /posts/:id/like
 * Quita like a un post (requiere autenticación)
 */
router.delete(
  "/:id/like",
  authMiddleware,
  validate({ params: likePostParamsSchema }),
  (req, res) => likeController.unlike(req, res)
);

/**
 * GET /posts/:id/likes
 * Obtiene conteo de likes (opcional: autenticación para saber si el usuario dio like)
 */
router.get(
  "/:id/likes",
  authMiddleware, // Opcional: si no hay auth, userHasLiked será false
  validate({ params: likePostParamsSchema }),
  (req, res) => likeController.getLikes(req, res)
);

export default router;
