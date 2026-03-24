import type { Request, Response } from "express";
import { RegisterUserUseCase } from "../../../application/use-cases/user/RegisterUserUseCase.js";

export class UserController {
  async register(req: Request, res: Response) {
    try {
      const useCase = new RegisterUserUseCase();
      const user = await useCase.execute(req.body);

      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}