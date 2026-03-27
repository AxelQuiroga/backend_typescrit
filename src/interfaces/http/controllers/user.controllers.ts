import type { Request, Response } from "express";
import { RegisterUserUseCase } from "../../../application/use-cases/user/RegisterUserUseCase.js";
import { LoginUserUseCase } from "../../../application/use-cases/user/LoginUserUseCase.js";
import { PrismaUserRepository } from "../../../infrastructure/repositories/PrismaUserRepository.js";
import { GetMyProfileUseCase } from "../../../application/use-cases/user/GetMyProfileUseCase.js";
import { UpdateUserProfileUseCase } from "../../../application/use-cases/user/UpdateUserProfileUseCase.js";
export class UserController {
  async register(req: Request, res: Response) {
    try {
      const userRepo = new PrismaUserRepository();
      const useCase = new RegisterUserUseCase(userRepo);
      const user = await useCase.execute(req.body);

      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

   async login(req: Request, res: Response) {
    try {
      const userRepo = new PrismaUserRepository();
      const useCase = new LoginUserUseCase(userRepo);

      const result = await useCase.execute(req.body);

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async me(req: Request, res: Response) {
  try {
    const userRepo = new PrismaUserRepository();
    const useCase = new GetMyProfileUseCase(userRepo);

    const userId = (req as any).user.userId;

    const user = await useCase.execute(userId);

    res.json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}




async update(req: Request, res: Response) {
  try {
    const userRepo = new PrismaUserRepository();
    const useCase = new UpdateUserProfileUseCase(userRepo);

    const userId = (req as any).user.userId;

    const updatedUser = await useCase.execute(userId, req.body);

    res.json(updatedUser);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}
}
