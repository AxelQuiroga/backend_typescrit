import { Router } from "express";
import { UserController } from "../controllers/user.controllers.js";

const router = Router();
const controller = new UserController();

router.post("/register", (req, res) => controller.register(req, res));

export default router;