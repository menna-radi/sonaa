import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Radio,
  Wrench,
  CheckSquare,
  ShieldCheck,
  FileText,
  Users,
  MessageSquare,
  Receipt,
  DollarSign,
  Percent,
  Megaphone,
  Send,
  BarChart3,
  Bell,
  UserCog,
} from 'lucide-react';
import type { PageKey } from '../context/NavigationContext';
import type { SidebarCounts } from '../hooks/useSidebarCounts';

export interface NavItemConfig {
  pageKey: PageKey;
  labelKey: string;
  icon: LucideIcon;
  badgeKey?: keyof SidebarCounts;
  live?: boolean;
}

export interface NavSectionConfig {
  titleKey: string;
  items: NavItemConfig[];
}

export const CAMPAIGN_ALIASES: PageKey[] = [
  'campaigns',
  'scheduled',
  'expired',
  'promotions',
  'ad_analytics',
  'create_ad',
  'ads',
];

export const NAV_SECTIONS: NavSectionConfig[] = [
  {
    titleKey: 'sec_operations',
    items: [
      { pageKey: 'overview', labelKey: 'nav_overview', icon: LayoutDashboard },
      { pageKey: 'live_activity', labelKey: 'nav_live_activity', icon: Radio, live: true },
    ],
  },
  {
    titleKey: 'sec_manage',
    items: [
      { pageKey: 'craftsmen', labelKey: 'nav_craftsmen', icon: Wrench },
      { pageKey: 'tasks', labelKey: 'nav_tasks', icon: CheckSquare, badgeKey: 'disputes' },
      { pageKey: 'verification', labelKey: 'nav_verification', icon: ShieldCheck, badgeKey: 'verification' },
      { pageKey: 'reports', labelKey: 'nav_reports', icon: FileText, badgeKey: 'reports' },
      { pageKey: 'users', labelKey: 'nav_users', icon: Users },
      { pageKey: 'chat', labelKey: 'nav_chat', icon: MessageSquare },
    ],
  },
  {
    titleKey: 'sec_money',
    items: [
      { pageKey: 'billing', labelKey: 'nav_billing', icon: Receipt, badgeKey: 'billing' },
      { pageKey: 'payments', labelKey: 'nav_payments', icon: DollarSign, badgeKey: 'payments' },
    ],
  },
  {
    titleKey: 'sec_growth',
    items: [
      { pageKey: 'promotions', labelKey: 'nav_offers', icon: Percent },
      { pageKey: 'campaigns', labelKey: 'nav_campaigns', icon: Megaphone },
      { pageKey: 'broadcast', labelKey: 'nav_broadcast', icon: Send },
    ],
  },
  {
    titleKey: 'sec_system',
    items: [
      { pageKey: 'service_management', labelKey: 'nav_service_management', icon: Wrench },
      { pageKey: 'analytics', labelKey: 'nav_analytics', icon: BarChart3 },
      { pageKey: 'notifications', labelKey: 'nav_notifications', icon: Bell, badgeKey: 'notifications' },
      { pageKey: 'settings', labelKey: 'nav_settings', icon: UserCog },
    ],
  },
];
