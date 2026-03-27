import type { Request, Response } from "express";
import { CreatePostUseCase } from "../../../application/use-cases/post/CreatePostUseCase.js";
export class CreatePostController {
  constructor(private createPostUseCase: CreatePostUseCase) {}

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId; //  viene del middleware

      if (!userId) {
        return res.status(401).json({ error: "No autorizado" });
      }

      const post = await this.createPostUseCase.execute(userId, req.body);

      return res.status(201).json(post);
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || "Error creando post"
      });
    }
  }
}