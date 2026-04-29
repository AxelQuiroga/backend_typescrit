import { PrismaClient } from "@prisma/client";

// Domain Types
import type { PostRepository } from "@domain/repositories/PostRepository.js";
import type { LikeRepository } from "@domain/repositories/LikeRepository.js";
import type { UserRepository } from "@domain/repositories/UserRepository.js";
import type { CommentRepository } from "@domain/repositories/CommentRepository.js";
import type { NotificationRepository } from "@domain/repositories/NotificationRepository.js";

// Infrastructure Implementations
import { PrismaPostRepository } from "@infrastructure/repositories/PrismaPostRepository.js";
import { PrismaLikeRepository } from "@infrastructure/repositories/PrismaLikeRepository.js";
import { PrismaUserRepository } from "@infrastructure/repositories/PrismaUserRepository.js";
import { PrismaCommentRepository } from "@infrastructure/repositories/PrismaCommentRepository.js";
import { PrismaNotificationRepository } from "@infrastructure/repositories/PrismaNotificationRepository.js";

// Application Use Cases
import { CreatePostUseCase } from "@application/use-cases/post/CreatePostUseCase.js";
import { GetPostsUseCase } from "@application/use-cases/post/GetPostsUseCase.js";
import { GetMyPostsUseCase } from "@application/use-cases/post/GetMyPostsUseCase.js";
import { DeletePostUseCase } from "@application/use-cases/post/DeletePostUseCase.js";
import { UpdatePostUseCase } from "@application/use-cases/post/UpdatePostUseCase.js";
import { GetPostsByUserUseCase } from "@application/use-cases/post/GetPostsByUserUseCase.js";
import { GetPostLikesCountUseCase } from "@application/use-cases/like/GetPostLikesCountUseCase.js";
import { GetUserPublicProfileUseCase } from "@application/use-cases/user/GetUserPublicProfileUseCase.js";

// Controllers
import { PostController } from "@interfaces/http/controllers/post.controller.js";

// Events
import { eventBus } from "@infrastructure/config/events.config.js";

// Prisma Client (singleton)
let prismaClient: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prismaClient) {
    prismaClient = new PrismaClient();
  }
  return prismaClient;
}

// Repositories Factory
export function createPostRepository(): PostRepository {
  return new PrismaPostRepository(getPrismaClient());
}

export function createLikeRepository(): LikeRepository {
  return new PrismaLikeRepository(getPrismaClient());
}

export function createUserRepository(): UserRepository {
  return new PrismaUserRepository(getPrismaClient());
}

export function createCommentRepository(): CommentRepository {
  return new PrismaCommentRepository(getPrismaClient());
}

export function createNotificationRepository(): NotificationRepository {
  return new PrismaNotificationRepository(getPrismaClient());
}

// Use Cases Factory
export function createCreatePostUseCase(): CreatePostUseCase {
  return new CreatePostUseCase(createPostRepository(), eventBus);
}

export function createGetPostsUseCase(): GetPostsUseCase {
  return new GetPostsUseCase(createPostRepository(), createGetPostLikesCountUseCase());
}

export function createGetMyPostsUseCase(): GetMyPostsUseCase {
  return new GetMyPostsUseCase(createPostRepository(), createLikeRepository());
}

export function createDeletePostUseCase(): DeletePostUseCase {
  return new DeletePostUseCase(createPostRepository(), eventBus);
}

export function createUpdatePostUseCase(): UpdatePostUseCase {
  return new UpdatePostUseCase(createPostRepository());
}

export function createGetPostsByUserUseCase(): GetPostsByUserUseCase {
  return new GetPostsByUserUseCase(createPostRepository(), createLikeRepository());
}

export function createGetPostLikesCountUseCase(): GetPostLikesCountUseCase {
  return new GetPostLikesCountUseCase(createLikeRepository());
}

export function createGetUserPublicProfileUseCase(): GetUserPublicProfileUseCase {
  return new GetUserPublicProfileUseCase(createUserRepository());
}

// Controllers Factory
export function createPostController(): PostController {
  return new PostController(
    createCreatePostUseCase(),
    createGetPostsUseCase(),
    createGetMyPostsUseCase(),
    createDeletePostUseCase(),
    createUpdatePostUseCase(),
    createGetPostsByUserUseCase(),
    createGetUserPublicProfileUseCase()
  );
}

// Clean shutdown
export async function shutdownContainer(): Promise<void> {
  if (prismaClient) {
    await prismaClient.$disconnect();
    prismaClient = null;
  }
}
