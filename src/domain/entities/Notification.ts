export type NotificationCategory = 'emergency' | 'verification' | 'payments' | 'fraud' | 'reports' | 'system';

export interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  unread: boolean;
  critical: boolean;
  category: NotificationCategory;
}

export interface AlertCategory {
  id: string;
  nameKey: string;
  descKey: string;
  subscribed: boolean;
}
