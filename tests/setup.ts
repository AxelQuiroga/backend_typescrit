import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Usa la DATABASE_URL que global-setup.ts ya configuró
export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

// Cleanup después de cada test - borrar en orden correcto con espera explícita
export async function cleanupDb() {
  // Orden: hijos primero, luego padres
  await prisma.notification.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  
  // Esperar explícitamente a que todo se complete
  await prisma.$queryRaw`SELECT 1`;
}
