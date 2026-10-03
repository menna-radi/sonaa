import React, { useState } from 'react';
import { useLanguage, type Language } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme, type Theme } from '../context/ThemeContext';
import {
  Globe,
  Sun,
  Moon,
  Laptop,
  LogOut,
  ChevronDown,
  Check,
} from 'lucide-react';

export interface SidebarFooterProps {
  collapsed?: boolean;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({ collapsed = false }) => {
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const languageOptions = [
    { key: 'en', label: 'English', code: 'EN' },
    { key: 'ar', label: 'العربية', code: 'AR' },
    { key: 'he', label: 'עברית', code: 'HE' },
  ];
  const activeLanguage = languageOptions.find((o) => o.key === language) ?? languageOptions[0];

  const themeOptions = [
    { key: 'system', label: t('settings_theme_system') || 'System', icon: <Laptop size={14} /> },
    { key: 'light', label: t('settings_theme_light') || 'Light', icon: <Sun size={14} /> },
    { key: 'dark', label: t('settings_theme_dark') || 'Dark', icon: <Moon size={14} /> },
  ];
  const activeTheme = themeOptions.find((o) => o.key === theme) ?? themeOptions[0];

  const getInitials = (name?: string | null): string => {
    if (!name) return 'A';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (!user) return null;

  return (
    <div className="sidebar-footer sb-footer">
      {/* User Row with Chevron Menu */}
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
        title={collapsed ? (user.name || 'Admin') : undefined}
      >
        <div className="sb-user-main">
          <div className="sb-avatar">
            {getInitials(user.name || user.email)}
          </div>
          {!collapsed && (
            <div className="sidebar-item-label sidebar-user-details sb-user-meta">
              <span className="sb-user-name">
                {user.name || 'Admin'}
              </span>
              <span className="sb-user-role">
                {user.role || 'Super Admin'}
              </span>
            </div>
          )}
        </div>
        {!collapsed && (
          <ChevronDown
            size={14}
            className={`sidebar-user-chevron sb-chevron${userMenuOpen ? ' is-open' : ''}`}
          />
        )}
      </div>

      {/* User Popover Menu */}
      {userMenuOpen && (
        <>
          <div className="sb-overlay" onClick={() => setUserMenuOpen(false)} />
          <div className="sidebar-user-popover sb-pop">
            {/* Language selection */}
            <div className="sb-pop__group-label">
              {t('language')}
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
                <div role="listbox" aria-label={t('language')} className="sb-listbox">
                  {languageOptions.map((opt) => {
                    const isActive = language === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
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

            {/* Theme selection */}
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
                        type="button"
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
              type="button"
              onClick={() => {
                setUserMenuOpen(false);
                logout();
              }}
              className="sb-logout"
            >
              <LogOut size={14} />
              <span>{t('btn_logout')}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SidebarFooter;
