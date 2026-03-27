import { Router } from "express";
import { UserController } from "../controllers/user.controllers.js";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
const router = Router();
const controller = new UserController();

router.post("/register", (req, res) => controller.register(req, res));
router.post("/login", (req, res) => controller.login(req, res));
router.get("/me", authMiddleware, (req, res) => controller.me(req, res));
router.put("/me", authMiddleware, (req, res) =>
  controller.update(req, res)
);
export default router;