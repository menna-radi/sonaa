import React from 'react';
import {
  Bell,
  Settings,
  Check,
  Trash2,
  AlertTriangle,
  UserCheck,
  AlertCircle,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { useNotifications } from '../hooks/useNotifications';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button, IconButton } from '../../../components/ui/Button';
import { Segmented } from '../../../components/ui/Segmented';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Card } from '../../../components/ui/Card';
import { ListItem, IconCircle } from '../../../components/ui/ListItem';
import { Switch } from '../../../components/ui/FormFields';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useToast } from '../../../components/ui/Toast';

export const NotificationsPage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const { navigate } = useNavigation();
  const toast = useToast();

  const {
    notifications,
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
  } = useNotifications();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency':
        return <IconCircle icon={<AlertTriangle size={16} />} tone="danger" size={32} />;
      case 'verification':
        return <IconCircle icon={<UserCheck size={16} />} tone="info" size={32} />;
      case 'payments':
        return <IconCircle icon={<AlertCircle size={16} />} tone="warning" size={32} />;
      case 'fraud':
        return <IconCircle icon={<ShieldAlert size={16} />} tone="danger" size={32} />;
      case 'reports':
      case 'system':
      default:
        return <IconCircle icon={<TrendingUp size={16} />} tone="default" size={32} />;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-4)',
        direction: isRtl ? 'rtl' : 'ltr',
      }}
    >
      <PageHeader
        title={t('notifications_title') || 'Notifications'}
        subtitle={
          t('notifications_subtitle') ||
          'Real-time administrative alerts, critical security notices, and category subscription controls'
        }
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <Button
              size="sm"
              variant="outline"
              icon={<Settings size={14} />}
              onClick={() => {
                localStorage.setItem('settings_active_tab', 'notifications');
                navigate('settings');
              }}
            >
              {t('btn_preferences') || 'Preferences'}
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<Check size={14} />}
              onClick={() => {
                markAllRead();
                toast.success(t('btn_mark_all_read') || 'All notifications marked as read');
              }}
            >
              {t('btn_mark_all_read') || 'Mark all read'}
            </Button>
          </div>
        }
      />

      {/* Main split grid: Feed (left ~2fr) + Side Settings (right ~1fr) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 'var(--sp-4)',
          alignItems: 'start',
        }}
      >
        {/* Left Feed Card */}
        <Card
          title="Notification Feed"
          subtitle="Click any notification to toggle read/unread status"
          style={{ gridColumn: 'span 2' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            {/* Header controls: Segmented tabs + Search */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--sp-3)',
              }}
            >
              <Segmented
                value={activeTab}
                onChange={(v) => setActiveTab(v as any)}
                items={[
                  { value: 'all', label: t('notifications_all') || 'All', count: counters.all },
                  { value: 'unread', label: t('notifications_unread') || 'Unread', count: counters.unread },
                  {
                    value: 'critical',
                    label: t('notifications_critical') || 'Critical',
                    count: counters.critical,
                    tone: 'danger',
                  },
                ]}
              />

              <SearchInput
                placeholder="Search alerts by title or content..."
                value={searchQuery}
                onChange={setSearchQuery}
                style={{ maxWidth: 280 }}
              />
            </div>

            {/* Notifications List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              {notifications.length === 0 ? (
                <EmptyState
                  icon={<Bell size={32} style={{ color: 'var(--on-surface-subtle)' }} />}
                  title="No notifications found"
                  description="All alerts have been reviewed or no notifications match the current search query."
                />
              ) : (
                notifications.map((item) => (
                  <ListItem
                    key={item.id}
                    leading={getCategoryIcon(item.category)}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                        <span style={{ fontWeight: item.unread ? 700 : 500 }}>{item.title}</span>
                        {item.unread && (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: 'var(--primary)',
                              display: 'inline-block',
                            }}
                          />
                        )}
                      </div>
                    }
                    subtitle={item.subtitle}
                    meta={
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
                        {item.time}
                      </span>
                    }
                    trailing={
                      <IconButton
                        icon={<Trash2 size={14} />}
                        aria-label="Delete notification"
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(item.id);
                          toast.info('Notification dismissed.');
                        }}
                      />
                    }
                    selected={item.unread}
                    onClick={() => toggleRead(item.id)}
                  />
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Right Alert Categories Card */}
        <Card
          title={t('notifications_categories') || 'Alert Subscriptions'}
          subtitle={t('notifications_what_receive') || 'Toggle real-time dispatch categories'}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {categories.map((cat) => (
              <div
                key={cat.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--sp-3)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-sunken)',
                  border: '1px solid var(--border-subtle)',
                  gap: 'var(--sp-3)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--on-surface)' }}>
                    {t(cat.nameKey) || cat.id}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
                    {t(cat.descKey) || ''}
                  </div>
                </div>

                <Switch
                  checked={cat.subscribed}
                  onChange={() => {
                    toggleCategorySubscription(cat.id);
                    toast.info(`${t(cat.nameKey) || cat.id} subscription updated.`);
                  }}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
