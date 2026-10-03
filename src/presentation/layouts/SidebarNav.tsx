import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { PageKey } from '../context/NavigationContext';
import type { SidebarCounts } from '../hooks/useSidebarCounts';
import { NAV_SECTIONS, CAMPAIGN_ALIASES, NavItemConfig } from './navConfig';

export interface SidebarNavProps {
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
  counts?: SidebarCounts;
  collapsed?: boolean;
  onCloseMobile?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentPage,
  onNavigate,
  counts,
  collapsed = false,
  onCloseMobile,
}) => {
  const { t } = useLanguage();

  const isItemActive = (item: NavItemConfig) => {
    if (item.pageKey === 'campaigns') {
      return CAMPAIGN_ALIASES.includes(currentPage);
    }
    return currentPage === item.pageKey;
  };

  const getBadge = (item: NavItemConfig) => {
    if (!item.badgeKey || !counts) return null;
    const count = counts[item.badgeKey];
    if (!count || count <= 0) return null;
    return count > 99 ? '99+' : String(count);
  };

  return (
    <nav className="ui-sidebar-nav" aria-label={t('nav_main_aria') || 'Main Navigation'}>
      {NAV_SECTIONS.map((section) => (
        <div key={section.titleKey} className="ui-sidebar-section">
          {!collapsed && (
            <div className="ui-sidebar-section__title">
              {t(section.titleKey)}
            </div>
          )}

          <div className="ui-sidebar-section__items">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item);
              const label = t(item.labelKey);
              const badge = getBadge(item);

              return (
                <button
                  key={item.pageKey}
                  type="button"
                  onClick={() => {
                    onNavigate(item.pageKey);
                    onCloseMobile?.();
                  }}
                  className={`ui-sidebar-item ${isActive ? 'is-active' : ''}`}
                  title={collapsed ? label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={18} className="ui-sidebar-item__icon" />
                  {!collapsed && <span className="ui-sidebar-item__label">{label}</span>}
                  {item.live && (
                    <span className="ui-sidebar-live" title={t('badge_live') || 'Live'}>
                      <span className="ui-sidebar-live__dot" />
                    </span>
                  )}
                  {badge && (
                    <span className={`ui-sidebar-badge ${collapsed ? 'ui-sidebar-badge--dot' : ''}`}>
                      {!collapsed && badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
};

export default SidebarNav;
