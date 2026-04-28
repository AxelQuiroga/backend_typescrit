import type { PrismaClient } from "@prisma/client";
import type { Like } from "../../domain/entities/Like.js";
import type { LikeRepository } from "../../domain/repositories/LikeRepository.js";

export class PrismaLikeRepository implements LikeRepository {
  constructor(private prisma: PrismaClient) {}

  async create(userId: string, postId: string): Promise<Like | null> {
    try {
      const like = await this.prisma.like.create({
        data: { userId, postId }
      });
      return {
        id: like.id,
        userId: like.userId,
        postId: like.postId,
        createdAt: like.createdAt
      };
    } catch (error: any) {
      // P2002 = unique constraint violation (ya existe el like)
      if (error.code === "P2002") {
        return null;
      }
      throw error;
    }
  }

  async delete(userId: string, postId: string): Promise<boolean> {
    try {
      await this.prisma.like.delete({
        where: {
          userId_postId: { userId, postId }
        }
      });
      return true;
    } catch (error: any) {
      // P2025 = record not found (no existía el like)
      if (error.code === "P2025") {
        return false;
      }
      throw error;
    }
  }

  async countByPostId(postId: string): Promise<number> {
    return this.prisma.like.count({
      where: { postId }
    });
  }

  async exists(userId: string, postId: string): Promise<boolean> {
    const like = await this.prisma.like.count({
      where: { userId, postId }
    });
    return like > 0;
  }

  async findByPostId(postId: string): Promise<Like[]> {
    const likes = await this.prisma.like.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, username: true }
        }
      }
    });

    return likes.map((like) => ({
      id: like.id,
      userId: like.userId,
      postId: like.postId,
      createdAt: like.createdAt
    }));
  }
}
