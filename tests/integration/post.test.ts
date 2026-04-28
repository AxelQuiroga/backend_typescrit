import { describe, it, expect, beforeEach } from 'vitest';
import { DeletePostUseCase } from '../../src/application/use-cases/post/DeletePostUseCase';
import { LikePostUseCase } from '../../src/application/use-cases/like/LikePostUseCase';
import { PrismaPostRepository } from '../../src/infrastructure/repositories/PrismaPostRepository';
import { PrismaLikeRepository } from '../../src/infrastructure/repositories/PrismaLikeRepository';
import { PrismaNotificationRepository } from '../../src/infrastructure/repositories/PrismaNotificationRepository';
import { PrismaCommentRepository } from '../../src/infrastructure/repositories/PrismaCommentRepository';
import { NotificationListeners } from '../../src/infrastructure/events/NotificationListeners';
import { InMemoryEventBus } from '../mocks/InMemoryEventBus';
import { cleanupDb, prisma } from '../setup';
import { createUser, createPost } from '../factories';

let eventBus: InMemoryEventBus;
let postRepo: PrismaPostRepository;
let likeRepo: PrismaLikeRepository;
let commentRepo: PrismaCommentRepository;
let notificationRepo: PrismaNotificationRepository;

beforeEach(async () => {
  await cleanupDb();
  eventBus = new InMemoryEventBus();
  postRepo = new PrismaPostRepository(prisma);
  likeRepo = new PrismaLikeRepository(prisma);
  commentRepo = new PrismaCommentRepository(prisma);
  notificationRepo = new PrismaNotificationRepository(prisma);
  new NotificationListeners(notificationRepo, commentRepo, eventBus);
});

describe('DeletePostUseCase Integration', () => {
  it('should delete post and cleanup notifications', async () => {
    const author = await createUser(prisma);
    const liker = await createUser(prisma);
    const postResult = await createPost(prisma, { authorId: author.id });
    const post = postResult.post;

    // Setup: dar like para generar notificación
    const likeUseCase = new LikePostUseCase(likeRepo, postRepo, eventBus);
    await likeUseCase.execute(liker.id, { postId: post.id });

    // Esperar a que el evento se procese
    await new Promise(resolve => setTimeout(resolve, 100));

    let notifications = await prisma.notification.findMany({
      where: { postId: post.id }
    });
    expect(notifications).toHaveLength(1);

    // Act: borrar likes primero (por foreign key RESTRICT)
    await prisma.like.deleteMany({ where: { postId: post.id } });
    
    // Act: borrar post
    const deleteUseCase = new DeletePostUseCase(postRepo, eventBus);
    await deleteUseCase.execute(post.id, author.id);

    // Assert: post eliminado
    const deletedPost = await prisma.post.findUnique({ where: { id: post.id } });
    expect(deletedPost).toBeNull();

    // Assert: notificaciones cleanup
    notifications = await prisma.notification.findMany({
      where: { postId: post.id }
    });
    expect(notifications).toHaveLength(0);
  });

  it('should throw when post not found', async () => {
    const author = await createUser(prisma);
    const deleteUseCase = new DeletePostUseCase(postRepo, eventBus);

    await expect(deleteUseCase.execute('non-existent-id', author.id)).rejects.toThrow('Post no encontrado');
  });

  it('should throw when user is not author', async () => {
    const author = await createUser(prisma);
    const otherUser = await createUser(prisma);
    const postResult = await createPost(prisma, { authorId: author.id });
    const post = postResult.post;

    const deleteUseCase = new DeletePostUseCase(postRepo, eventBus);

    await expect(deleteUseCase.execute(post.id, otherUser.id)).rejects.toThrow('No autorizado');
  });
});
