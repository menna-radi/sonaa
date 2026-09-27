import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme, Theme } from '../../../context/ThemeContext';
import { Card, StatusPill } from '../../../components/ui';
import { Sun, Moon, Monitor, CheckCircle2 } from 'lucide-react';

export const AppearanceTab: React.FC = () => {
  const { isRtl } = useLanguage();
  const { theme, actualTheme, setTheme } = useTheme();

  const options: Array<{
    id: Theme;
    titleEn: string;
    titleAr: string;
    descEn: string;
    descAr: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'system',
      titleEn: 'System Default',
      titleAr: 'تلقائي حسب النظام',
      descEn: 'Automatically adapts to your operating system preference.',
      descAr: 'يتكيف المظهر تلقائياً مع إعدادات نظام التشغيل في جهازك.',
      icon: <Monitor size={24} />,
    },
    {
      id: 'light',
      titleEn: 'Light Mode',
      titleAr: 'الوضع النهاري',
      descEn: 'Crisp white surfaces, high contrast typography, neutral greys.',
      descAr: 'بطاقات بيضاء ناصعة، خطوط شديدة الوضوح، ومساحات رمادية مريحة.',
      icon: <Sun size={24} />,
    },
    {
      id: 'dark',
      titleEn: 'Dark Mode',
      titleAr: 'الوضع الليلي',
      descEn: 'Deep charcoal background, reduced eye strain, refined borders.',
      descAr: 'خلفية رمادية داكنة تقلل إجهاد العين مع حدود مصقولة عالية التباين.',
      icon: <Moon size={24} />,
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 'var(--sp-4)' }}>
        <h3 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--on-surface)' }}>
          {isRtl ? 'المظهر والسمة البصرية' : 'Appearance & Theme'}
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--font-xs)', color: 'var(--on-surface-subtle)' }}>
          {isRtl
            ? 'تخصيص نمط لوحة التحكم (الوضع النهاري أو الليلي أو مطابقة النظام)'
            : 'Customize your dashboard interface style and system theme preference.'}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--sp-4)',
        }}
      >
        {options.map((opt) => {
          const isSelected = theme === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-3)',
                padding: 'var(--sp-4)',
                borderRadius: 'var(--radius-lg)',
                background: isSelected ? 'var(--surface-sunken)' : 'var(--surface-base)',
                border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-strong)';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'var(--primary)' : 'var(--surface-sunken)',
                    color: isSelected ? 'var(--on-primary)' : 'var(--on-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {opt.icon}
                </div>

                {isSelected && (
                  <CheckCircle2 size={20} style={{ color: 'var(--primary)' }} />
                )}
              </div>

              <div>
                <h4
                  style={{
                    margin: 0,
                    fontSize: 'var(--font-sm)',
                    fontWeight: 600,
                    color: 'var(--on-surface)',
                  }}
                >
                  {isRtl ? opt.titleAr : opt.titleEn}
                </h4>
                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: 'var(--font-xs)',
                    color: 'var(--on-surface-subtle)',
                    lineHeight: 'var(--line-height-normal)',
                  }}
                >
                  {isRtl ? opt.descAr : opt.descEn}
                </p>
              </div>

              {opt.id === 'system' && (
                <div style={{ marginTop: 'auto' }}>
                  <StatusPill
                    variant="neutral"
                    label={
                      isRtl
                        ? `السمة النشطة الحالية: ${actualTheme === 'dark' ? 'ليلي' : 'نهاري'}`
                        : `Currently resolved: ${actualTheme}`
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
