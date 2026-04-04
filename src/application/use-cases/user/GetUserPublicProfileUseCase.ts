import type { UserRepository } from "../../../domain/repositories/UserRepository.js";
import type { UserPublicProfileOutput } from "../../contracts/user/UserPublicProfileOutput.js";

export class GetUserPublicProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(username: string): Promise<UserPublicProfileOutput> {
    if (!username) {
      throw new Error("Username requerido");
    }

    const user = await this.userRepository.findByUsername(username);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName ?? null,
      bio: user.bio ?? null,
      avatarUrl: user.avatarUrl ?? null,
      coverUrl: user.coverUrl ?? null,
      location: user.location ?? null,
      website: user.website ?? null,
      createdAt: user.createdAt
    };
  }
}
