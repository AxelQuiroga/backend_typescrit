import { prisma } from "../database/prisma.js";
import type { NotificationRepository } from '../../domain/repositories/NotificationRepository.js';
import type { Notification } from '../../domain/entities/Notification.js';

export class PrismaNotificationRepository implements NotificationRepository {
  async create(data: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    return await prisma.notification.create({ data }) as Notification;
  }
  
  async findByUserId(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where: { userId } })
    ]);
    return {  notifications: notifications as Notification[], 
  total };
  }
  
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const result = await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true }
    });
    return result.count > 0;
  }
  
  async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
    return result.count;
  }
  
  async countUnread(userId: string): Promise<number> {
    return await prisma.notification.count({
      where: { userId, read: false }
    });
  }
}