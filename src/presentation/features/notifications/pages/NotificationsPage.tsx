import React, { useState } from 'react';
import {
  RefreshCw,
  CheckCheck,
  AlertTriangle,
  UserCheck,
  CreditCard,
  ShieldAlert,
  Bell,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Segmented } from '../../../components/ui/Segmented';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { formatRelativeTime } from '../../../../core/utils/format';
import { useNotifications } from '../hooks/useNotifications';
import type { NotificationItem, NotificationCategory } from '../../../../domain/entities/Notification';
import '../notifications.css';

export const NotificationsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { navigate } = useNavigation();
  const [categoryFilter, setCategoryFilter] = useState<'all' | NotificationCategory>('all');

  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    dataUpdatedAt,
    markRead,
    markAllRead,
    deleteNotification,
    isMarkingAllRead,
  } = useNotifications();

  const filterItems = [
    { value: 'all', label: t('notif_cat_all') },
    { value: 'emergency', label: t('notif_cat_emergency') },
    { value: 'verification', label: t('notif_cat_verification') },
    { value: 'payments', label: t('notif_cat_payments') },
    { value: 'reports', label: t('notif_cat_reports') },
    { value: 'system', label: t('notif_cat_system') },
  ];

  const filteredNotifications = notifications.filter((n) => {
    if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
    return true;
  });

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'emergency':
        return <AlertTriangle size={18} className="ui-text-strong" />;
      case 'verification':
        return <UserCheck size={18} className="ui-text-strong" />;
      case 'payments':
        return <CreditCard size={18} className="ui-text-strong" />;
      case 'reports':
        return <ShieldAlert size={18} className="ui-text-strong" />;
      case 'system':
      default:
        return <Bell size={18} className="ui-text-muted" />;
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    if (!item.isRead) {
      markRead(item.id);
    }

    const typeStr = (item.type || '').toUpperCase();
    const entity = (item.entityType || '').toLowerCase();

    if (entity === 'subscription' || entity === 'commission' || entity === 'billing' || typeStr.includes('PAYMENT') || typeStr.includes('COMMISSION')) {
      navigate('billing');
    } else if (entity === 'task' || typeStr.includes('TASK') || typeStr.includes('EMERGENCY') || typeStr.includes('DISPUTE')) {
      navigate('tasks');
    } else if (entity === 'verification' || typeStr.includes('VERIFICATION')) {
      navigate('verification');
    } else if (entity === 'report' || typeStr.includes('REPORT')) {
      navigate('reports');
    }
  };

  return (
    <div className="ui-page">
      <PageHeader
        title={t('notifications_title')}
        subtitle={t('notifications_subtitle')}
        meta={dataUpdatedAt ? `${t('updated')} ${formatRelativeTime(dataUpdatedAt, language)}` : undefined}
        actions={
          <div className="ui-row">
            <Button
              variant="outline"
              size="sm"
              icon={<CheckCheck size={14} />}
              loading={isMarkingAllRead}
              disabled={unreadCount === 0}
              onClick={() => markAllRead()}
            >
              {t('btn_mark_all_read')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw size={14} className={isFetching ? 'spin' : ''} />}
              loading={isFetching}
              onClick={() => refetch()}
            >
              {t('btn_refresh')}
            </Button>
          </div>
        }
      />

      {isError ? (
        <ErrorState
          title={t('status_error')}
          message={error?.message || t('err_generic')}
          onRetry={() => refetch()}
        />
      ) : (
        <div className="notifications-container">
          <Segmented
            value={categoryFilter}
            onChange={(val) => setCategoryFilter(val as 'all' | NotificationCategory)}
            items={filterItems}
          />

          <Card padding="none">
            {isLoading ? (
              <div className="ui-center" style={{ padding: 'var(--sp-8)' }}>
                <span className="ui-text-muted">{t('loading')}</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div style={{ padding: 'var(--sp-6)' }}>
                <EmptyState
                  icon={<Bell size={32} className="ui-text-muted" />}
                  title={t('notifications_empty_title')}
                  description={t('notifications_empty_desc')}
                />
              </div>
            ) : (
              <div className="notifications-list">
                {filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`notifications-item ${!item.isRead ? 'notifications-item--unread' : ''}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleItemClick(item);
                      }
                    }}
                  >
                    <div className="notifications-item__icon">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="notifications-item__body">
                      <div className="ui-row ui-row--between">
                        <span className="ui-text-strong">{item.title}</span>
                        <span className="ui-caption ui-text-faint">
                          {formatRelativeTime(item.createdAt, language)}
                        </span>
                      </div>
                      <p className="ui-caption ui-text-muted" style={{ margin: 0 }}>
                        {item.body}
                      </p>
                    </div>
                    <div className="notifications-item__actions">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 size={14} className="ui-text-muted" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(item.id);
                        }}
                        aria-label={t('btn_delete')}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
export default NotificationsPage;
