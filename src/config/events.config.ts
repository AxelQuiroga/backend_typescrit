import { RabbitMQEventBus } from "../infrastructure/events/RabbitMQEventBus.js";
import { NotificationListeners } from "../infrastructure/events/NotificationListeners.js";
import { PrismaNotificationRepository } from "../infrastructure/repositories/PrismaNotificationRepository.js";
import { PrismaCommentRepository } from "../infrastructure/repositories/PrismaCommentRepository.js";
import { prisma } from "../infrastructure/database/prisma.js";

// 1. Crear EventBus (singleton)
export const eventBus = new RabbitMQEventBus();

// 2. Crear repositorios
const notificationRepo = new PrismaNotificationRepository(prisma);
const commentRepo = new PrismaCommentRepository(prisma);

// 3. Registrar listeners (se ejecuta sync, pero consume empieza luego de connect)
const notificationListeners = new NotificationListeners(notificationRepo, commentRepo, eventBus);

// 4. Conectar a RabbitMQ (llamar antes de app.listen)
export async function connectEventBus(): Promise<void> {
  await eventBus.connect();
}