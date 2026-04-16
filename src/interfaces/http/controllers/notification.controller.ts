import type { Request, Response } from "express";
import { GetNotificationsUseCase } from "../../../application/use-cases/notification/GetNotificationsUseCase.js";
import { GetUnreadCountUseCase } from "../../../application/use-cases/notification/GetUnreadCountUseCase.js";
import { MarkAsReadUseCase } from "../../../application/use-cases/notification/MarkAsReadUseCase.js";
import { MarkAllAsReadUseCase } from "../../../application/use-cases/notification/MarkAllAsReadUseCase.js";
import type {
  NotificationResponse,
  NotificationsPaginatedResponse,
  UnreadCountResponse,
  MarkAsReadResponse,
  MarkAllAsReadResponse
} from "../dtos/notification/NotificationResponse.js";
import {
  toNotificationsPaginatedResponse
} from "../mappers/notification.mapper.js";

export class NotificationController {
  constructor(
    private getNotificationsUseCase: GetNotificationsUseCase,
    private getUnreadCountUseCase: GetUnreadCountUseCase,
    private markAsReadUseCase: MarkAsReadUseCase,
    private markAllAsReadUseCase: MarkAllAsReadUseCase
  ) {}

  async getNotifications(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "No autorizado" });
      }

      const userId = req.user.userId;
      const { page, limit } = res.locals.validated.query as { page: number; limit: number };

      const result = await this.getNotificationsUseCase.execute(userId, page, limit);
      const response = toNotificationsPaginatedResponse(result, page, limit);

      res.json(response);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUnreadCount(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "No autorizado" });
      }

      const userId = req.user.userId;
      const count = await this.getUnreadCountUseCase.execute(userId);

      const response: UnreadCountResponse = { count };
      res.json(response);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "No autorizado" });
      }

      const userId = req.user.userId;
      const { id } = res.locals.validated.params as { id: string };

      const success = await this.markAsReadUseCase.execute(userId, id);

      const response: MarkAsReadResponse = { success };
      res.json(response);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "No autorizado" });
      }

      const userId = req.user.userId;
      const count = await this.markAllAsReadUseCase.execute(userId);

      const response: MarkAllAsReadResponse = { count };
      res.json(response);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
