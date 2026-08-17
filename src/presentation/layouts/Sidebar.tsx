import React, { useState, useRef, useLayoutEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import type { PageKey } from '../context/NavigationContext';
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
  MessageSquare
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

// Module-level variable — survives Sidebar re-mounts between navigations
let _sidebarScrollTop = 0;

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t, language, setLanguage, isRtl } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { user } = useAuth();
  const { currentPage, navigate } = useNavigation();

  // ── Persist sidebar scroll position across page navigations ──
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore saved scroll position after every render (before browser paint)
  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = _sidebarScrollTop;
    }
  });

  const handleSidebarScroll = () => {
    if (scrollRef.current) {
      _sidebarScrollTop = scrollRef.current.scrollTop;
    }
  };

  const menuSections: MenuSection[] = [
    {
      titleKey: 'sec_operations',
      titleDefault: 'Operations',
      items: [
        { key: 'nav_overview', pageKey: 'overview', label: t('sidebar_dashboard') || 'Overview', icon: <LayoutDashboard size={16} /> },
        { key: 'nav_live_activity', pageKey: 'live_activity', label: t('nav_live_activity') || 'Live Activity', icon: <Activity size={16} />, badge: 'LIVE', isPulse: true },
      ]
    },
    {
      titleKey: 'sec_manage',
      titleDefault: 'Manage',
      items: [
        { key: 'nav_craftsmen', pageKey: 'craftsmen', label: t('nav_craftsmen') || 'Craftsmen', icon: <Users size={16} /> },
        { key: 'nav_tasks', pageKey: 'tasks', label: t('nav_tasks') || 'Tasks', icon: <CheckSquare size={16} /> },
        { key: 'nav_chat', pageKey: 'chat', label: t('nav_chat') || 'Live Support & Chat', icon: <MessageSquare size={16} />, badge: 'LIVE', isPulse: true },
        { key: 'nav_verification', pageKey: 'verification', label: t('nav_verification') || 'Verification', icon: <ShieldCheck size={16} />, badge: '129' },
        { key: 'nav_reports', pageKey: 'reports', label: t('nav_reports') || 'Reports', icon: <FileText size={16} />, badge: '42' },
      ]
    },
    {
      titleKey: 'sec_insights',
      titleDefault: 'Insights',
      items: [
        { key: 'nav_payments', pageKey: 'payments', label: t('nav_payments') || 'Payments', icon: <DollarSign size={16} /> },
        { key: 'nav_analytics', pageKey: 'analytics', label: t('nav_analytics') || 'Analytics', icon: <BarChart3 size={16} /> },
        { key: 'nav_broadcast', pageKey: 'broadcast', label: t('nav_broadcast') || 'Broadcast', icon: <Radio size={16} /> },
        { key: 'nav_notifications', pageKey: 'notifications', label: t('nav_notifications') || 'Notifications', icon: <Bell size={16} />, badge: '7' },
        { key: 'nav_ads', pageKey: 'ads', label: t('nav_ads') || 'Ads Dashboard', icon: <Megaphone size={16} /> },
        { key: 'nav_campaigns', pageKey: 'campaigns', label: t('nav_campaigns') || 'Active Campaigns', icon: <Compass size={16} /> },
        { key: 'nav_scheduled', pageKey: 'scheduled', label: t('nav_scheduled') || 'Scheduled', icon: <Calendar size={16} /> },
        { key: 'nav_expired', pageKey: 'expired', label: t('nav_expired') || 'Expired', icon: <Clock size={16} /> },
        { key: 'nav_promotions', pageKey: 'promotions', label: t('nav_promotions') || 'Craftsman Promotions', icon: <Percent size={16} /> },
        { key: 'nav_ad_analytics', pageKey: 'ad_analytics', label: t('nav_ad_analytics') || 'Ad Analytics', icon: <TrendingUp size={16} /> },
        { key: 'nav_service_management', pageKey: 'service_management', label: t('nav_service_management') || 'Service Management', icon: <Wrench size={16} /> },
      ]
    }
  ];

  const handleNavClick = (e: React.MouseEvent, pageKey: PageKey) => {
    e.preventDefault();
    navigate(pageKey);
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div className="sidebar-backdrop" onClick={onClose} />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand flex-between" style={{ padding: 'var(--spacing-md)', height: 'var(--header-height)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/sonaa logo.svg"
              alt="Sonaa Logo"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '7px',
                flexShrink: 0
              }}
            />
            <div className="sidebar-brand-text" style={{ display: 'flex', flexDirection: 'column', textAlign: 'start' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff', lineHeight: 1.1 }}>
                Sonaa
              </span>
              <span style={{ fontSize: '0.65rem', color: '#a3a3a3', fontWeight: 500 }}>
                Admin Console
              </span>
            </div>
          </div>
        </div>

        {/* Nav List - Scrollable */}
        <div
          ref={scrollRef}
          onScroll={handleSidebarScroll}
          className="sidebar-scrollable-body"
          style={{ flexGrow: 1, padding: 'var(--spacing-md)', overflowY: 'auto' }}
        >
          {menuSections.map((section, idx) => (
            <div key={idx} style={{ marginBottom: 'var(--spacing-lg)' }} className="sidebar-section">
              <span className="sidebar-section-title" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#737373', letterSpacing: '0.05em', marginBottom: '8px' }}>
                {t(section.titleKey) || section.titleDefault}
              </span>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {section.items.map((item, itemIdx) => {
                  const isActive = currentPage === item.pageKey;
                  const isLive = item.badge === 'LIVE';
                  return (
                    <li key={itemIdx}>
                      <a
                        href={`#${item.pageKey}`}
                        className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: 'var(--border-radius-sm)',
                          fontSize: '0.875rem',
                          fontWeight: isActive ? 600 : 500,
                          transition: 'var(--transition-fast)',
                          textDecoration: 'none',
                        }}
                        onClick={(e) => handleNavClick(e, item.pageKey)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span>
                            {item.icon}
                          </span>
                          <span className="sidebar-item-label">{item.label}</span>
                        </div>
                        {item.badge && (
                          isLive ? (
                            <span style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'rgba(239,68,68,0.2)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              flexShrink: 0,
                            }}>
                              <span style={{
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                background: '#f87171',
                                opacity: 0.8,
                                flexShrink: 0,
                                animation: 'livePulse 1.5s ease-in-out infinite',
                              }} />
                              <span style={{
                                fontSize: '8px',
                                fontWeight: 700,
                                color: '#f87171',
                                letterSpacing: '0.4px',
                              }}>LIVE</span>
                            </span>
                          ) : (
                            <span className="sidebar-item-badge" style={{
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'rgba(255,255,255,0.08)',
                              color: '#a3a3a3',
                              border: '1px solid #1f1f23',
                            }}>
                              {item.badge}
                            </span>
                          )
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Sidebar Footer User detail card */}
        {user && (
          <div className="sidebar-footer" style={{ padding: 'var(--spacing-md)' }}>
            {/* Footer Actions Row */}
            <div className="sidebar-footer-actions-row" style={{ marginBottom: 'var(--spacing-sm)' }}>
              {/* Settings button */}
              <a
                href="#settings"
                title={t('nav_settings') || 'Settings'}
                className={`sidebar-nav-item sidebar-settings-link ${currentPage === 'settings' ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
                onClick={(e) => handleNavClick(e, 'settings')}
              >
                <Settings size={18} />
                <span className="sidebar-item-label">{t('nav_settings') || 'Settings'}</span>
              </a>

              {/* Language Selector Popover Trigger */}
              <div style={{ position: 'relative' }} className="sidebar-lang-selector">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--border-radius-sm)',
                    color: '#a3a3a3',
                    background: langMenuOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
                    cursor: 'pointer',
                    border: 'none',
                    outline: 'none',
                    transition: 'background var(--transition-fast)',
                  }}
                  className="sidebar-nav-item"
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
                      bottom: '44px',
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
                              setLanguage(langOption.code);
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

            {/* User profile capsule */}
            <div 
              className="user-profile-capsule" 
              onClick={() => {
                localStorage.setItem('settings_active_tab', 'roles');
                navigate('settings');
                onClose();
              }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '8px', 
                background: '#1c1c1f', 
                borderRadius: 'var(--border-radius-sm)', 
                border: '1px solid #27272a',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={user.avatarUrl} alt={user.name} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #27272a' }} />
                <div className="sidebar-user-details" style={{ display: 'flex', flexDirection: 'column', textAlign: 'start' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>{user.name} Admin</span>
                  <span style={{ fontSize: '0.7rem', color: '#a3a3a3' }}>Operations Lead</span>
                </div>
              </div>
              <ChevronDown size={14} className="sidebar-user-chevron" style={{ color: '#a3a3a3', marginInlineStart: 'auto' }} />
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
export default Sidebar;

