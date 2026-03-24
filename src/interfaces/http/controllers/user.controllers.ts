import type { Request, Response } from "express";
import { RegisterUserUseCase } from "../../../application/use-cases/user/RegisterUserUseCase.js";
import { LoginUserUseCase } from "../../../application/use-cases/user/LoginUserUseCase.js";
import { PrismaUserRepository } from "../../../infrastructure/repositories/PrismaUserRepository.js";
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
}
