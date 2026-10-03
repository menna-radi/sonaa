export type NotificationCategory =
  | 'emergency'
  | 'verification'
  | 'payments'
  | 'reports'
  | 'system'
  | 'chat'
  | 'fraud';

export interface NotificationItem {
  id: string;
  type?: string;
  title: string;
  body?: string;
  isRead?: boolean;
  createdAt?: string;
  referenceId?: string;
  entityType?: string;
  category: NotificationCategory;
  unread?: boolean;
  subtitle?: string;
  time?: string;
  critical?: boolean;
}
