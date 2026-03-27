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

export default router;