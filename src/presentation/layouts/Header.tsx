import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage, type Language } from '../context/LanguageContext';
import { useNavigation } from '../context/NavigationContext';
import { useDependencies } from '../../core/di/DependencyProvider';
import { NotificationItem, NotificationCategory } from '../../domain/entities/Notification';
import { Search, Bell, Globe, Menu, X, Check, MessageSquare, AlertTriangle, UserCheck, AlertCircle, ShieldAlert, TrendingUp } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { storageService } from '../../core/storage/StorageService';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { t, language, setLanguage, isRtl } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const { navigate, searchQuery, setSearchQuery } = useNavigation();
  const { dependencies } = useDependencies();
  const { notificationRepository } = dependencies;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl/Cmd + K shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationRepository.getNotifications();
      if (res.success) {
        setNotifications(res.data);
      }
    } catch {
      // Graceful fallback
    }
  }, [notificationRepository]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (notifMenuOpen) {
      fetchNotifications();
    }
  }, [notifMenuOpen, fetchNotifications]);

  // Real-time WebSocket connection
  useEffect(() => {
    const token = storageService.getToken();
    const socket = io(window.location.origin, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('notification:new', (notif: any) => {
      const newNotif: NotificationItem = {
        id: notif.id || `notif_${Date.now()}`,
        title: notif.title || 'New Notification',
        subtitle: notif.subtitle || notif.body || '',
        category: (notif.category || notif.type || 'system') as NotificationCategory,
        time: notif.time || 'Just now',
        unread: true,
        critical: Boolean(notif.critical),
      };
      setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
    });

    socket.on('chat:message', (msg: any) => {
      if (msg.senderRole !== 'ADMIN') {
        const notif: NotificationItem = {
          id: `chat_notif_${msg.id || Date.now()}`,
          title: `Message from ${msg.senderName || 'User'}`,
          subtitle: msg.content || 'Sent an attachment',
          category: 'chat',
          time: 'Just now',
          unread: true,
          critical: false,
        };
        setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = async () => {
    const res = await notificationRepository.markAllRead();
    if (res.success) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (item.unread) {
      await notificationRepository.toggleRead(item.id);
      fetchNotifications();
    }
    setNotifMenuOpen(false);
    switch (item.category) {
      case 'chat': navigate('chat'); break;
      case 'emergency': navigate('live_activity'); break;
      case 'verification': navigate('verification'); break;
      case 'payments': navigate('payments'); break;
      case 'fraud': navigate('tasks'); break;
      case 'reports': navigate('reports'); break;
      default: navigate('notifications'); break;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'chat': return <div style={{ background: 'var(--success-soft)', color: 'var(--success)', padding: 6, borderRadius: '50%', display: 'flex' }}><MessageSquare size={14} /></div>;
      case 'emergency': return <div style={{ background: 'var(--danger-soft)', color: 'var(--danger)', padding: 6, borderRadius: '50%', display: 'flex' }}><AlertTriangle size={14} /></div>;
      case 'verification': return <div style={{ background: 'var(--info-soft)', color: 'var(--info)', padding: 6, borderRadius: '50%', display: 'flex' }}><UserCheck size={14} /></div>;
      case 'payments': return <div style={{ background: 'var(--warning-soft)', color: 'var(--warning)', padding: 6, borderRadius: '50%', display: 'flex' }}><AlertCircle size={14} /></div>;
      case 'fraud': return <div style={{ background: 'var(--danger-soft)', color: 'var(--danger)', padding: 6, borderRadius: '50%', display: 'flex' }}><ShieldAlert size={14} /></div>;
      default: return <div style={{ background: 'var(--surface-sunken)', color: 'var(--text-strong)', padding: 6, borderRadius: '50%', display: 'flex' }}><TrendingUp size={14} /></div>;
    }
  };

  return (
    <header
      className="top-header"
      style={{
        height: 'var(--topbar-h)',
        backgroundColor: 'var(--surface-card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--page-pad)',
        gap: 'var(--space-4)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Mobile Drawer Hamburger Trigger */}
      <button
        onClick={onMenuToggle}
        className="menu-toggle"
        aria-label="Toggle navigation drawer"
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          color: 'var(--text-strong)',
          cursor: 'pointer',
          padding: 4,
        }}
      >
        <Menu size={20} />
      </button>

      {/* Centered Search Pill */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 560,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--surface-sunken)',
            borderRadius: 'var(--radius-full)',
            padding: '0 14px',
            height: 38,
            border: '1px solid transparent',
            transition: 'all var(--dur-fast) var(--ease)',
          }}
          className="topbar-search-pill"
        >
          <Search size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={t('search_placeholder') || 'Search users, tasks, transactions... (⌘K)'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              padding: '0 10px',
              fontFamily: 'inherit',
              fontSize: 'var(--fs-body)',
              color: 'var(--text-strong)',
            }}
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          ) : (
            <kbd
              style={{
                fontSize: 11,
                padding: '2px 6px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface-card)',
                color: 'var(--text-faint)',
                userSelect: 'none',
                fontFamily: 'inherit',
              }}
            >
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* End Controls: Notification Bell + Language */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setNotifMenuOpen(!notifMenuOpen);
              setLangMenuOpen(false);
            }}
            aria-label="Notifications"
            style={{
              position: 'relative',
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: notifMenuOpen ? 'var(--surface-hover)' : 'transparent',
              border: 'none',
              color: 'var(--text-body)',
              cursor: 'pointer',
              transition: 'background var(--dur-fast) var(--ease)',
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 8,
                  insetInlineEnd: 8,
                  width: 8,
                  height: 8,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--live)',
                  animation: 'livePulse 1.5s ease-in-out infinite',
                }}
              />
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifMenuOpen && (
            <>
              <div
                style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, zIndex: 998 }}
                onClick={() => setNotifMenuOpen(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  insetInlineEnd: 0,
                  width: 340,
                  backgroundColor: 'var(--surface-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-pop)',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 999,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 'var(--fs-small)', color: 'var(--text-strong)' }}>
                    {t('nav_notifications') || 'Notifications'}
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-strong)',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Check size={12} />
                      <span>{t('btn_mark_all_read') || 'Mark all read'}</span>
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                      No notifications
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        style={{
                          display: 'flex',
                          gap: 10,
                          padding: '10px 16px',
                          borderBottom: '1px solid var(--border)',
                          backgroundColor: item.unread ? 'var(--surface-sunken)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background var(--dur-fast) var(--ease)',
                        }}
                      >
                        <div style={{ marginTop: 2 }}>{getCategoryIcon(item.category)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: item.unread ? 600 : 500, color: 'var(--text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.title}
                            </p>
                            <span style={{ fontSize: 11, color: 'var(--text-faint)', flexShrink: 0 }}>
                              {item.time}
                            </span>
                          </div>
                          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => {
                    setNotifMenuOpen(false);
                    navigate('notifications');
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderTop: '1px solid var(--border)',
                    padding: 10,
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-strong)',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  View all notifications
                </button>
              </div>
            </>
          )}
        </div>

        {/* Language Selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setLangMenuOpen(!langMenuOpen);
              setNotifMenuOpen(false);
            }}
            aria-label="Language selector"
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: langMenuOpen ? 'var(--surface-hover)' : 'transparent',
              border: 'none',
              color: 'var(--text-body)',
              cursor: 'pointer',
            }}
          >
            <Globe size={18} />
          </button>

          {langMenuOpen && (
            <>
              <div
                style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, zIndex: 998 }}
                onClick={() => setLangMenuOpen(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  insetInlineEnd: 0,
                  width: 140,
                  backgroundColor: 'var(--surface-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-pop)',
                  padding: 4,
                  zIndex: 999,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {([
                  { code: 'en', name: 'English' },
                  { code: 'ar', name: 'العربية' },
                  { code: 'he', name: 'עברית' },
                ] as const).map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => {
                      setLanguage(opt.code as Language);
                      setLangMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: 13,
                      fontWeight: language === opt.code ? 600 : 500,
                      borderRadius: 'var(--radius-xs)',
                      border: 'none',
                      backgroundColor: language === opt.code ? 'var(--surface-sunken)' : 'transparent',
                      color: 'var(--text-strong)',
                      cursor: 'pointer',
                      textAlign: isRtl ? 'right' : 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{opt.name}</span>
                    {language === opt.code && <Check size={14} />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
