import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation, PageKey } from '../context/NavigationContext';
import { useSidebarCounts } from '../hooks/useSidebarCounts';
import { LayoutDashboard, CheckSquare, Receipt, MessageSquare, Menu } from 'lucide-react';
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
      label: t('nav_overview'),
      icon: <LayoutDashboard size={20} />,
    },
    {
      pageKey: 'tasks' as PageKey,
      label: t('nav_tasks'),
      icon: <CheckSquare size={20} />,
      badge: counts && counts.disputes > 0 ? (counts.disputes > 99 ? '99+' : String(counts.disputes)) : undefined,
    },
    {
      pageKey: 'billing' as PageKey,
      label: t('nav_billing'),
      icon: <Receipt size={20} />,
      badge: counts && counts.billing > 0 ? (counts.billing > 99 ? '99+' : String(counts.billing)) : undefined,
    },
    {
      pageKey: 'chat' as PageKey,
      label: t('nav_chat'),
      icon: <MessageSquare size={20} />,
    },
  ];

  return (
    <nav className="mobile-bottom-tabs mtabs" aria-label="Mobile Navigation">
      {tabItems.map((tab) => {
        const isActive = currentPage === tab.pageKey;
        return (
          <button
            key={tab.pageKey}
            type="button"
            onClick={() => navigate(tab.pageKey)}
            className={`mtabs__btn${isActive ? ' is-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {isActive && <span className="mtabs__bar" />}
            <div className="mtabs__iconwrap">
              {tab.icon}
              {tab.badge && <span className="mtabs__badge">{tab.badge}</span>}
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}

      {/* "More" button to trigger full sidebar drawer */}
      <button type="button" onClick={onOpenSidebar} className="mtabs__btn" aria-label={t('tabs_more')}>
        <div className="mtabs__iconwrap">
          <Menu size={20} />
        </div>
        <span>{t('tabs_more')}</span>
      </button>
    </nav>
  );
};

export default MobileBottomTabs;
