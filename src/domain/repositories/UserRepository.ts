import type { User } from "../entities/user.js";

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
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    coverUrl?: string | null;
    location?: string | null;
    website?: string | null;
  }): Promise<User>;


  findByUsername(username: string): Promise<User | null>;

}