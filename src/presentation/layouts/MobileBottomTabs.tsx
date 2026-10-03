import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation, PageKey } from '../context/NavigationContext';
import { useSidebarCounts } from '../hooks/useSidebarCounts';
import { LayoutDashboard, Activity, ShieldCheck, CheckSquare, Menu } from 'lucide-react';
import './layouts.css';

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
    <nav className="mobile-bottom-tabs mtabs">
      {tabItems.map((tab) => {
        const isActive = currentPage === tab.pageKey;
        return (
          <button
            key={tab.pageKey}
            type="button"
            onClick={() => navigate(tab.pageKey)}
            className={`mtabs__btn${isActive ? ' is-active' : ''}`}
          >
            {isActive && <span className="mtabs__bar" />}
            <div className="mtabs__iconwrap">
              {tab.icon}
              {tab.hasDot && <span className="mtabs__dot" />}
              {tab.badge && <span className="mtabs__badge">{tab.badge}</span>}
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}

      {/* "More" button to trigger full sidebar drawer */}
      <button type="button" onClick={onOpenSidebar} className="mtabs__btn">
        <Menu size={20} />
        <span>{t('tabs_more')}</span>
      </button>
    </nav>
  );
};
export default MobileBottomTabs;
