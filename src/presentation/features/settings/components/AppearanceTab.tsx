import React from 'react';
import { Sun, Moon, Monitor, CheckCircle2 } from 'lucide-react';
import { useLanguage, type Language } from '../../../context/LanguageContext';
import { useTheme, type Theme } from '../../../context/ThemeContext';
import { Card, Segmented, StatusPill } from '../../../components/ui';

const THEMES: Array<{ id: Theme; icon: React.ReactNode }> = [
  { id: 'system', icon: <Monitor size={24} /> },
  { id: 'light', icon: <Sun size={24} /> },
  { id: 'dark', icon: <Moon size={24} /> },
];

const LANGUAGES: Language[] = ['en', 'ar', 'he'];

export const AppearanceTab: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, actualTheme, setTheme } = useTheme();

  return (
    <div className="ui-stack">
      <Card
        eyebrow={t('settings_tab_appearance')}
        title={t('settings_appearance_theme_title')}
        subtitle={t('settings_appearance_theme_subtitle')}
      >
        <div className="ui-grid-auto">
          {THEMES.map((opt) => {
            const selected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={selected}
                className={`settings-theme${selected ? ' settings-theme--selected' : ''}`}
                onClick={() => setTheme(opt.id)}
              >
                <span className="ui-row ui-row--between">
                  <span className="settings-theme__icon">{opt.icon}</span>
                  {selected && <CheckCircle2 size={20} className="settings-theme__check" />}
                </span>
                <span className="ui-text-strong">{t(`settings_theme_${opt.id}`)}</span>
                <span className="ui-caption">{t(`settings_theme_${opt.id}_desc`)}</span>
                {opt.id === 'system' && (
                  <StatusPill
                    variant="neutral"
                    label={`${t('settings_theme_resolved')}: ${t(`settings_theme_${actualTheme}`)}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </Card>
      <Card title={t('settings_appearance_language_title')} subtitle={t('settings_appearance_language_subtitle')}>
        <Segmented
          value={language}
          onChange={(v) => setLanguage(v as Language)}
          items={LANGUAGES.map((l) => ({ value: l, label: t(`settings_lang_${l}`) }))}
        />
      </Card>
    </div>
  );
};

export default AppearanceTab;
