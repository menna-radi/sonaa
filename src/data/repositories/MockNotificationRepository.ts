import { NotificationRepository } from '../../domain/repositories/NotificationRepository';
import { NotificationItem } from '../../domain/entities/Notification';
import { Result, ok, fail } from '../../core/result/Result';
import { NotFoundError } from '../../core/errors/AppError';

export class MockNotificationRepository implements NotificationRepository {
  private notifications: NotificationItem[] = [
    {
      id: '1',
      type: 'EMERGENCY_ALERT',
      title: 'SOS triggered in Hittin',
      body: 'Lina Al-Qahtani · Bathroom pipe burst · Job #SN-2417',
      isRead: false,
      createdAt: new Date(Date.now() - 34000).toISOString(),
      category: 'emergency',
      referenceId: 'SN-2417',
      entityType: 'task',
      unread: true,
      subtitle: 'Lina Al-Qahtani · Bathroom pipe burst · Job #SN-2417',
      critical: true,
    },
    {
      id: '2',
      type: 'VERIFICATION_PENDING',
      title: 'Verification requests pending review',
      body: 'Average SLA 3h 12m · 8 in last hour',
      isRead: false,
      createdAt: new Date(Date.now() - 240000).toISOString(),
      category: 'verification',
      entityType: 'verification',
      unread: true,
      subtitle: 'Average SLA 3h 12m · 8 in last hour',
      critical: false,
    },
    {
      id: '3',
      type: 'PAYMENT_FAILED',
      title: 'Failed payout · 1,200 ILS',
      body: 'Ahmad Al-Otaibi · Retry scheduled in 2h',
      isRead: false,
      createdAt: new Date(Date.now() - 720000).toISOString(),
      category: 'payments',
      entityType: 'commission',
      unread: true,
      subtitle: 'Ahmad Al-Otaibi · Retry scheduled in 2h',
      critical: true,
    },
    {
      id: '4',
      type: 'REPORT_SUBMITTED',
      title: 'Safety report submitted',
      body: 'Customer filed report for off-platform payment demand',
      isRead: false,
      createdAt: new Date(Date.now() - 2040000).toISOString(),
      category: 'reports',
      referenceId: 'REP-101',
      entityType: 'report',
      unread: true,
      subtitle: 'Customer filed report for off-platform payment demand',
      critical: false,
    },
    {
      id: '5',
      type: 'SYSTEM_STATUS',
      title: 'Database snapshot completed',
      body: 'Daily backup archive created successfully',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      category: 'system',
      unread: false,
      subtitle: 'Daily backup archive created successfully',
      critical: false,
    },
  ];

  public async getNotifications(): Promise<Result<NotificationItem[]>> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return ok([...this.notifications]);
  }

  public async markRead(id: string): Promise<Result<boolean>> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const idx = this.notifications.findIndex((n) => n.id === id);
    if (idx === -1) {
      return fail(new NotFoundError(`Notification with ID ${id} not found`));
    }
    this.notifications[idx] = {
      ...this.notifications[idx],
      isRead: true,
      unread: false,
    };
    return ok(true);
  }

  public async markAllRead(): Promise<Result<boolean>> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    this.notifications = this.notifications.map((n) => ({ ...n, isRead: true, unread: false }));
    return ok(true);
  }

  public async deleteNotification(id: string): Promise<Result<boolean>> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    this.notifications = this.notifications.filter((n) => n.id !== id);
    return ok(true);
  }

  public async toggleRead(id: string): Promise<Result<boolean>> {
    return this.markRead(id);
  }
}
export default MockNotificationRepository;
