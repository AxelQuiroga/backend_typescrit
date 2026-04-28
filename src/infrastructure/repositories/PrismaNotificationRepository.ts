import type { PrismaClient } from "@prisma/client";
import type { NotificationRepository } from '../../domain/repositories/NotificationRepository.js';
import type { Notification } from '../../domain/entities/Notification.js';

export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    return await this.prisma.notification.create({ data }) as Notification;
  }
  
  async findByUserId(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.notification.count({ where: { userId } })
    ]);
    return {  notifications: notifications as Notification[], 
  total };
  }
  
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const result = await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true }
    });
    return result.count > 0;
  }
  
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
    return result.count;
  }
  
  async countUnread(userId: string): Promise<number> {
    return await this.prisma.notification.count({
      where: { userId, read: false }
    });
  }

  async findByCriteria(criteria: {
    userId?: string;
    actorId?: string;
    postId?: string;
    type?: Notification['type'];
  }): Promise<Notification[]> {
    const results = await this.prisma.notification.findMany({
      where: criteria
    });
    return results as Notification[];
  }

  async deleteByCriteria(criteria: {
    userId?: string;
    actorId?: string;
    postId?: string;
    type?: Notification['type'];
  }): Promise<number> {
    const result = await this.prisma.notification.deleteMany({
      where: criteria
    });
    return result.count;
  }
}