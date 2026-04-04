import type { UserRepository } from "../../../domain/repositories/UserRepository.js";
import type { UserPrivateProfileOutput } from "../../contracts/user/UserPrivateProfileOutput.js";

export class GetMyProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string): Promise<UserPrivateProfileOutput> {
    
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName ?? null,
      bio: user.bio ?? null,
      avatarUrl: user.avatarUrl ?? null,    
      coverUrl: user.coverUrl ?? null,
      location: user.location ?? null,
      website: user.website ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
