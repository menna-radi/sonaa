import React, { useState, useEffect } from 'react';
import { useLanguage, type Language } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme, type Theme } from '../context/ThemeContext';
import { useNavigation, PageKey } from '../context/NavigationContext';
import { useSidebarCounts } from '../hooks/useSidebarCounts';
import './layouts.css';
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
  Percent,
  Check,
  Wrench,
  ChevronDown,
  Globe,
  Sun,
  Moon,
  Laptop,
  LogOut,
  MessageSquare,
  ChevronsLeft,
  UserCog,
  ChevronsRight,
  Receipt,
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
  /** Extra page keys that mark this item active (legacy aliases). */
  match?: PageKey[];
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
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  // Desktop collapsible rail (persisted). Drawer behavior on mobile/tablet untouched.
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sidebar-collapsed') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sidebar-collapsed', collapsed ? '1' : '0');
    } catch {
      // storage unavailable — collapse still works for the session
    }
    document.body.classList.toggle('has-collapsed-sidebar', collapsed);
    return () => {
      document.body.classList.remove('has-collapsed-sidebar');
    };
  }, [collapsed]);

  const languageOptions = [
    { key: 'en', label: 'English', code: 'EN' },
    { key: 'ar', label: 'العربية', code: 'AR' },
    { key: 'he', label: 'עברית', code: 'HE' },
  ];
  const activeLanguage = languageOptions.find((o) => o.key === language) ?? languageOptions[0];

  const themeOptions = [
    { key: 'system', label: 'System', icon: <Laptop size={14} /> },
    { key: 'light', label: 'Light', icon: <Sun size={14} /> },
    { key: 'dark', label: 'Dark', icon: <Moon size={14} /> },
  ];
  const activeTheme = themeOptions.find((o) => o.key === theme) ?? themeOptions[0];

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
          key: 'nav_users',
          pageKey: 'users',
          label: t('nav_users') || 'Users',
          icon: <UserCog size={16} />,
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
      titleKey: 'sec_money',
      titleDefault: 'Money',
      items: [
        {
          key: 'nav_billing',
          pageKey: 'billing',
          label: t('nav_billing'),
          icon: <Receipt size={16} />,
          badge: counts && counts.billing > 0 ? String(counts.billing) : undefined,
        },
        {
          key: 'nav_payments',
          pageKey: 'payments',
          label: t('nav_payments'),
          icon: <DollarSign size={16} />,
          badge: counts && counts.payments > 0 ? String(counts.payments) : undefined,
        },
      ],
    },
    {
      titleKey: 'sec_growth',
      titleDefault: 'Growth',
      items: [
        {
          key: 'nav_offers',
          pageKey: 'promotions',
          label: t('nav_offers'),
          icon: <Percent size={16} />,
        },
        {
          key: 'nav_campaigns',
          pageKey: 'campaigns',
          label: t('nav_campaigns'),
          icon: <Megaphone size={16} />,
          match: ['scheduled', 'expired', 'ads', 'ad_analytics', 'create_ad'],
        },
        {
          key: 'nav_broadcast',
          pageKey: 'broadcast',
          label: t('nav_broadcast') || 'Broadcast',
          icon: <Radio size={16} />,
        },
      ],
    },
    {
      titleKey: 'sec_insights',
      titleDefault: 'Insights',
      items: [
        {
          key: 'nav_analytics',
          pageKey: 'analytics',
          label: t('nav_analytics') || 'Analytics',
          icon: <BarChart3 size={16} />,
        },
        {
          key: 'nav_notifications',
          pageKey: 'notifications',
          label: t('nav_notifications') || 'Notifications',
          icon: <Bell size={16} />,
          badge: counts && counts.notifications > 0 ? String(counts.notifications) : undefined,
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
      <aside className={`sidebar ${isOpen ? 'open' : ''} ${collapsed ? 'is-collapsed' : ''}`}>
        {/* Edge collapse handle — rides the sidebar border */}
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? t('sidebar_expand') : t('sidebar_collapse')}
          title={collapsed ? t('sidebar_expand') : t('sidebar_collapse')}
          className="sidebar-collapse-btn"
        >
          {(isRtl ? !collapsed : collapsed) ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
        </button>
        {/* Brand Block */}
        <div className="sidebar-brand sb-brand">
          <div className="sb-brand__logo">
            <img src="/arox-icon.svg" alt="Arox Logo" />
          </div>
          <div className="sidebar-brand-text sb-brand__text">
            <span className="sb-brand__name">
              Arox Admin
            </span>
            <span className="sb-brand__sub">
              Admin Console
            </span>
          </div>
        </div>

        {/* Scrollable Nav Items */}
        <div className="sidebar-scrollable-body sb-body">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="sidebar-section sb-section">
              <span className="sidebar-section-title sb-section__title">
                {t(section.titleKey) || section.titleDefault}
              </span>
              <ul className="sb-list">
                {section.items.map((item) => {
                  const isActive = currentPage === item.pageKey || (item.match ?? []).includes(currentPage);
                  const isLive = item.badge === 'LIVE';

                  return (
                    <li key={item.key}>
                      <a
                        href={`#${item.pageKey}`}
                        title={collapsed ? undefined : item.label}
                        data-label={item.label}
                        className={`sidebar-nav-item sb-link${isActive ? ' active is-active' : ''}`}
                        onClick={(e) => handleNavClick(e, item.pageKey)}
                      >
                        <div className="sb-link__main">
                          <span className="sb-link__icon">{item.icon}</span>
                          <span className="sidebar-item-label">{item.label}</span>
                        </div>

                        {item.badge &&
                          (isLive ? (
                            <span className="sidebar-item-badge sb-live">
                              <span className="sb-live__dot" />
                              <span className="sidebar-item-label">LIVE</span>
                            </span>
                          ) : (
                            <span className="sidebar-item-badge sb-badge">
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

        {/* Footer: User Profile with Popover */}
        <div className="sidebar-footer sb-footer">
          {/* User Row with Chevron Menu */}
          {user && (
            <div
              onClick={() => {
                setUserMenuOpen((prev) => {
                  if (!prev) {
                    setThemeMenuOpen(false);
                    setLangMenuOpen(false);
                  }
                  return !prev;
                });
              }}
              className="sidebar-user-row sb-user-row"
            >
              <div className="sb-user-main">
                <div className="sb-avatar">
                  {getInitials(user.name || user.email)}
                </div>
                <div className="sidebar-item-label sidebar-user-details sb-user-meta">
                  <span className="sb-user-name">
                    {user.name || 'Admin'}
                  </span>
                  <span className="sb-user-role">
                    {user.role || 'Super Admin'}
                  </span>
                </div>
              </div>
              <ChevronDown
                size={14}
                className={`sidebar-user-chevron sb-chevron${userMenuOpen ? ' is-open' : ''}`}
              />
            </div>
          )}

          {/* User Popover Menu */}
          {userMenuOpen && (
            <>
              <div className="sb-overlay" onClick={() => setUserMenuOpen(false)} />
              <div className="sidebar-user-popover sb-pop">
                {/* Language selection (dropdown list) */}
                <div className="sb-pop__group-label">
                  {t('language') || 'Language'}
                </div>
                <div className="sb-pop__select-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setLangMenuOpen((prev) => !prev);
                      setThemeMenuOpen(false);
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={langMenuOpen}
                    className="sb-select-btn"
                  >
                    <span className="sb-select-btn__label">
                      <Globe size={14} className="sb-faint-icon" />
                      <span>{activeLanguage.label}</span>
                    </span>
                    <ChevronDown
                      size={13}
                      className={`sb-chevron${langMenuOpen ? ' is-open' : ''}`}
                    />
                  </button>

                  {langMenuOpen && (
                    <div role="listbox" aria-label={t('language') || 'Language'} className="sb-listbox">
                      {languageOptions.map((opt) => {
                        const isActive = language === opt.key;
                        return (
                          <button
                            key={opt.key}
                            role="option"
                            aria-selected={isActive}
                            onClick={() => {
                              setLanguage(opt.key as Language);
                              setLangMenuOpen(false);
                            }}
                            className={`sb-opt${isActive ? ' is-active' : ''}`}
                          >
                            <span>{opt.label}</span>
                            <span className="sb-opt__meta">
                              <span className="sb-opt__code">
                                {opt.code}
                              </span>
                              {isActive && <Check size={13} />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Theme selection (dropdown list) */}
                <div className="sb-pop__group-label">
                  {t('sidebar_theme')}
                </div>
                <div className="sb-pop__select-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setThemeMenuOpen((prev) => !prev);
                      setLangMenuOpen(false);
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={themeMenuOpen}
                    className="sb-select-btn"
                  >
                    <span className="sb-select-btn__label">
                      {activeTheme.icon}
                      <span>{activeTheme.label}</span>
                    </span>
                    <ChevronDown
                      size={13}
                      className={`sb-chevron${themeMenuOpen ? ' is-open' : ''}`}
                    />
                  </button>

                  {themeMenuOpen && (
                    <div role="listbox" aria-label={t('sidebar_theme')} className="sb-listbox">
                      {themeOptions.map((tOption) => {
                        const isActive = theme === tOption.key;
                        return (
                          <button
                            key={tOption.key}
                            role="option"
                            aria-selected={isActive}
                            onClick={() => {
                              setTheme(tOption.key as Theme);
                              setThemeMenuOpen(false);
                            }}
                            className={`sb-opt${isActive ? ' is-active' : ''}`}
                          >
                            <span className="sb-opt__meta">
                              {tOption.icon}
                              <span>{tOption.label}</span>
                            </span>
                            {isActive && <Check size={13} />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="sb-divider" />

                {/* Logout */}
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="sb-logout"
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
