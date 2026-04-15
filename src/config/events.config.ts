import { NodeEventBus } from "../infrastructure/events/NodeEventBus.js";
import { NotificationListeners } from "../infrastructure/events/NotificationListeners.js";
import { PrismaNotificationRepository } from "../infrastructure/repositories/PrismaNotificationRepository.js";
import { PrismaUserRepository } from "../infrastructure/repositories/PrismaUserRepository.js";
import { PrismaCommentRepository } from "../infrastructure/repositories/PrismaCommentRepository.js";

// 1. Crear EventBus (singleton)
export const eventBus = new NodeEventBus();

// 2. Crear repositorios
const notificationRepo = new PrismaNotificationRepository();
const userRepo = new PrismaUserRepository();
const commentRepo = new PrismaCommentRepository();

// 3. Registrar listeners (una sola vez al iniciar)
new NotificationListeners(notificationRepo, userRepo, commentRepo, eventBus);