import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { PrismaPostRepository } from "../../../infrastructure/repositories/PrismaPostRepository.js";
import { PrismaLikeRepository } from "../../../infrastructure/repositories/PrismaLikeRepository.js";
import { CreatePostUseCase } from "../../../application/use-cases/post/CreatePostUseCase.js";
import { GetPostsUseCase } from "../../../application/use-cases/post/GetPostsUseCase.js";
import { GetMyPostsUseCase } from "../../../application/use-cases/post/GetMyPostsUseCase.js";
import { DeletePostUseCase } from "../../../application/use-cases/post/DeletePostUseCase.js";
import { UpdatePostUseCase } from "../../../application/use-cases/post/UpdatePostUseCase.js";
import { GetPostLikesCountUseCase } from "../../../application/use-cases/like/GetPostLikesCountUseCase.js";
import { PostController } from "../controllers/post.controller.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { eventBus } from "../../../config/events.config.js";
import {
  createPostSchema,
  getPostsSchema,
  updatePostSchema,
  deletePostSchema
} from "../validators/post.validator.js";

const router = Router();

// dependencias manuales (sin DI framework)
const postRepository = new PrismaPostRepository();
const likeRepository = new PrismaLikeRepository();

const createPostUseCase = new CreatePostUseCase(postRepository, eventBus);
const getPostLikesCountUseCase = new GetPostLikesCountUseCase(likeRepository);
const getPostsUseCase = new GetPostsUseCase(postRepository, getPostLikesCountUseCase);
const getMyPostsUseCase = new GetMyPostsUseCase(postRepository, likeRepository);
const deletePostUseCase = new DeletePostUseCase(postRepository, eventBus);
const updatePostUseCase = new UpdatePostUseCase(postRepository);

const postController = new PostController(
  createPostUseCase,
  getPostsUseCase,
  getMyPostsUseCase,
  deletePostUseCase,
  updatePostUseCase
);

router.post("/new", authMiddleware, validate(createPostSchema), (req, res) =>
  postController.handle(req, res)
);

router.get("/", validate(getPostsSchema), (req, res) =>
  postController.getAll(req, res)
);

router.get("/me", authMiddleware, (req, res) =>
  postController.getMyPosts(req, res)
);

router.put("/:id", authMiddleware, validate(updatePostSchema), (req, res) =>
  postController.update(req, res)
);

router.delete("/:id", authMiddleware, validate(deletePostSchema), (req, res) =>
  postController.delete(req, res)
);


export default router;