import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '../context/NavigationContext';
import type { PageKey } from '../context/NavigationContext';
import { LayoutDashboard, Activity, ShieldCheck, CheckSquare, Bell } from 'lucide-react';

interface TabItem {
  pageKey: PageKey;
  label: string;
  icon: React.ReactNode;
  hasDot?: boolean;
  badge?: string;
}

export const MobileBottomTabs: React.FC = () => {
  const { t } = useLanguage();
  const { currentPage, navigate } = useNavigation();

  const tabItems: TabItem[] = [
    { pageKey: 'overview', label: t('tab_overview') || 'Overview', icon: <LayoutDashboard size={20} /> },
    { pageKey: 'live_activity', label: t('tab_activity') || 'Activity', icon: <Activity size={20} />, hasDot: true },
    { pageKey: 'verification', label: t('tab_verify') || 'Verify', icon: <ShieldCheck size={20} />, badge: '99' },
    { pageKey: 'tasks', label: t('tab_tasks') || 'Tasks', icon: <CheckSquare size={20} /> },
    { pageKey: 'notifications', label: t('tab_alerts') || 'Alerts', icon: <Bell size={20} />, badge: '7' },
  ];

  return (
    <nav className="mobile-bottom-tabs" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '76px',
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-color)',
      display: 'none', // Overridden in CSS for mobile views
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 95,
    }}>
      {tabItems.map((tab, idx) => {
        const isActive = currentPage === tab.pageKey;
        return (
          <a
            key={idx}
            href={`#${tab.pageKey}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: isActive ? 'var(--color-primary)' : 'var(--text-disabled)',
              fontSize: '0.65rem',
              fontWeight: isActive ? 600 : 500,
              position: 'relative',
              width: '20%',
              height: '100%',
              gap: '2px',
              transition: 'color 0.2s ease',
            }}
            onClick={(e) => {
              e.preventDefault();
              navigate(tab.pageKey);
            }}
          >
            {/* Active tab top indicator */}
            {isActive && (
              <span style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '24px',
                height: '2px',
                background: 'var(--color-primary)',
                borderRadius: '9999px'
              }} />
            )}
            {/* Icon wrapper for badges */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {tab.icon}

              {/* Red alert dot */}
              {tab.hasDot && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '6px',
                  height: '6px',
                  background: 'var(--color-danger)',
                  borderRadius: '50%'
                }} />
              )}

              {/* Dynamic counter badge */}
              {tab.badge && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-10px',
                  background: tab.pageKey === 'verification' ? '#171717' : 'var(--color-danger)',
                  color: '#FFFFFF',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  borderRadius: 'var(--border-radius-full)',
                  padding: '1px 5px',
                  minWidth: '14px',
                  textAlign: 'center'
                }}>
                  {tab.badge}
                </span>
              )}
            </div>

            <span>{tab.label}</span>
          </a>
        );
      })}
    </nav>
  );
};
export default MobileBottomTabs;
