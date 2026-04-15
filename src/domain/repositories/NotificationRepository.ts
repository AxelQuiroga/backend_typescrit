import type { Notification } from '../entities/Notification.js';

export interface NotificationRepository {
  create(data: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>;
  findByUserId(userId: string, page: number, limit: number): Promise<{ notifications: Notification[]; total: number }>;
  markAsRead(notificationId: string, userId: string): Promise<boolean>;
  markAllAsRead(userId: string): Promise<number>;
  countUnread(userId: string): Promise<number>;
}