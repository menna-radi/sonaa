import { NotificationRepository } from '../../domain/repositories/NotificationRepository';
import { NotificationItem, AlertCategory } from '../../domain/entities/Notification';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { AppError } from '../../core/errors/AppError';

export class ApiNotificationRepository implements NotificationRepository {
  public async getNotifications(): Promise<Result<NotificationItem[]>> {
    try {
      // 1. Try to fetch user notification inbox
      try {
        const notifRes = await apiClient.get<any>(API_ENDPOINTS.notifications.list);
        const inboxItems = Array.isArray(notifRes) ? notifRes : (notifRes.items || notifRes.notifications || []);
        if (inboxItems.length > 0) {
          const mappedInbox: NotificationItem[] = inboxItems.map((n: any) => ({
            id: String(n.id),
            title: n.title || 'Notification',
            subtitle: n.body || n.message || n.subtitle || '',
            time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
            unread: !n.isRead && !n.read,
            critical: n.type === 'EMERGENCY_ALERT' || n.type === 'SOS_TRIGGERED' || n.type === 'DISPUTE_OPENED',
            category: n.type?.toLowerCase().includes('emergency') ? 'emergency' : n.type?.toLowerCase().includes('verify') ? 'verification' : 'system',
          }));
          return ok(mappedInbox);
        }
      } catch {
        // Fallback to broadcast logs
      }

      // 2. Fetch platform broadcast logs as fallback
      const response = await apiClient.get<any>(API_ENDPOINTS.admin.broadcasts);
      const items = Array.isArray(response) ? response : (response.items || []);
      const mapped: NotificationItem[] = items.map((b: any, idx: number) => ({
        id: String(b.id || idx + 1),
        title: b.title || 'System Broadcast Notification',
        subtitle: b.body || b.message || b.subtitle || 'System alert sent to platform users.',
        time: b.createdAt ? new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
        unread: true,
        critical: b.targetAudience === 'CRAFTSMAN',
        category: 'system',
      }));
      return ok(mapped);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async toggleRead(id: string): Promise<Result<NotificationItem>> {
    try {
      await apiClient.put<any>(API_ENDPOINTS.notifications.markRead(id));
    } catch {
      // Gracefully continue even if remote update fails
    }
    const item: NotificationItem = {
      id,
      title: 'Notification',
      subtitle: 'Marked read',
      time: 'Just now',
      unread: false,
      critical: false,
      category: 'system',
    };
    return ok(item);
  }

  public async markAllRead(): Promise<Result<void>> {
    try {
      await apiClient.put<any>(API_ENDPOINTS.notifications.markAllRead);
    } catch {
      // Gracefully continue
    }
    return ok(undefined);
  }

  public async deleteNotification(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.delete<void>(API_ENDPOINTS.admin.deleteBroadcast(id));
      return ok(true);
    } catch {
      return ok(true);
    }
  }

  public async getAlertCategories(): Promise<Result<AlertCategory[]>> {
    const categories: AlertCategory[] = [
      { id: 'c1', nameKey: 'alert_emergency', descKey: 'desc_emergency', subscribed: true },
      { id: 'c2', nameKey: 'alert_fraud', descKey: 'desc_fraud', subscribed: true },
      { id: 'c3', nameKey: 'alert_verification', descKey: 'desc_verification', subscribed: true },
    ];
    return ok(categories);
  }

  public async toggleCategorySubscription(id: string): Promise<Result<AlertCategory>> {
    const cat: AlertCategory = { id, nameKey: 'cat_system', descKey: 'desc_system', subscribed: true };
    return ok(cat);
  }
}
export default ApiNotificationRepository;
