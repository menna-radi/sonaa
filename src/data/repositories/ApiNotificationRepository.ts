import { NotificationRepository } from '../../domain/repositories/NotificationRepository';
import { NotificationItem, NotificationCategory } from '../../domain/entities/Notification';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { AppError } from '../../core/errors/AppError';

export function deriveCategory(type?: string): NotificationCategory {
  const t = (type || '').toUpperCase();
  if (t.includes('EMERGENCY') || t.includes('SOS')) return 'emergency';
  if (t.includes('VERIFICATION') || t.includes('VERIFY')) return 'verification';
  if (t.includes('PAYMENT') || t.includes('COMMISSION') || t.includes('WITHDRAWAL') || t.includes('BILLING')) return 'payments';
  if (t.includes('REPORT') || t.includes('DISPUTE')) return 'reports';
  return 'system';
}

export class ApiNotificationRepository implements NotificationRepository {
  public async getNotifications(): Promise<Result<NotificationItem[]>> {
    try {
      const response = await apiClient.get<
        { items?: unknown[]; notifications?: unknown[] } | unknown[]
      >(API_ENDPOINTS.notifications.list);

      const rawItems = Array.isArray(response)
        ? response
        : (response as { items?: unknown[]; notifications?: unknown[] })?.items ||
          (response as { notifications?: unknown[] })?.notifications ||
          [];

      const items: NotificationItem[] = (rawItems as Record<string, unknown>[]).map(
        (n): NotificationItem => {
          const typeStr = typeof n.type === 'string' ? n.type : 'SYSTEM';
          const isRead = Boolean(n.isRead ?? n.read);
          const bodyStr = typeof n.body === 'string' ? n.body : (typeof n.message === 'string' ? n.message : (typeof n.subtitle === 'string' ? n.subtitle : ''));
          const titleStr = typeof n.title === 'string' ? n.title : 'Notification';
          const createdAt = typeof n.createdAt === 'string' ? new Date(n.createdAt).toISOString() : new Date().toISOString();
          const refId = n.referenceId ? String(n.referenceId) : (n.entityId ? String(n.entityId) : undefined);
          const entityType = typeof n.entityType === 'string' ? n.entityType : undefined;

          return {
            id: String(n.id || ''),
            type: typeStr,
            title: titleStr,
            body: bodyStr,
            isRead,
            createdAt,
            referenceId: refId,
            entityType,
            category: deriveCategory(typeStr),
            unread: !isRead,
            subtitle: bodyStr,
            time: createdAt,
            critical: typeStr.toUpperCase().includes('EMERGENCY'),
          };
        }
      );

      return ok(items);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async markRead(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.put<unknown>(API_ENDPOINTS.notifications.markRead(id));
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async markAllRead(): Promise<Result<boolean>> {
    try {
      await apiClient.put<unknown>(API_ENDPOINTS.notifications.markAllRead);
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async deleteNotification(id: string): Promise<Result<boolean>> {
    try {
      await apiClient.delete<unknown>(`/notifications/${id}`);
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async toggleRead(id: string): Promise<Result<boolean>> {
    return this.markRead(id);
  }
}
export default ApiNotificationRepository;
