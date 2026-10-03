import { NotificationItem } from '../entities/Notification';
import { Result } from '../../core/result/Result';

export interface NotificationRepository {
  getNotifications(): Promise<Result<NotificationItem[]>>;
  markRead(id: string): Promise<Result<boolean>>;
  markAllRead(): Promise<Result<boolean>>;
  deleteNotification(id: string): Promise<Result<boolean>>;
  toggleRead(id: string): Promise<Result<NotificationItem | boolean>>;
}
