import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { createPostController } from "@infrastructure/di/factory.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import {
  createPostSchema,
  getPostsSchema,
  updatePostSchema,
  deletePostSchema,
  getPostsByUserSchema
} from "../validators/post.validator.js";

const router = Router();

// Factory pattern - inyección de dependencias centralizada (¡AHORA FUNCIONA!)
const postController = createPostController();

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

router.get("/user/:username", validate(getPostsByUserSchema), (req, res) =>
  postController.getPostsByUser(req, res)
);

export default router;