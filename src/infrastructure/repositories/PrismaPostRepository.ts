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
 async findAll(page: number, limit: number) {
  const skip = (page - 1) * limit;
  
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: limit,
      include: { author: true }
    }),
    prisma.post.count()
  ]);
  
  return { posts, total };
}

  async findByAuthorId(authorId: string) {
    return prisma.post.findMany({
      where: {
        authorId: authorId
      },
      include: {
        author: true
      }
    });
  }

  async findById(id: string) {
    return prisma.post.findUnique({
      where: {
        id: id
      },
      include: {
        author: true
      }
    });
  }

  async deleteById(id: string) {
    await prisma.post.delete({
    where: { id }
  });
  }

}