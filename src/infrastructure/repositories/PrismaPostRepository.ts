import { PrismaClient } from "@prisma/client";
import type { PostRepository } from "../../domain/repositories/PostRepository.js";

export class PrismaPostRepository implements PostRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: {
    title: string;
    content: string;
    authorId: string;
  }) {
    return await this.prisma.post.create({
      data
    });
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
  
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take: limit,
        include: { author: true }
      }),
      this.prisma.post.count()
    ]);
  
    return { posts, total };
  }

  async findByAuthorId(authorId: string) {
    return await this.prisma.post.findMany({
      where: {
        authorId: authorId
      },
      include: {
        author: true
      }
    });
  }

  async findById(id: string) {
    return await this.prisma.post.findUnique({
      where: {
        id: id
      },
      include: {
        author: true
      }
    });
  }

  async deleteById(id: string) {
    await this.prisma.post.delete({
      where: { id }
    });
  }

  async update(id: string, data: { title?: string; content?: string }) {
    return await this.prisma.post.update({
      where: { id },
      data
    });
  }
}