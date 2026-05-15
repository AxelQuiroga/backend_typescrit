import { describe, it, expect, beforeEach } from 'vitest';
import { LikePostUseCase } from '../../src/application/use-cases/like/LikePostUseCase.js';
import { UnlikePostUseCase } from '../../src/application/use-cases/like/UnlikePostUseCase.js';
import { LikeRepository } from '../../src/domain/repositories/LikeRepository.js';
import { PostRepository } from '../../src/domain/repositories/PostRepository.js';
import { PrismaLikeRepository } from '../../src/infrastructure/repositories/PrismaLikeRepository.js';
import { PrismaPostRepository } from '../../src/infrastructure/repositories/PrismaPostRepository.js';
import { PrismaNotificationRepository } from '../../src/infrastructure/repositories/PrismaNotificationRepository';
import { PrismaCommentRepository } from '../../src/infrastructure/repositories/PrismaCommentRepository';
import { NotificationListeners } from '../../src/infrastructure/events/NotificationListeners';
import { NotificationService } from '../../src/application/services/NotificationService';
import { InMemoryEventBus } from '../mocks/InMemoryEventBus';
import { RetryableLikeRepository } from '../../src/infrastructure/repositories/RetryableLikeRepository.js';
import { RetryablePostRepository } from '../../src/infrastructure/repositories/RetryablePostRepository.js';
import { cleanupDb, prisma } from '../setup.js';
import { createUser, createPost, createLike } from '../factories.js';

let eventBus: InMemoryEventBus;
let likeRepo: LikeRepository;
let postRepo: PostRepository;
let commentRepo: PrismaCommentRepository;
let notificationRepo: PrismaNotificationRepository;

beforeEach(async () => {
  await cleanupDb();
  eventBus = new InMemoryEventBus();
  
  // Repositorios base
  const prismaLikeRepo = new PrismaLikeRepository(prisma);
  const prismaPostRepo = new PrismaPostRepository(prisma);
  
  // Envolvemos con decoradores de reintentos
  likeRepo = new RetryableLikeRepository(prismaLikeRepo, prismaPostRepo);
  postRepo = new RetryablePostRepository(prismaPostRepo);
  
  commentRepo = new PrismaCommentRepository(prisma);
  notificationRepo = new PrismaNotificationRepository(prisma);
  
  const notificationService = new NotificationService(notificationRepo, commentRepo);
  new NotificationListeners(notificationService, eventBus);
});

describe('LikePostUseCase Integration', () => {
  it('should create like and emit event', async () => {
    const author = await createUser(prisma);
    const liker = await createUser(prisma);
    const postResult = await createPost(prisma, { authorId: author.id });
    const post = postResult.post;

    const useCase = new LikePostUseCase(likeRepo, postRepo, eventBus);
    const result = await useCase.execute(liker.id, { postId: post.id });

    expect(result.postId).toBe(post.id);
    expect(result.userId).toBe(liker.id);
    expect(eventBus.emittedEvents).toHaveLength(1);
    expect(eventBus.emittedEvents[0].event).toBe('like.created');
  });

  it('should create notification on like', async () => {
    const author = await createUser(prisma);
    const liker = await createUser(prisma);
    const postResult = await createPost(prisma, { authorId: author.id });
    const post = postResult.post;

    const useCase = new LikePostUseCase(likeRepo, postRepo, eventBus);
    await useCase.execute(liker.id, { postId: post.id });

    // Esperar a que el evento se procese
    await new Promise(resolve => setTimeout(resolve, 100));

    const notifications = await prisma.notification.findMany({
      where: { userId: author.id, type: 'LIKE_ON_POST' }
    });

    expect(notifications).toHaveLength(1);
    expect(notifications[0].actorId).toBe(liker.id);
    expect(notifications[0].postId).toBe(post.id);
  });

  it('should not create notification on self-like', async () => {
    const author = await createUser(prisma);
    const postResult = await createPost(prisma, { authorId: author.id });
    const post = postResult.post;

    const useCase = new LikePostUseCase(likeRepo, postRepo, eventBus);
    await useCase.execute(author.id, { postId: post.id });

    const notifications = await prisma.notification.findMany({
      where: { userId: author.id }
    });

    expect(notifications).toHaveLength(0);
  });

  it('should throw on duplicate like', async () => {
    const author = await createUser(prisma);
    const liker = await createUser(prisma);
    const postResult = await createPost(prisma, { authorId: author.id });
    const post = postResult.post;

    const useCase = new LikePostUseCase(likeRepo, postRepo, eventBus);
    await useCase.execute(liker.id, { postId: post.id });

    await expect(useCase.execute(liker.id, { postId: post.id })).rejects.toThrow('Ya has dado like');
  });
});

describe('UnlikePostUseCase Integration', () => {
  it('should remove like and delete notification', async () => {
    const author = await createUser(prisma);
    const liker = await createUser(prisma);
    const postResult = await createPost(prisma, { authorId: author.id });
    const post = postResult.post;

    // Setup: dar like primero
    const likeUseCase = new LikePostUseCase(likeRepo, postRepo, eventBus);
    await likeUseCase.execute(liker.id, { postId: post.id });

    // Esperar a que el evento se procese
    await new Promise(resolve => setTimeout(resolve, 100));

    let notifications = await prisma.notification.findMany({
      where: { userId: author.id, type: 'LIKE_ON_POST' }
    });
    expect(notifications).toHaveLength(1);

    // Act: quitar like
    const unlikeUseCase = new UnlikePostUseCase(likeRepo, postRepo, eventBus);
    const result = await unlikeUseCase.execute(liker.id, { postId: post.id });

    // Esperar a que el evento se procese
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result).toBe(true);
    expect(eventBus.emittedEvents).toHaveLength(2);
    expect(eventBus.emittedEvents[1].event).toBe('like.removed');

    // Assert: notificación eliminada
    notifications = await prisma.notification.findMany({
      where: { userId: author.id, type: 'LIKE_ON_POST' }
    });
    expect(notifications).toHaveLength(0);
  });

  it('should return false when like does not exist', async () => {
    const author = await createUser(prisma);
    const liker = await createUser(prisma);
    const postResult = await createPost(prisma, { authorId: author.id });
    const post = postResult.post;

    const unlikeUseCase = new UnlikePostUseCase(likeRepo, postRepo, eventBus);
    const result = await unlikeUseCase.execute(liker.id, { postId: post.id });

    expect(result).toBe(false);
  });
});
