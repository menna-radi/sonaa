import { useState, useMemo } from 'react';

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

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'SOS triggered in Hittin',
    subtitle: 'Lina Al-Qahtani · Bathroom pipe burst · Job #SN-2417',
    time: '34s ago',
    unread: true,
    critical: true,
    category: 'emergency',
  },
  {
    id: '2',
    title: '129 verification requests pending',
    subtitle: 'Average SLA 3h 12m · 8 in last hour',
    time: '4m ago',
    unread: true,
    critical: false,
    category: 'verification',
  },
  {
    id: '3',
    title: 'Failed payout · 1,200 ILS',
    subtitle: 'Ahmad Al-Otaibi · Arab Bank · Retry scheduled in 2h',
    time: '12m ago',
    unread: true,
    critical: true,
    category: 'payments',
  },
  {
    id: '4',
    title: 'Off-platform payment attempt flagged',
    subtitle: 'Chat #C-2912 · AI confidence 92%',
    time: '34m ago',
    unread: true,
    critical: true,
    category: 'fraud',
  },
  {
    id: '5',
    title: 'Surge in AC Repair tasks · Beit Hanina',
    subtitle: 'Volume +180% vs baseline · 12 emergencies',
    time: '1h ago',
    unread: true,
    critical: false,
    category: 'reports',
  },
  {
    id: '6',
    title: 'Daily reconciliation complete',
    subtitle: 'GMV 142,820 ILS · Commission 29,135 ILS',
    time: '2h ago',
    unread: false,
    critical: false,
    category: 'payments',
  },
  {
    id: '7',
    title: 'Yousef Al-Harbi approved',
    subtitle: 'Auto-approved · all checks passed',
    time: '3h ago',
    unread: false,
    critical: false,
    category: 'verification',
  },
  {
    id: '8',
    title: 'No-show pattern detected',
    subtitle: 'Hassan Al-Mutairi · 4 no-shows in 7 days · risk 84',
    time: '4h ago',
    unread: true,
    critical: true,
    category: 'fraud',
  },
];

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
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [categories, setCategories] = useState<AlertCategory[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'critical'>('all');

  // Toggle read status of a specific item
  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: !item.unread } : item))
    );
  };

  // Mark all unread notifications as read
  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  // Delete notification item
  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
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
  };
};
