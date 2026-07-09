import { NotificationItem, AlertCategory } from '../entities/Notification';
import { Result } from '../../core/result/Result';

export interface NotificationRepository {
  getNotifications(): Promise<Result<NotificationItem[]>>;
  toggleRead(id: string): Promise<Result<NotificationItem>>;
  markAllRead(): Promise<Result<void>>;
  deleteNotification(id: string): Promise<Result<boolean>>;
  getAlertCategories(): Promise<Result<AlertCategory[]>>;
  toggleCategorySubscription(id: string): Promise<Result<AlertCategory>>;
}
