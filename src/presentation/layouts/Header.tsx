import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '../context/NavigationContext';
import { useBreakpoint } from '../components/ui/useBreakpoint';
import { useDependencies } from '../../core/di/DependencyProvider';
import { unwrap } from '../../core/query/unwrap';
import { NotificationItem, NotificationCategory } from '../../domain/entities/Notification';
import { Search, Bell, Globe, Menu, X, Check, MessageSquare, AlertTriangle, UserCheck, AlertCircle, ShieldAlert, TrendingUp, Settings } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { storageService } from '../../core/storage/StorageService';
import './layouts.css';

interface HeaderProps {
  onMenuToggle: () => void;
}

interface SocketNotificationPayload {
  id?: unknown;
  title?: unknown;
  subtitle?: unknown;
  body?: unknown;
  category?: unknown;
  type?: unknown;
  time?: unknown;
  critical?: unknown;
}

interface SocketChatPayload {
  id?: unknown;
  senderRole?: unknown;
  senderName?: unknown;
  content?: unknown;
}

const asText = (v: unknown, fallback = ''): string => (typeof v === 'string' && v ? v : fallback);

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { t, language, setLanguage } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const { navigate, currentPage, searchQuery, setSearchQuery } = useNavigation();
  const { isMobile } = useBreakpoint();
  const { dependencies } = useDependencies();
  const { notificationRepository } = dependencies;
  const qc = useQueryClient();

  const socketRef = useRef<Socket | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Bell badge shares the ['notifications'] query (no separate fetch).
  const notifQ = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationRepository.getNotifications().then(unwrap),
    staleTime: 30000,
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
  });
  const notifications = notifQ.data ?? [];
  const prependNotification = (item: NotificationItem) => {
    qc.setQueryData<NotificationItem[]>(['notifications'], (prev) =>
      prev ? [item, ...prev.filter((n) => n.id !== item.id)] : [item]
    );
  };

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

  useEffect(() => {
    if (notifMenuOpen) {
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    }
  }, [notifMenuOpen, qc]);

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

    socket.on('notification:new', (payload: SocketNotificationPayload) => {
      const notif = payload ?? {};
      const rawCategory = typeof notif.category === 'string' ? notif.category : typeof notif.type === 'string' ? notif.type : 'system';
      const category: NotificationCategory =
        rawCategory === 'chat' || rawCategory === 'emergency' || rawCategory === 'verification' || rawCategory === 'payments' || rawCategory === 'reports'
          ? rawCategory
          : 'system';
      const newNotif: NotificationItem = {
        id: asText(notif.id, `notif_${Date.now()}`),
        title: asText(notif.title, 'New Notification'),
        subtitle: asText(notif.subtitle, asText(notif.body)),
        category,
        time: asText(notif.time, 'Just now'),
        unread: true,
        critical: notif.critical === true,
      };
      prependNotification(newNotif);
    });

    socket.on('chat:message', (payload: SocketChatPayload) => {
      const msg = payload ?? {};
      if (msg.senderRole !== 'ADMIN') {
        const notif: NotificationItem = {
          id: `chat_notif_${asText(msg.id, String(Date.now()))}`,
          title: `Message from ${asText(msg.senderName, 'User')}`,
          subtitle: asText(msg.content, 'Sent an attachment'),
          category: 'chat',
          time: 'Just now',
          unread: true,
          critical: false,
        };
        prependNotification(notif);
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
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (item.unread) {
      await notificationRepository.toggleRead(item.id);
      void qc.invalidateQueries({ queryKey: ['notifications'] });
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
      case 'chat': return <div className="hd-cat-icon hd-cat-icon--chat"><MessageSquare size={14} /></div>;
      case 'emergency': return <div className="hd-cat-icon hd-cat-icon--emergency"><AlertTriangle size={14} /></div>;
      case 'verification': return <div className="hd-cat-icon hd-cat-icon--verification"><UserCheck size={14} /></div>;
      case 'payments': return <div className="hd-cat-icon hd-cat-icon--payments"><AlertCircle size={14} /></div>;
      case 'fraud': return <div className="hd-cat-icon hd-cat-icon--fraud"><ShieldAlert size={14} /></div>;
      default: return <div className="hd-cat-icon"><TrendingUp size={14} /></div>;
    }
  };

  return (
    <header
      className={`top-header hd${isMobile ? ' is-mobile' : ''}`}
    >
      {/* Mobile Drawer Hamburger Trigger */}
      <button
        onClick={onMenuToggle}
        className="menu-toggle hd-menu-btn"
        aria-label={t('header_aria_menu')}
      >
        <Menu size={20} />
      </button>

      {/* Centered Search Pill */}
      <div className="hd-search-wrap">
        <div
          className={`topbar-search-pill hd-search-pill${isMobile ? ' is-mobile' : ''}`}
        >
          <Search size={16} color="var(--text-muted)" className="hd-search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={
              isMobile
                ? t('search_placeholder_short') || 'Search…'
                : t('search_placeholder') || 'Search users, tasks, transactions... (⌘K)'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="hd-search-input"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="hd-search-clear"
              aria-label={t('header_aria_clear')}
            >
              <X size={14} />
            </button>
          ) : (
            /* ⌘K hint is desktop-only — no room or shortcut on touch */
            !isMobile && (
              <kbd className="hd-search-kbd">
                ⌘K
              </kbd>
            )
          )}
        </div>
      </div>

      {/* End Controls: Notification Bell + Language */}
      <div className={`hd-controls${isMobile ? ' is-mobile' : ''}`}>
        {/* Notification Bell */}
        <div className="hd-pop-wrap">
          <button
            onClick={() => {
              setNotifMenuOpen(!notifMenuOpen);
              setLangMenuOpen(false);
            }}
            aria-label={t('nav_notifications')}
            className={`hd-icon-btn${notifMenuOpen ? ' is-open' : ''}`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="hd-dot" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifMenuOpen && (
            <>
              <div
                className="hd-pop-overlay"
                onClick={() => setNotifMenuOpen(false)}
              />
              <div className="hd-pop">
                <div className="hd-pop-head">
                  <span className="hd-pop-title">
                    {t('nav_notifications') || 'Notifications'}
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="hd-mark-read"
                    >
                      <Check size={12} />
                      <span>{t('btn_mark_all_read') || 'Mark all read'}</span>
                    </button>
                  )}
                </div>

                <div className="hd-pop-list">
                  {notifications.length === 0 ? (
                    <div className="hd-pop-empty">
                      {t('header_no_notifications')}
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`hd-notif-row${item.unread ? ' is-unread' : ''}`}
                      >
                        <div className="hd-notif-icon">{getCategoryIcon(item.category)}</div>
                        <div className="hd-notif-body">
                          <div className="hd-notif-top">
                            <p className={`hd-notif-title${item.unread ? ' is-unread' : ''}`}>
                              {item.title}
                            </p>
                            <span className="hd-notif-time">
                              {item.time}
                            </span>
                          </div>
                          <p className="hd-notif-sub">
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
                  className="hd-pop-foot"
                >
                  {t('header_view_all')}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Language Selector */}
        <div className="hd-pop-wrap">
          <button
            onClick={() => {
              setLangMenuOpen(!langMenuOpen);
              setNotifMenuOpen(false);
            }}
            aria-label={t('header_aria_language')}
            className={`hd-icon-btn${langMenuOpen ? ' is-open' : ''}`}
          >
            <Globe size={18} />
          </button>

          {langMenuOpen && (
            <>
              <div
                className="hd-pop-overlay"
                onClick={() => setLangMenuOpen(false)}
              />
              <div className="hd-pop hd-pop--sm">
                {([
                  { code: 'en', name: 'English' },
                  { code: 'ar', name: 'العربية' },
                  { code: 'he', name: 'עברית' },
                ] as const).map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => {
                      setLanguage(opt.code);
                      setLangMenuOpen(false);
                    }}
                    className={`hd-lang-opt${language === opt.code ? ' is-active' : ''}`}
                  >
                    <span>{opt.name}</span>
                    {language === opt.code && <Check size={14} />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Settings shortcut (relocated from sidebar footer) */}
        <button
          onClick={() => {
            setLangMenuOpen(false);
            setNotifMenuOpen(false);
            navigate('settings');
          }}
          aria-label={t('nav_settings') || 'Settings'}
          title={t('nav_settings') || 'Settings'}
          className={`hd-icon-btn${currentPage === 'settings' ? ' is-active' : ''}`}
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};
export default Header;
