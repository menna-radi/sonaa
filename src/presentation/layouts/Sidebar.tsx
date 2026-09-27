import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, PageKey } from '../context/NavigationContext';
import { useSidebarCounts } from '../hooks/useSidebarCounts';
import {
  LayoutDashboard,
  Activity,
  Users,
  CheckSquare,
  ShieldCheck,
  FileText,
  DollarSign,
  BarChart3,
  Radio,
  Bell,
  Megaphone,
  Compass,
  Calendar,
  Clock,
  Percent,
  TrendingUp,
  Settings,
  Wrench,
  ChevronDown,
  Globe,
  Sun,
  Moon,
  Laptop,
  LogOut,
  MessageSquare,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  key: string;
  pageKey: PageKey;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  isPulse?: boolean;
}

interface MenuSection {
  titleKey: string;
  titleDefault: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t, language, setLanguage, isRtl } = useLanguage();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { currentPage, navigate } = useNavigation();
  const { data: counts } = useSidebarCounts();

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuSections: MenuSection[] = [
    {
      titleKey: 'sec_operations',
      titleDefault: 'Operations',
      items: [
        {
          key: 'nav_overview',
          pageKey: 'overview',
          label: t('sidebar_dashboard') || 'Overview',
          icon: <LayoutDashboard size={16} />,
        },
        {
          key: 'nav_live_activity',
          pageKey: 'live_activity',
          label: t('nav_live_activity') || 'Live Activity',
          icon: <Activity size={16} />,
          badge: 'LIVE',
          isPulse: true,
        },
      ],
    },
    {
      titleKey: 'sec_manage',
      titleDefault: 'Manage',
      items: [
        {
          key: 'nav_craftsmen',
          pageKey: 'craftsmen',
          label: t('nav_craftsmen') || 'Craftsmen',
          icon: <Users size={16} />,
        },
        {
          key: 'nav_tasks',
          pageKey: 'tasks',
          label: t('nav_tasks') || 'Tasks',
          icon: <CheckSquare size={16} />,
        },
        {
          key: 'nav_chat',
          pageKey: 'chat',
          label: t('nav_chat') || 'Live Support & Chat',
          icon: <MessageSquare size={16} />,
          badge: 'LIVE',
          isPulse: true,
        },
        {
          key: 'nav_verification',
          pageKey: 'verification',
          label: t('nav_verification') || 'Verification',
          icon: <ShieldCheck size={16} />,
          badge: counts && counts.verification > 0 ? String(counts.verification) : undefined,
        },
        {
          key: 'nav_reports',
          pageKey: 'reports',
          label: t('nav_reports') || 'Reports',
          icon: <FileText size={16} />,
          badge: counts && counts.reports > 0 ? String(counts.reports) : undefined,
        },
      ],
    },
    {
      titleKey: 'sec_insights',
      titleDefault: 'Insights',
      items: [
        {
          key: 'nav_payments',
          pageKey: 'payments',
          label: t('nav_payments') || 'Payments',
          icon: <DollarSign size={16} />,
          badge: counts && counts.payments > 0 ? String(counts.payments) : undefined,
        },
        {
          key: 'nav_analytics',
          pageKey: 'analytics',
          label: t('nav_analytics') || 'Analytics',
          icon: <BarChart3 size={16} />,
        },
        {
          key: 'nav_broadcast',
          pageKey: 'broadcast',
          label: t('nav_broadcast') || 'Broadcast',
          icon: <Radio size={16} />,
        },
        {
          key: 'nav_notifications',
          pageKey: 'notifications',
          label: t('nav_notifications') || 'Notifications',
          icon: <Bell size={16} />,
          badge: counts && counts.notifications > 0 ? String(counts.notifications) : undefined,
        },
        {
          key: 'nav_ads',
          pageKey: 'ads',
          label: t('nav_ads') || 'Ads Dashboard',
          icon: <Megaphone size={16} />,
        },
        {
          key: 'nav_campaigns',
          pageKey: 'campaigns',
          label: t('nav_campaigns') || 'Active Ads',
          icon: <Compass size={16} />,
        },
        {
          key: 'nav_scheduled',
          pageKey: 'scheduled',
          label: t('nav_scheduled') || 'Scheduled',
          icon: <Calendar size={16} />,
        },
        {
          key: 'nav_expired',
          pageKey: 'expired',
          label: t('nav_expired') || 'Expired',
          icon: <Clock size={16} />,
        },
        {
          key: 'nav_promotions',
          pageKey: 'promotions',
          label: t('nav_promotions') || 'Craftsman Promotions',
          icon: <Percent size={16} />,
        },
        {
          key: 'nav_ad_analytics',
          pageKey: 'ad_analytics',
          label: t('nav_ad_analytics') || 'Ad Analytics',
          icon: <TrendingUp size={16} />,
        },
        {
          key: 'nav_service_management',
          pageKey: 'service_management',
          label: t('nav_service_management') || 'Service Management',
          icon: <Wrench size={16} />,
        },
      ],
    },
  ];

  const handleNavClick = (e: React.MouseEvent, pageKey: PageKey) => {
    e.preventDefault();
    navigate(pageKey);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const getInitials = (n?: string | null) => {
    if (!n) return 'AD';
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Block */}
        <div
          className="sidebar-brand"
          style={{
            height: 'var(--topbar-h)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 var(--space-4)',
            borderBottom: '1px solid var(--sidebar-border)',
            gap: 'var(--space-3)',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#FFFFFF',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            A
          </div>
          <div
            className="sidebar-brand-text"
            style={{ display: 'flex', flexDirection: 'column', textAlign: 'start' }}
          >
            <span
              style={{
                fontWeight: 600,
                fontSize: 'var(--fs-body)',
                color: '#FFFFFF',
                lineHeight: 1.2,
              }}
            >
              Arox Admin
            </span>
            <span
              style={{
                fontSize: 'var(--fs-caption)',
                color: 'var(--sidebar-section)',
              }}
            >
              Admin Console
            </span>
          </div>
        </div>

        {/* Scrollable Nav Items */}
        <div
          className="sidebar-scrollable-body"
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: 'var(--space-4) var(--space-3)',
          }}
        >
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="sidebar-section" style={{ marginBottom: 'var(--space-5)' }}>
              <span
                className="sidebar-section-title"
                style={{
                  display: 'block',
                  fontSize: 'var(--fs-micro)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--sidebar-section)',
                  padding: '0 var(--space-3)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                {t(section.titleKey) || section.titleDefault}
              </span>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {section.items.map((item) => {
                  const isActive = currentPage === item.pageKey;
                  const isLive = item.badge === 'LIVE';

                  return (
                    <li key={item.key}>
                      <a
                        href={`#${item.pageKey}`}
                        title={item.label}
                        className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                        onClick={(e) => handleNavClick(e, item.pageKey)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          height: 36,
                          padding: '0 var(--space-3)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--fs-body)',
                          fontWeight: isActive ? 600 : 500,
                          backgroundColor: isActive
                            ? 'var(--sidebar-active-bg)'
                            : 'transparent',
                          color: isActive
                            ? 'var(--sidebar-active-text)'
                            : 'var(--sidebar-text)',
                          textDecoration: 'none',
                          transition: 'all var(--dur-fast) var(--ease)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                          <span className="sidebar-item-label">{item.label}</span>
                        </div>

                        {item.badge &&
                          (isLive ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                height: 18,
                                padding: '0 6px',
                                borderRadius: 4,
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                color: '#EF4444',
                                fontSize: 10,
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  backgroundColor: '#EF4444',
                                  animation: 'livePulse 1.5s ease-in-out infinite',
                                }}
                              />
                              <span className="sidebar-item-label">LIVE</span>
                            </span>
                          ) : (
                            <span
                              className="sidebar-item-badge"
                              style={{
                                minWidth: 22,
                                height: 20,
                                padding: '0 6px',
                                borderRadius: 6,
                                backgroundColor: 'var(--sidebar-badge-bg)',
                                color: 'var(--sidebar-badge-text)',
                                fontSize: 11,
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {item.badge}
                            </span>
                          ))}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer: Settings & User Profile with Popover */}
        <div
          className="sidebar-footer"
          style={{
            padding: 'var(--space-3)',
            borderTop: '1px solid var(--sidebar-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            position: 'relative',
          }}
        >
          {/* Settings link */}
          <a
            href="#settings"
            title={t('nav_settings') || 'Settings'}
            className={`sidebar-nav-item ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={(e) => handleNavClick(e, 'settings')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              height: 36,
              padding: '0 var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--fs-body)',
              fontWeight: currentPage === 'settings' ? 600 : 500,
              backgroundColor:
                currentPage === 'settings' ? 'var(--sidebar-active-bg)' : 'transparent',
              color:
                currentPage === 'settings'
                  ? 'var(--sidebar-active-text)'
                  : 'var(--sidebar-text)',
              textDecoration: 'none',
              transition: 'all var(--dur-fast) var(--ease)',
            }}
          >
            <Settings size={16} />
            <span className="sidebar-item-label">{t('nav_settings') || 'Settings'}</span>
          </a>

          {/* User Row with Chevron Menu */}
          {user && (
            <div
              onClick={() => setUserMenuOpen((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              className="sidebar-user-row"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--n-800)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  {getInitials(user.name || user.email)}
                </div>
                <div
                  className="sidebar-item-label"
                  style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#FFFFFF',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user.name || 'Admin'}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--sidebar-section)',
                    }}
                  >
                    {user.role || 'Super Admin'}
                  </span>
                </div>
              </div>
              <ChevronDown
                size={14}
                className="sidebar-item-label"
                style={{
                  color: 'var(--sidebar-text)',
                  transform: userMenuOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform var(--dur-fast) var(--ease)',
                }}
              />
            </div>
          )}

          {/* User Popover Menu */}
          {userMenuOpen && (
            <>
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  zIndex: 998,
                }}
                onClick={() => setUserMenuOpen(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  insetInlineStart: 'var(--space-3)',
                  insetInlineEnd: 'var(--space-3)',
                  backgroundColor: 'var(--n-900)',
                  border: '1px solid var(--n-800)',
                  borderRadius: 'var(--radius-md)',
                  padding: 6,
                  boxShadow: 'var(--shadow-modal)',
                  zIndex: 999,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                {/* Language selection */}
                <div style={{ padding: '4px 8px', fontSize: 11, fontWeight: 600, color: 'var(--n-400)', textTransform: 'uppercase' }}>
                  {t('language') || 'Language'}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['en', 'ar', 'he'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        fontSize: 12,
                        fontWeight: language === l ? 700 : 500,
                        backgroundColor: language === l ? '#FFFFFF' : 'var(--n-800)',
                        color: language === l ? '#000000' : 'var(--n-300)',
                        border: 'none',
                        borderRadius: 'var(--radius-xs)',
                        cursor: 'pointer',
                      }}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Theme selection */}
                <div style={{ padding: '8px 8px 4px', fontSize: 11, fontWeight: 600, color: 'var(--n-400)', textTransform: 'uppercase' }}>
                  Theme
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[
                    { key: 'system', icon: <Laptop size={12} /> },
                    { key: 'light', icon: <Sun size={12} /> },
                    { key: 'dark', icon: <Moon size={12} /> },
                  ].map((tOption) => (
                    <button
                      key={tOption.key}
                      onClick={() => setTheme(tOption.key as any)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        fontSize: 12,
                        fontWeight: theme === tOption.key ? 700 : 500,
                        backgroundColor: theme === tOption.key ? '#FFFFFF' : 'var(--n-800)',
                        color: theme === tOption.key ? '#000000' : 'var(--n-300)',
                        border: 'none',
                        borderRadius: 'var(--radius-xs)',
                        cursor: 'pointer',
                      }}
                    >
                      {tOption.icon}
                    </button>
                  ))}
                </div>

                <div style={{ height: 1, backgroundColor: 'var(--n-800)', margin: '4px 0' }} />

                {/* Logout */}
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px',
                    width: '100%',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--danger)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'start',
                  }}
                >
                  <LogOut size={14} />
                  <span>{t('btn_logout') || 'Log out'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
