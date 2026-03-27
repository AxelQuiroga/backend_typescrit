import { prisma } from "../database/prisma.js";
import type { PostRepository } from "../../domain/repositories/PostRepository.js";

export class PrismaPostRepository implements PostRepository {
  
  async create(data: {
    title: string;
    content: string;
    authorId: string;
  }) {
    return prisma.post.create({
      data
    });
  }
}