import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '../context/NavigationContext';
import { useSidebarCounts } from '../hooks/useSidebarCounts';
import { SidebarNav } from './SidebarNav';
import { SidebarFooter } from './SidebarFooter';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import './layouts.css';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isRtl, t } = useLanguage();
  const { currentPage, navigate } = useNavigation();
  const { data: counts } = useSidebarCounts();

  // Desktop collapsible rail (persisted).
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
      // storage unavailable
    }
    document.body.classList.toggle('has-collapsed-sidebar', collapsed);
    return () => {
      document.body.classList.remove('has-collapsed-sidebar');
    };
  }, [collapsed]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => !prev);
  };

  const CollapseIcon = collapsed
    ? (isRtl ? ChevronsLeft : ChevronsRight)
    : (isRtl ? ChevronsRight : ChevronsLeft);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${isOpen ? 'is-open' : ''} ${collapsed ? 'is-collapsed' : ''}`}
        aria-label={t('nav_sidebar_aria') || 'Sidebar navigation'}
      >
        {/* Brand / Logo Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand__logo-box">
              <img
                src="/arox-icon.svg"
                alt={t('brand_logo') || 'Arox Logo'}
                className="sidebar-brand__logo"
              />
            </div>
            {!collapsed && (
              <div className="sidebar-brand__text">
                <span className="sidebar-brand__title">AROX</span>
                <span className="sidebar-brand__subtitle">{t('brand_operations') || 'Operations'}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleCollapsed}
            className="sidebar-collapse-toggle"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <CollapseIcon size={16} />
          </button>
        </div>

        {/* Scrollable Navigation Sections */}
        <div className="sidebar-scrollable-content">
          <SidebarNav
            currentPage={currentPage}
            onNavigate={navigate}
            counts={counts}
            collapsed={collapsed}
            onCloseMobile={onClose}
          />
        </div>

        {/* Bottom User / Theme / Lang Footer */}
        <SidebarFooter collapsed={collapsed} />
      </aside>
    </>
  );
};

export default Sidebar;
