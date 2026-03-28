import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { PrismaPostRepository } from "../../../infrastructure/repositories/PrismaPostRepository.js";
import { CreatePostUseCase } from "../../../application/use-cases/post/CreatePostUseCase.js";
import { CreatePostController } from "../controllers/post.controller.js";

const router = Router();

// dependencias manuales (sin DI framework)
const postRepository = new PrismaPostRepository();
const createPostUseCase = new CreatePostUseCase(postRepository);
const createPostController = new CreatePostController(createPostUseCase);

router.post(
  "/new",
  authMiddleware, // PROTEGIDO
  (req, res) => createPostController.handle(req, res)
);
router.get(
  "/", // PROTEGIDO
  (req, res) => createPostController.getAll(req, res)
);
router.get("/posts/me", authMiddleware, (req, res) =>
  createPostController.getMyPosts(req, res)
);
router.delete("/posts/:id", authMiddleware, (req, res) =>
  createPostController.delete(req, res)
);

export default router;