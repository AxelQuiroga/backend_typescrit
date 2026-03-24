import { Router } from "express";
import { UserController } from "../controllers/user.controllers.js";

const router = Router();
const controller = new UserController();

router.post("/register", (req, res) => controller.register(req, res));
router.post("/login", (req, res) => controller.login(req, res));

export default router;