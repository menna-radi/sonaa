import { NotificationRepository } from '../../domain/repositories/NotificationRepository';
import { NotificationItem, AlertCategory } from '../../domain/entities/Notification';
import { Result, ok, fail } from '../../core/result/Result';
import { NotFoundError } from '../../core/errors/AppError';

export class MockNotificationRepository implements NotificationRepository {
  private notifications: NotificationItem[] = [
    { id: '1', title: 'SOS triggered in Hittin', subtitle: 'Lina Al-Qahtani · Bathroom pipe burst · Job #SN-2417', time: '34s ago', unread: true, critical: true, category: 'emergency' },
    { id: '2', title: '129 verification requests pending', subtitle: 'Average SLA 3h 12m · 8 in last hour', time: '4m ago', unread: true, critical: false, category: 'verification' },
    { id: '3', title: 'Failed payout · 1,200 ILS', subtitle: 'Ahmad Al-Otaibi · Al Rajhi · Retry scheduled in 2h', time: '12m ago', unread: true, critical: true, category: 'payments' },
    { id: '4', title: 'Off-platform payment attempt flagged', subtitle: 'Chat #C-2912 · AI confidence 92%', time: '34m ago', unread: true, critical: true, category: 'fraud' },
    { id: '5', title: 'Surge in AC Repair tasks · Al Aqiq', subtitle: 'Volume +180% vs baseline · 12 emergencies', time: '1h ago', unread: false, critical: false, category: 'emergency' }
  ];

  private categories: AlertCategory[] = [
    { id: 'c1', nameKey: 'alert_emergency', descKey: 'alert_emergency_desc', subscribed: true },
    { id: 'c2', nameKey: 'alert_verification', descKey: 'alert_verification_desc', subscribed: true },
    { id: 'c3', nameKey: 'alert_payments', descKey: 'alert_payments_desc', subscribed: true },
    { id: 'c4', nameKey: 'alert_fraud', descKey: 'alert_fraud_desc', subscribed: true },
    { id: 'c5', nameKey: 'alert_reports', descKey: 'alert_reports_desc', subscribed: false }
  ];

  public async getNotifications(): Promise<Result<NotificationItem[]>> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return ok([...this.notifications]);
  }

  public async toggleRead(id: string): Promise<Result<NotificationItem>> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const idx = this.notifications.findIndex((n) => n.id === id);
    if (idx === -1) {
      return fail(new NotFoundError(`Notification with ID ${id} not found`));
    }
    this.notifications[idx] = {
      ...this.notifications[idx],
      unread: !this.notifications[idx].unread,
    };
    return ok(this.notifications[idx]);
  }

  public async markAllRead(): Promise<Result<void>> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.notifications = this.notifications.map((n) => ({ ...n, unread: false }));
    return ok(undefined);
  }

  public async deleteNotification(id: string): Promise<Result<boolean>> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const initialLength = this.notifications.length;
    this.notifications = this.notifications.filter((n) => n.id !== id);
    return ok(this.notifications.length < initialLength);
  }

  public async getAlertCategories(): Promise<Result<AlertCategory[]>> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return ok([...this.categories]);
  }

  public async toggleCategorySubscription(id: string): Promise<Result<AlertCategory>> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const idx = this.categories.findIndex((c) => c.id === id);
    if (idx === -1) {
      return fail(new NotFoundError(`Category with ID ${id} not found`));
    }
    this.categories[idx] = {
      ...this.categories[idx],
      subscribed: !this.categories[idx].subscribed,
    };
    return ok(this.categories[idx]);
  }
}
export default MockNotificationRepository;
