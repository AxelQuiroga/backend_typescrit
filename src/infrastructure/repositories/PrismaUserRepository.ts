import { PrismaClient } from "@prisma/client";
import type { User } from "../../domain/entities/user.js";
import type { UserRepository } from "../../domain/repositories/UserRepository.js";

export class PrismaUserRepository implements UserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  async create(data: {
    email: string;
    password: string;
    username: string;
    role: "USER" | "ADMIN";
  }): Promise<User> {
    return this.prisma.user.create({
      data
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }

  async update(id: string, data: { 
    email?: string; 
    username?: string 
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    coverUrl?: string | null;
    location?: string | null;
    website?: string | null;
  }) {
    return this.prisma.user.update({
      where: { id },
      data
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username }
    });
  }
}