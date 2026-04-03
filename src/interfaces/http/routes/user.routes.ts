import { Router } from "express";
import { UserController } from "../controllers/user.controllers.js";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  publicProfileSchema
} from "../validators/user.validator.js";
import { PrismaUserRepository } from "../../../infrastructure/repositories/PrismaUserRepository.js";
import { RegisterUserUseCase } from "../../../application/use-cases/user/RegisterUserUseCase.js";
import { LoginUserUseCase } from "../../../application/use-cases/user/LoginUserUseCase.js";
import { GetMyProfileUseCase } from "../../../application/use-cases/user/GetMyProfileUseCase.js";
import { UpdateUserProfileUseCase } from "../../../application/use-cases/user/UpdateUserProfileUseCase.js"; 


const router = Router();
const userRepo = new PrismaUserRepository();

const controller = new UserController(
  new RegisterUserUseCase(userRepo),
  new LoginUserUseCase(userRepo),
  new GetMyProfileUseCase(userRepo),
  new UpdateUserProfileUseCase(userRepo)
);


router.get("/me", authMiddleware, (req, res) => controller.me(req, res));
router.post("/register", validate(registerSchema), (req, res) =>
  controller.register(req, res)
);
router.post("/login", validate(loginSchema), (req, res) =>
  controller.login(req, res)
);
router.put("/me", authMiddleware, validate(updateProfileSchema), (req, res) =>
  controller.update(req, res)
);
router.get("/users/u/:username", validate(publicProfileSchema), (req, res) => controller.me(req, res));

export default router;