import type { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

export async function createUser(prisma: PrismaClient, overrides: Partial<{ id: string; email: string; username: string; password: string }> = {}) {
  const id = overrides.id || crypto.randomUUID();
  const email = overrides.email || `user-${id}@test.com`;
  const username = overrides.username || `user-${id}`;
  const password = overrides.password ? await bcrypt.hash(overrides.password, 10) : await bcrypt.hash('password123', 10);

  const user = await prisma.user.create({
    data: { id, email, username, password },
  });
  return user;
}

export async function createPost(prisma: PrismaClient, overrides: Partial<{ id: string; title: string; content: string; authorId: string }> = {}) {
  const id = overrides.id || crypto.randomUUID();
  let authorId = overrides.authorId;
  let user = null;
  
  // Siempre crear usuario+post juntos para evitar race conditions
  if (!authorId) {
    // Crear usuario automático
    user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email: `user-${crypto.randomUUID()}@test.com`,
        username: `user-${crypto.randomUUID()}`,
        password: await bcrypt.hash('password123', 10),
      },
    });
    authorId = user.id;
  } else {
    // Si se proporciona authorId, verificar si el usuario existe o crearlo
    user = await prisma.user.findUnique({ where: { id: authorId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: authorId,
          email: `user-${authorId}@test.com`,
          username: `user-${authorId}`,
          password: await bcrypt.hash('password123', 10),
        },
      });
    }
  }
  
  const post = await prisma.post.create({
    data: {
      id,
      title: overrides.title || 'Test Post',
      content: overrides.content || 'Test content for the post',
      authorId,
    },
  });
  
  return { post, user };
}

export async function createLike(prisma: PrismaClient, overrides: Partial<{ userId: string; postId: string }> = {}) {
  let userId = overrides.userId;
  let postId = overrides.postId;
  
  // Si no se proporciona userId, crear usuario
  if (!userId) {
    const user = await createUser(prisma);
    userId = user.id;
  } else {
    // Si se proporciona userId, verificar si existe
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error(`User ${userId} not found for createLike`);
    }
  }
  
  // Si no se proporciona postId, crear post
  if (!postId) {
    const postResult = await createPost(prisma, { authorId: userId });
    postId = postResult.post.id;
  } else {
    // Si se proporciona postId, verificar que existe
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new Error(`Post ${postId} not found for createLike`);
    }
  }

  return prisma.like.create({
    data: { userId, postId },
  });
}
