import { Router } from "express";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { NotificationController } from "../controllers/notification.controller.js";
import { GetNotificationsUseCase } from "../../../application/use-cases/notification/GetNotificationsUseCase.js";
import { GetUnreadCountUseCase } from "../../../application/use-cases/notification/GetUnreadCountUseCase.js";
import { MarkAsReadUseCase } from "../../../application/use-cases/notification/MarkAsReadUseCase.js";
import { MarkAllAsReadUseCase } from "../../../application/use-cases/notification/MarkAllAsReadUseCase.js";
import { PrismaNotificationRepository } from "../../../infrastructure/repositories/PrismaNotificationRepository.js";
import {
  getNotificationsSchema,
  notificationIdSchema
} from "../validators/notification.schema.js";

const router = Router();

const notificationRepository = new PrismaNotificationRepository();

const getNotificationsUseCase = new GetNotificationsUseCase(notificationRepository);
const getUnreadCountUseCase = new GetUnreadCountUseCase(notificationRepository);
const markAsReadUseCase = new MarkAsReadUseCase(notificationRepository);
const markAllAsReadUseCase = new MarkAllAsReadUseCase(notificationRepository);

const notificationController = new NotificationController(
  getNotificationsUseCase,
  getUnreadCountUseCase,
  markAsReadUseCase,
  markAllAsReadUseCase
);

/**
 * GET /notifications
 * Lista notificaciones del usuario autenticado (paginado).
 */
router.get(
  "/",
  authMiddleware,
  validate(getNotificationsSchema),
  (req, res) => notificationController.getNotifications(req, res)
);

/**
 * GET /notifications/unread-count
 * Cuenta notificaciones no leídas del usuario.
 */
router.get(
  "/unread-count",
  authMiddleware,
  (req, res) => notificationController.getUnreadCount(req, res)
);

/**
 * PUT /notifications/:id/read
 * Marca una notificación específica como leída.
 */
router.put(
  "/:id/read",
  authMiddleware,
  validate(notificationIdSchema),
  (req, res) => notificationController.markAsRead(req, res)
);

/**
 * PUT /notifications/read-all
 * Marca todas las notificaciones no leídas como leídas.
 */
router.put(
  "/read-all",
  authMiddleware,
  (req, res) => notificationController.markAllAsRead(req, res)
);

export default router;
