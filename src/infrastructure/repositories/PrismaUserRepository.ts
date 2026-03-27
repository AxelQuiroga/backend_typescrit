import { prisma } from "../database/prisma.js";
import type { User } from "../../domain/entities/user.js";
import type { UserRepository } from "../../domain/repositories/UserRepository.js";

export class PrismaUserRepository implements UserRepository {
  
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  async create(data: {
    email: string;
    password: string;
    username: string;
    role: "USER" | "ADMIN";
  }): Promise<User> {
    return prisma.user.create({
      data
    });
  }

  async findById(id: string) {
  return prisma.user.findUnique({
    where: { id }
  });
}

async update(id: string, data: { email?: string; username?: string }) {
  return prisma.user.update({
    where: { id },
    data
  });
}
}