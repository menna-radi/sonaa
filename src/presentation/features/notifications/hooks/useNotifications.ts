import { useState, useMemo, useEffect, useCallback } from 'react';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import type { NotificationItem as DomainNotificationItem } from '../../../../domain/entities/Notification';

export interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  unread: boolean;
  critical: boolean;
  category: 'emergency' | 'verification' | 'payments' | 'fraud' | 'reports' | 'system';
}

export interface AlertCategory {
  id: string;
  nameKey: string;
  descKey: string;
  subscribed: boolean;
}

const INITIAL_CATEGORIES: AlertCategory[] = [
  {
    id: 'emergency',
    nameKey: 'cat_emergency',
    descKey: 'cat_emergency_desc',
    subscribed: true,
  },
  {
    id: 'verification',
    nameKey: 'cat_verification',
    descKey: 'cat_verification_desc',
    subscribed: true,
  },
  {
    id: 'payments',
    nameKey: 'cat_failed_payments',
    descKey: 'cat_failed_payments_desc',
    subscribed: true,
  },
  {
    id: 'fraud',
    nameKey: 'cat_fraud',
    descKey: 'cat_fraud_desc',
    subscribed: true,
  },
  {
    id: 'reports',
    nameKey: 'cat_user_reports',
    descKey: 'cat_user_reports_desc',
    subscribed: true,
  },
  {
    id: 'system',
    nameKey: 'cat_system_health',
    descKey: 'cat_system_health_desc',
    subscribed: false,
  },
];

export const useNotifications = () => {
  const { dependencies } = useDependencies();
  const { notificationRepository } = dependencies;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [categories, setCategories] = useState<AlertCategory[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'critical'>('all');
  const [loading, setLoading] = useState(true);

  // Load from repository
  const loadNotifications = useCallback(async () => {
    try {
      const result = await notificationRepository.getNotifications();
      if (result.success && result.data && result.data.length > 0) {
        setNotifications(result.data.map((n: DomainNotificationItem) => ({
          id: n.id,
          title: n.title,
          subtitle: n.subtitle,
          time: n.time,
          unread: n.unread,
          critical: n.critical,
          category: (n.category as any) || 'system',
        })));
      }
    } catch {
      // Keep existing
    } finally {
      setLoading(false);
    }
  }, [notificationRepository]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Toggle read status of a specific item
  const toggleRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: !item.unread } : item))
    );
    try {
      await notificationRepository.toggleRead(id);
    } catch {
      // Local state is already updated
    }
  };

  // Mark all unread notifications as read
  const markAllRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
    try {
      await notificationRepository.markAllRead();
    } catch {
      // Local state is already updated
    }
  };

  // Delete notification item
  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    try {
      await notificationRepository.deleteNotification(id);
    } catch {
      // Local state is already updated
    }
  };

  // Toggle toggle switches for notification categories subscriptions
  const toggleCategorySubscription = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, subscribed: !cat.subscribed } : cat))
    );
  };

  // Process and filter notifications based on tabs, search and active subscriptions
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // 1. Filter by Active Tab
      if (activeTab === 'unread' && !item.unread) return false;
      if (activeTab === 'critical' && !item.critical) return false;

      // 2. Filter by Search Query (Case Insensitive)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesSubtitle = item.subtitle.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSubtitle) return false;
      }

      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  // Tab counters dynamically updated
  const counters = useMemo(() => {
    const unreadCount = notifications.filter((item) => item.unread).length;
    const criticalCount = notifications.filter((item) => item.critical).length;
    return {
      all: notifications.length,
      unread: unreadCount,
      critical: criticalCount,
    };
  }, [notifications]);

  return {
    notifications: filteredNotifications,
    categories,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    toggleRead,
    markAllRead,
    deleteNotification,
    toggleCategorySubscription,
    counters,
    loading,
    refresh: loadNotifications,
  };
};

export default useNotifications;
