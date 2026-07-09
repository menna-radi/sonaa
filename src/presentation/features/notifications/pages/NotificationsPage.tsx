import React, { useState } from 'react';
import { 
  Bell, 
  Settings, 
  Check, 
  Trash2, 
  AlertTriangle, 
  UserCheck, 
  AlertCircle, 
  TrendingUp, 
  Search,
  ShieldAlert
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNotifications } from '../hooks/useNotifications';
import { Sidebar } from '../../../layouts/Sidebar';
import { Header } from '../../../layouts/Header';
import { MobileBottomTabs } from '../../../layouts/MobileBottomTabs';
import { useNavigation } from '../../../context/NavigationContext';

export const NotificationsPage: React.FC = () => {
  const { t } = useLanguage();
  const { navigate } = useNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Helper to render category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency':
        return (
          <div className="icon-badge emergency">
            <AlertTriangle size={16} />
          </div>
        );
      case 'verification':
        return (
          <div className="icon-badge verification">
            <UserCheck size={16} />
          </div>
        );
      case 'payments':
        return (
          <div className="icon-badge payments">
            <AlertCircle size={16} />
          </div>
        );
      case 'fraud':
        return (
          <div className="icon-badge fraud">
            <ShieldAlert size={16} />
          </div>
        );
      case 'reports':
      case 'system':
      default:
        return (
          <div className="icon-badge default">
            <TrendingUp size={16} />
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className="main-content">
        {/* Mobile Header (visible only on mobile) */}
        <div className="mobile-header mobile-only">
          <div className="mobile-header-left">
            <button
              onClick={() => setSidebarOpen(true)}
              className="mobile-logo-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textAlign: 'start',
                fontFamily: 'inherit',
              }}
            >
              <div className="mobile-logo">S</div>
              <div className="mobile-logo-text">
                <strong>Sonaa</strong>
                <span>Admin</span>
              </div>
            </button>
          </div>
          <div className="mobile-header-right" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button className="mobile-action-btn"><Search size={16} /></button>
            <button className="mobile-action-btn" style={{ position: 'relative' }}>
              <Bell size={16} />
              <span className="mobile-badge" />
            </button>
          </div>
        </div>

        {/* Mobile Subheader */}
        <div className="mobile-subheader mobile-only">
          <h2>{t('notifications_title') || 'Notifications'}</h2>
          <span>{t('notifications_subtitle') || 'Real-time admin alerts across the platform'}</span>
        </div>

        {/* Success Toast */}
        {toastMessage && (
          <div className="success-toast-box animate-fade-in">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Desktop/Tablet Page Header */}
        <div className="desktop-tablet-page-header desktop-tablet-only">
          <div style={{ textAlign: 'start' }}>
            <h1 className="notifications-page-title" style={{ margin: 0 }}>
              {t('notifications_title') || 'Notifications'}
            </h1>
            <p className="notifications-page-subtitle" style={{ margin: '4px 0 0 0' }}>
              {t('notifications_subtitle') || 'Real-time admin alerts across the platform'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              className="secondary-action-btn"
              onClick={() => {
                localStorage.setItem('settings_active_tab', 'notifications');
                navigate('settings');
              }}
            >
              <Settings size={14} />
              <span>{t('btn_preferences') || 'Preferences'}</span>
            </button>
            <button 
              className="primary-action-btn"
              onClick={() => {
                markAllRead();
                triggerToast(t('btn_mark_all_read') || 'Mark all read');
              }}
            >
              <Check size={14} />
              <span>{t('btn_mark_all_read') || 'Mark all read'}</span>
            </button>
          </div>
        </div>

        <div className="notifications-page-body">
          {/* 2. Main content split grid */}
          <div className="notifications-main-row">
            {/* Left Feed Card Container */}
            <div className="feed-card-container glass-card">
              <div className="feed-card-header">
                {/* Segmented control tabs */}
                <div className="feed-tabs">
                  <button
                    className={`feed-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                  >
                    <span>{t('notifications_all') || 'All'}</span>
                    <span className="tab-badge all">{counters.all}</span>
                  </button>

                  <button
                    className={`feed-tab-btn ${activeTab === 'unread' ? 'active' : ''}`}
                    onClick={() => setActiveTab('unread')}
                  >
                    <span>{t('notifications_unread') || 'Unread'}</span>
                    <span className="tab-badge unread">{counters.unread}</span>
                  </button>

                  <button
                    className={`feed-tab-btn ${activeTab === 'critical' ? 'active' : ''}`}
                    onClick={() => setActiveTab('critical')}
                  >
                    <span>{t('notifications_critical') || 'Critical'}</span>
                    <span className="tab-badge critical">{counters.critical}</span>
                  </button>
                </div>

                {/* Local search input */}
                <div className="feed-search-wrapper">
                  <Search size={14} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              {/* Notifications feed list */}
              <div className="feed-items-list">
                {notifications.length === 0 ? (
                  <div className="empty-state">
                    <Bell size={28} className="empty-icon" />
                    <p>No notifications found matching filter</p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div 
                      key={item.id} 
                      className={`feed-item-card ${item.unread ? 'unread' : 'read'}`}
                      onClick={() => toggleRead(item.id)}
                    >
                      <div className="feed-item-left">
                        {getCategoryIcon(item.category)}
                        <div className="feed-item-content">
                          <div className="feed-item-title-row">
                            <strong className="item-title">{item.title}</strong>
                            {item.unread && <span className="item-unread-dot" />}
                          </div>
                          <p className="item-subtitle">{item.subtitle}</p>
                        </div>
                      </div>
                      <div className="feed-item-right" onClick={(e) => e.stopPropagation()}>
                        <span className="item-time">{item.time}</span>
                        <button 
                          className="item-delete-btn" 
                          onClick={() => {
                            deleteNotification(item.id);
                            triggerToast('Notification deleted');
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Alert Categories Subscriptions Container */}
            <div className="categories-card-container glass-card">
              <div className="categories-header">
                <span className="categories-sub-tag">
                  {t('notifications_categories') || 'Alert Categories'}
                </span>
                <h3 className="categories-title">
                  {t('notifications_what_receive') || 'What you receive'}
                </h3>
              </div>

              <div className="categories-list">
                {categories.map((cat) => (
                  <div key={cat.id} className="category-item-card">
                    <div className="category-text-box">
                      <strong className="category-name">{t(cat.nameKey) || cat.id}</strong>
                      <p className="category-desc">{t(cat.descKey) || ''}</p>
                    </div>

                    <button
                      className={`custom-toggle-switch ${cat.subscribed ? 'on' : 'off'}`}
                      onClick={() => {
                        toggleCategorySubscription(cat.id);
                        triggerToast(`${t(cat.nameKey)} subscription toggled`);
                      }}
                      aria-label={`Toggle subscription for ${cat.id}`}
                    >
                      <div className="switch-handle" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CSS styles styled explicitly to match platform UI perfectly */}
        <style dangerouslySetInnerHTML={{ __html: `
          .notifications-page-body {
            display: flex;
            flex-direction: column;
            gap: 24px;
            width: 100%;
            box-sizing: border-box;
          }

          .desktop-only {
            display: flex !important;
          }
          .mobile-only {
            display: none !important;
          }

          /* Toast style */
          .success-toast-box {
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: #171717;
            color: #ffffff;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 600;
            box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            pointer-events: none;
          }

          /* Primary & Secondary Action buttons styling */
          .primary-action-btn, .secondary-action-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 9px 16px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all var(--transition-fast, 0.2s);
          }

          .primary-action-btn {
            background: #171717;
            color: #ffffff;
            border: none;
          }

          .secondary-action-btn {
            background: #ffffff;
            color: #171717;
            border: 1px solid #e5e5e5;
          }

          .primary-action-btn:hover, .secondary-action-btn:hover {
            opacity: 0.9;
          }

          /* Main content row */
          .notifications-main-row {
            display: flex;
            gap: 16px;
            align-items: flex-start;
            width: 100%;
            box-sizing: border-box;
          }

          /* Glass card layout styles */
          .glass-card {
            background: #ffffff;
            border: 1px solid #e5e5e5;
            border-radius: 16px;
            box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.04);
            padding: 20px;
            box-sizing: border-box;
          }

          /* Feed Card container */
          .feed-card-container {
            flex: 552 1 0%;
            display: flex;
            flex-direction: column;
            gap: 20px;
            box-sizing: border-box;
          }

          .feed-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            border-bottom: 1px solid #f5f5f5;
            padding-bottom: 16px;
          }

          .feed-tabs {
            display: flex;
            background: #f5f5f5;
            padding: 2px;
            border-radius: 8px;
            gap: 2px;
          }

          .feed-tab-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border-radius: 6px;
            border: none;
            background: transparent;
            font-size: 11px;
            font-weight: 700;
            color: #737373;
            cursor: pointer;
            transition: all var(--transition-fast, 0.2s);
          }

          .feed-tab-btn.active {
            background: #ffffff;
            color: #171717;
            box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
          }

          .tab-badge {
            font-size: 9px;
            font-weight: 700;
            padding: 1px 5px;
            border-radius: 4px;
          }

          .tab-badge.all {
            background: #171717;
            color: #ffffff;
          }

          .tab-badge.unread, .tab-badge.critical {
            background: #e5e5e5;
            color: #737373;
          }

          .feed-tab-btn.active .tab-badge.unread, 
          .feed-tab-btn.active .tab-badge.critical {
            background: #171717;
            color: #ffffff;
          }

          /* Local search input */
          .feed-search-wrapper {
            position: relative;
            flex: 1;
            max-width: 200px;
          }

          .search-icon {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: #a3a3a3;
          }

          .search-input {
            width: 100%;
            background: #f5f5f5;
            border: 1px solid transparent;
            border-radius: 6px;
            padding: 6px 10px 6px 30px;
            font-size: 11px;
            color: #171717;
            outline: none;
            box-sizing: border-box;
            transition: all var(--transition-fast, 0.2s);
          }

          .search-input:focus {
            border-color: #d4d4d4;
            background: #ffffff;
          }

          /* Feed Items List */
          .feed-items-list {
            display: flex;
            flex-direction: column;
            max-height: 480px;
            overflow-y: auto;
          }

          .feed-items-list::-webkit-scrollbar {
            width: 6px;
          }

          .feed-items-list::-webkit-scrollbar-thumb {
            background: #e5e5e5;
            border-radius: 4px;
          }

          .feed-item-card {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            border-top: 1px solid #f5f5f5;
            cursor: pointer;
            transition: background var(--transition-fast, 0.2s), opacity var(--transition-fast, 0.2s);
            box-sizing: border-box;
          }

          .feed-item-card:first-child {
            border-top: none;
          }

          .feed-item-card:hover {
            background: #fafafa;
          }

          .feed-item-card.read {
            opacity: 0.65;
          }

          .feed-item-left {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            text-align: start;
          }

          /* Badges with colors corresponding to Figma mockup alerts */
          .icon-badge {
            width: 36px;
            height: 36px;
            border-radius: 9999px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .icon-badge.emergency {
            background: #fef2f2;
            color: #ef4444;
          }

          .icon-badge.verification {
            background: #f5f5f5;
            color: #171717;
          }

          .icon-badge.payments {
            background: #fffbeb;
            color: #f59e0b;
          }

          .icon-badge.fraud {
            background: #fef2f2;
            color: #ef4444;
          }

          .icon-badge.default {
            background: #f5f5f5;
            color: #171717;
          }

          .feed-item-content {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .feed-item-title-row {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .item-title {
            font-size: 12px;
            font-weight: 700;
            color: #171717;
          }

          .item-unread-dot {
            width: 6px;
            height: 6px;
            border-radius: 9999px;
            background: #3b82f6;
            flex-shrink: 0;
          }

          .item-subtitle {
            font-size: 11px;
            color: #737373;
            margin: 0;
          }

          .feed-item-right {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .item-time {
            font-size: 10px;
            color: #a3a3a3;
          }

          .item-delete-btn {
            background: transparent;
            border: none;
            color: #a3a3a3;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            opacity: 0;
            transition: all var(--transition-fast, 0.2s);
          }

          .feed-item-card:hover .item-delete-btn {
            opacity: 1;
          }

          .item-delete-btn:hover {
            color: #ef4444;
            background: #fef2f2;
          }

          /* Empty State */
          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 48px 16px;
            color: #a3a3a3;
          }

          .empty-icon {
            margin-bottom: 12px;
            opacity: 0.5;
          }

          .empty-state p {
            font-size: 12px;
            margin: 0;
          }

          /* Right Alert Categories subscriptions card */
          .categories-card-container {
            flex: 268 1 0%;
            display: flex;
            flex-direction: column;
            gap: 16px;
            text-align: start;
            box-sizing: border-box;
          }

          .categories-header {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .categories-sub-tag {
            font-size: 10px;
            font-weight: 700;
            color: #737373;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }

          .categories-title {
            font-size: 14px;
            font-weight: 700;
            color: #171717;
            margin: 0;
          }

          .categories-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .category-item-card {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #fafafa;
            border-radius: 12px;
            padding: 12px;
            gap: 12px;
          }

          .category-text-box {
            display: flex;
            flex-direction: column;
            gap: 2px;
            flex: 1;
          }

          .category-name {
            font-size: 12px;
            font-weight: 700;
            color: #171717;
          }

          .category-desc {
            font-size: 10px;
            color: #737373;
            margin: 0;
          }

          /* Custom toggle switch styling matching Figma exactly */
          .custom-toggle-switch {
            width: 36px;
            height: 20px;
            border-radius: 9999px;
            position: relative;
            cursor: pointer;
            border: none;
            padding: 2px;
            transition: background-color 0.2s ease;
            outline: none;
            flex-shrink: 0;
          }

          .custom-toggle-switch.on {
            background-color: #171717;
          }

          .custom-toggle-switch.off {
            background-color: #d4d4d4;
          }

          .switch-handle {
            width: 16px;
            height: 16px;
            border-radius: 9999px;
            background-color: #ffffff;
            position: absolute;
            top: 2px;
            transition: transform 0.2s ease;
          }

          .custom-toggle-switch.on .switch-handle {
            transform: translateX(16px);
          }

          .custom-toggle-switch.off .switch-handle {
            transform: translateX(0px);
          }

          /* Language directional fixes */
          [dir="rtl"] .custom-toggle-switch.on .switch-handle {
            transform: translateX(-16px);
          }

          [dir="rtl"] .feed-search-wrapper .search-icon {
            left: auto;
            right: 10px;
          }

          [dir="rtl"] .feed-search-wrapper .search-input {
            padding: 6px 30px 6px 10px;
          }

           /* Responsive tablet layout (max-width: 1150px) */
           @media (max-width: 1150px) {
             .notifications-page-body {
               padding: 0 !important;
               gap: 16px !important;
               width: 100% !important;
               box-sizing: border-box !important;
             }

             .notifications-main-row {
               flex-direction: column;
               width: 100% !important;
               box-sizing: border-box !important;
               gap: 16px !important;
             }

             .feed-card-container {
               width: 100% !important;
               max-width: 100% !important;
               box-sizing: border-box !important;
               flex: none !important;
             }

             .categories-card-container {
               width: 100% !important;
               max-width: 100% !important;
               box-sizing: border-box !important;
               flex: none !important;
             }

             .category-item-card {
               padding: 16px;
             }
           }

           /* Responsive mobile layout (max-width: 768px) */
           @media (max-width: 768px) {
             .notifications-page-body {
               padding: 20px !important;
               gap: 16px !important;
               width: 100% !important;
               box-sizing: border-box !important;
             }

             .desktop-only {
               display: none !important;
             }

             .mobile-only {
               display: flex !important;
             }

             .mobile-hidden {
               display: none !important;
            }

            .mobile-visible-flex {
              display: flex !important;
              flex-direction: column;
            }

            .mobile-visible-block {
              display: block !important;
            }

            .main-content {
              margin-inline-start: 0 !important;
              padding-top: 0 !important;
              padding-bottom: 96px !important;
              padding-inline-start: 0 !important;
              padding-inline-end: 0 !important;
            }

            .mobile-section-toggles {
              background: #f3f4f6;
              border: 1px solid #e5e7eb;
              padding: 4px;
              border-radius: 12px;
              gap: 4px;
              width: 100%;
              box-sizing: border-box;
              margin-top: 4px;
              margin-bottom: 8px;
            }

            .mobile-section-toggle-btn {
              flex: 1;
              border: none;
              background: transparent;
              padding: 8px 6px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 700;
              color: #475569;
              cursor: pointer;
              text-align: center;
              transition: background 0.2s, color 0.2s;
              white-space: nowrap;
            }

            .mobile-section-toggle-btn.active {
              background: #ffffff !important;
              color: #111827 !important;
              box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
            }

            .feed-card-header {
              flex-direction: column;
              align-items: stretch;
              gap: 12px;
            }

            .feed-search-wrapper {
              max-width: none;
            }

            .feed-item-card {
              padding: 14px 12px;
            }

            .item-delete-btn {
              opacity: 1 !important; /* Always show delete button on mobile hover equivalent */
            }
          }
        `}} />
      </main>

      <MobileBottomTabs />
    </div>
  );
};
