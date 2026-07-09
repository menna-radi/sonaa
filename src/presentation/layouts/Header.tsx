import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage, type Language } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, LogOut, Globe, Menu, AlertTriangle, UserCheck, AlertCircle, ShieldAlert, TrendingUp, Check } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useDependencies } from '../../core/di/DependencyProvider';
import { NotificationItem } from '../../domain/entities/Notification';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { t, language, setLanguage, isRtl } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { navigate, searchQuery, setSearchQuery } = useNavigation();
  const { dependencies } = useDependencies();
  const { notificationRepository } = dependencies;

  // Local notifications state loaded from API / Repository
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifications = useCallback(async () => {
    const res = await notificationRepository.getNotifications();
    if (res.success) {
      setNotifications(res.data);
    }
  }, [notificationRepository]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Refetch when dropdown opens to get any new notifications
  useEffect(() => {
    if (notifMenuOpen) {
      fetchNotifications();
    }
  }, [notifMenuOpen, fetchNotifications]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = async () => {
    const res = await notificationRepository.markAllRead();
    if (res.success) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    // 1. Mark as read in repository
    if (item.unread) {
      await notificationRepository.toggleRead(item.id);
      fetchNotifications();
    }
    // 2. Close dropdown
    setNotifMenuOpen(false);
    // 3. Navigate to relevant dashboard page
    switch (item.category) {
      case 'emergency':
        navigate('live_activity');
        break;
      case 'verification':
        navigate('verification');
        break;
      case 'payments':
        navigate('payments');
        break;
      case 'fraud':
        navigate('tasks');
        break;
      case 'reports':
        navigate('reports');
        break;
      default:
        navigate('notifications');
        break;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency':
        return <div style={{ background: '#fef2f2', color: '#dc2626', padding: '6px', borderRadius: '50%', display: 'flex' }}><AlertTriangle size={14} /></div>;
      case 'verification':
        return <div style={{ background: '#eff6ff', color: '#2563eb', padding: '6px', borderRadius: '50%', display: 'flex' }}><UserCheck size={14} /></div>;
      case 'payments':
        return <div style={{ background: '#fffbeb', color: '#d97706', padding: '6px', borderRadius: '50%', display: 'flex' }}><AlertCircle size={14} /></div>;
      case 'fraud':
        return <div style={{ background: '#fdf2f8', color: '#db2777', padding: '6px', borderRadius: '50%', display: 'flex' }}><ShieldAlert size={14} /></div>;
      default:
        return <div style={{ background: '#f5f3ff', color: '#7c3aed', padding: '6px', borderRadius: '50%', display: 'flex' }}><TrendingUp size={14} /></div>;
    }
  };

  return (
    <header className="top-header">
      {/* Start / Left elements */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flex: 1, minWidth: 0 }}>
        <button 
          className="menu-toggle" 
          onClick={onMenuToggle}
          style={{ display: 'none', color: 'var(--text-primary)' }}
        >
          <Menu size={24} />
        </button>

        {/* Localized Search Box */}
        <div className="search-box-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '652px', minWidth: 0, flexShrink: 1 }}>
          <input 
            type="text" 
            placeholder={t('search_placeholder') || 'Search users, tasks, transactions...'} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              height: '36px',
              boxSizing: 'border-box',
              background: 'var(--bg-surface-hover)', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--border-radius-sm)', 
              paddingLeft: '36px', 
              paddingRight: '36px', 
              fontSize: '0.875rem', 
              color: 'var(--text-primary)',
              outline: 'none'
            }} 
          />
          <Search 
            size={16} 
            style={{ 
              position: 'absolute', 
              top: '50%', 
              left: isRtl ? 'auto' : '12px', 
              right: isRtl ? '12px' : 'auto', 
              transform: 'translateY(-50%)', 
              color: 'var(--text-muted)',
              zIndex: 1
            }} 
          />
          {/* Keyboard shortcut indicator */}
          <span className="search-shortcut" style={{ 
            position: 'absolute', 
            top: '50%', 
            left: isRtl ? '12px' : 'auto', 
            right: isRtl ? 'auto' : '12px', 
            transform: 'translateY(-50%)', 
            background: 'var(--bg-surface)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '4px', 
            padding: '2px 6px', 
            fontSize: '0.7rem', 
            color: 'var(--text-muted)',
            fontWeight: 600,
            zIndex: 1
          }}>
            K
          </span>
        </div>
      </div>

      {/* End / Right elements */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        {/* Icon group: Bell + Language — tight gap */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Notification Bell */}
          <div className="notification-bell-wrapper" style={{ position: 'relative' }}>
            <button 
              className="notification-bell" 
              onClick={() => {
                setNotifMenuOpen(!notifMenuOpen);
                setLangMenuOpen(false);
              }}
              style={{ 
                position: 'relative', 
                width: '38px', 
                height: '38px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'var(--text-primary)', 
                borderRadius: '50%',
                background: notifMenuOpen ? 'var(--bg-surface-hover)' : 'transparent',
                cursor: 'pointer',
                border: 'none',
                outline: 'none',
                transition: 'background var(--transition-fast)',
              }}
              title={t('nav_notifications') || 'Notifications'}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{ 
                  position: 'absolute', 
                  top: '-2px', 
                  right: '-2px', 
                  background: 'var(--color-danger)', 
                  color: '#fff', 
                  borderRadius: '50%', 
                  width: '16px', 
                  height: '16px', 
                  fontSize: '0.65rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 700 
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {notifMenuOpen && (
              <>
                {/* Backdrop to close menu */}
                <div 
                  onClick={() => setNotifMenuOpen(false)} 
                  style={{
                    position: 'fixed',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 998
                  }} 
                />
                
                {/* Dropdown Container */}
                <div style={{
                  position: 'absolute',
                  top: '44px',
                  left: isRtl ? '0' : 'auto',
                  right: isRtl ? 'auto' : '0',
                  width: '340px',
                  background: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 999,
                  textAlign: isRtl ? 'right' : 'left',
                  direction: isRtl ? 'rtl' : 'ltr'
                }}>
                  {/* Dropdown Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: '1px solid #e4e4e7'
                  }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#171717' }}>
                      {t('nav_notifications') || 'Notifications'}
                    </span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-primary)',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: 0
                        }}
                      >
                        <Check size={12} />
                        <span>{t('btn_mark_all_read') || 'Mark all read'}</span>
                      </button>
                    )}
                  </div>

                  {/* Dropdown List */}
                  <div style={{
                    maxHeight: '280px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#71717a', fontSize: '0.8rem' }}>
                        No notifications
                      </div>
                    ) : (
                      notifications.map(item => (
                        <div 
                          key={item.id}
                          onClick={() => handleNotificationClick(item)}
                          style={{
                            display: 'flex',
                            gap: '10px',
                            padding: '10px 16px',
                            borderBottom: '1px solid #f4f4f5',
                            background: item.unread ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                            position: 'relative'
                          }}
                          className="notif-dropdown-item"
                        >
                          <div style={{ marginTop: '2px' }}>
                            {getCategoryIcon(item.category)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0, paddingInlineEnd: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                              <p style={{
                                margin: 0,
                                fontSize: '0.8rem',
                                fontWeight: item.unread ? 600 : 500,
                                color: item.unread ? '#171717' : '#52525b',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {item.title}
                              </p>
                              <span style={{ fontSize: '0.65rem', color: '#71717a', flexShrink: 0 }}>
                                {item.time}
                              </span>
                            </div>
                            <p style={{
                              margin: '2px 0 0',
                              fontSize: '0.72rem',
                              color: '#71717a',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {item.subtitle}
                            </p>
                          </div>
                          {item.unread && (
                            <span style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: '#ef4444',
                              position: 'absolute',
                              insetInlineEnd: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)'
                            }} />
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <button 
                    onClick={() => {
                      setNotifMenuOpen(false);
                      navigate('notifications');
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderTop: '1px solid #e4e4e7',
                      padding: '10px 16px',
                      color: 'var(--color-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      cursor: 'pointer',
                      width: '100%',
                      outline: 'none',
                      transition: 'background 0.15s, color 0.15s'
                    }}
                    className="view-all-notifs-btn"
                  >
                    View all notifications
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Language picker custom popover dropdown */}
          <div className="language-selector-wrapper" style={{ position: 'relative' }}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                color: 'var(--text-secondary)',
                background: langMenuOpen ? 'var(--bg-surface-hover)' : 'transparent',
                cursor: 'pointer',
                border: 'none',
                outline: 'none',
                transition: 'background var(--transition-fast)',
              }}
              title={t('language') || 'Language'}
            >
              <Globe size={18} />
            </button>

            {langMenuOpen && (
              <>
                <div 
                  onClick={() => setLangMenuOpen(false)} 
                  style={{
                    position: 'fixed',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 998
                  }} 
                />
                <div style={{
                  position: 'absolute',
                  top: '44px',
                  left: isRtl ? '0' : 'auto',
                  right: isRtl ? 'auto' : '0',
                  width: '140px',
                  background: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  padding: '4px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  zIndex: 999,
                }}>
                  {([
                    { code: 'en', name: 'English' },
                    { code: 'ar', name: 'العربية' },
                    { code: 'he', name: 'עברית' }
                  ] as const).map((langOption) => {
                    const isActive = language === langOption.code;
                    return (
                      <button
                        key={langOption.code}
                        onClick={() => {
                          setLanguage(langOption.code as Language);
                          setLangMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: '0.78rem',
                          fontWeight: isActive ? 600 : 500,
                          textAlign: isRtl ? 'right' : 'left',
                          borderRadius: '6px',
                          background: isActive ? '#27272a' : 'transparent',
                          color: isActive ? '#ffffff' : '#a1a1aa',
                          cursor: 'pointer',
                          border: 'none',
                          outline: 'none',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                        className="lang-menu-item-btn"
                      >
                        <span>{langOption.name}</span>
                        {isActive && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ffffff' }} />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

      {/* User Card & Logout dropdown */}
      {user && (
        <div className="user-profile-menu" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', borderInlineStart: '1px solid var(--border-color)', paddingInlineStart: 'var(--spacing-md)' }}>
          <button 
            onClick={logout} 
            title={t('btn_logout') || 'Log Out'}
            style={{ 
              padding: '6px', 
              color: 'var(--text-secondary)', 
              background: 'transparent', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginInlineStart: '4px',
              cursor: 'pointer'
            }}
            className="logout-button"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
      <style>{`
        .notif-dropdown-item:hover {
          background: #f4f4f5 !important;
        }
        .view-all-notifs-btn:hover {
          background: #fafafa !important;
        }
      `}</style>
    </div>
  </header>
  );
};
export default Header;
