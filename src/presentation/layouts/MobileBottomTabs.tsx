import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation, PageKey } from '../context/NavigationContext';
import { useSidebarCounts } from '../hooks/useSidebarCounts';
import { LayoutDashboard, Activity, ShieldCheck, CheckSquare, Menu } from 'lucide-react';

interface MobileBottomTabsProps {
  onOpenSidebar?: () => void;
}

export const MobileBottomTabs: React.FC<MobileBottomTabsProps> = ({ onOpenSidebar }) => {
  const { t } = useLanguage();
  const { currentPage, navigate } = useNavigation();
  const { data: counts } = useSidebarCounts();

  const tabItems = [
    {
      pageKey: 'overview' as PageKey,
      label: t('tab_overview') || 'Overview',
      icon: <LayoutDashboard size={20} />,
    },
    {
      pageKey: 'live_activity' as PageKey,
      label: t('tab_activity') || 'Live',
      icon: <Activity size={20} />,
      hasDot: true,
    },
    {
      pageKey: 'verification' as PageKey,
      label: t('tab_verify') || 'Verify',
      icon: <ShieldCheck size={20} />,
      badge: counts && counts.verification > 0 ? String(counts.verification) : undefined,
    },
    {
      pageKey: 'tasks' as PageKey,
      label: t('tab_tasks') || 'Tasks',
      icon: <CheckSquare size={20} />,
    },
  ];

  return (
    <nav
      className="mobile-bottom-tabs"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backgroundColor: 'var(--surface-card)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 95,
      }}
    >
      {tabItems.map((tab) => {
        const isActive = currentPage === tab.pageKey;
        return (
          <button
            key={tab.pageKey}
            type="button"
            onClick={() => navigate(tab.pageKey)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              color: isActive ? 'var(--text-strong)' : 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: isActive ? 600 : 500,
              flex: 1,
              height: '100%',
              gap: 2,
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  width: 24,
                  height: 2,
                  backgroundColor: 'var(--text-strong)',
                  borderRadius: 'var(--radius-full)',
                }}
              />
            )}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              {tab.icon}
              {tab.hasDot && (
                <span
                  style={{
                    position: 'absolute',
                    top: -2,
                    insetInlineEnd: -2,
                    width: 6,
                    height: 6,
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--live)',
                  }}
                />
              )}
              {tab.badge && (
                <span
                  style={{
                    position: 'absolute',
                    top: -6,
                    insetInlineEnd: -10,
                    backgroundColor: 'var(--surface-inverse)',
                    color: 'var(--on-inverse)',
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 'var(--radius-full)',
                    padding: '1px 5px',
                    minWidth: 16,
                    textAlign: 'center',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}

      {/* "More" button to trigger full sidebar drawer */}
      <button
        type="button"
        onClick={onOpenSidebar}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: '11px',
          fontWeight: 500,
          flex: 1,
          height: '100%',
          gap: 2,
          cursor: 'pointer',
        }}
      >
        <Menu size={20} />
        <span>More</span>
      </button>
    </nav>
  );
};
export default MobileBottomTabs;
