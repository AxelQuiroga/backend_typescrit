import type{ User } from "../entities/user.js";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: {
    email: string;
    password: string;
    username: string;
    role: "USER" | "ADMIN";
  }): Promise<User>;

  findById(id: string): Promise<User | null>;

  update(id: string, data: {
  email?: string;
  username?: string;
}): Promise<User>;
}