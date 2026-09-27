import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { Dropdown } from '../../../components/ui/Dropdown';
import { formatNumber } from '../../../../core/utils/format';
import type { CategoryVolume } from '../../../../domain/repositories/MetricRepository';
import { MoreHorizontal } from 'lucide-react';

interface TopCategoriesProps {
  categories: CategoryVolume[];
}

export const TopCategories: React.FC<TopCategoriesProps> = ({ categories }) => {
  const { t, language } = useLanguage();
  const maxTasks = Math.max(...categories.map((c) => c.tasksCount), 1);

  const formatCategoryName = (key: string) => {
    const translated = t(key);
    if (translated && translated !== key) return translated;
    const clean = key.replace(/^cat_/, '').replace(/_/g, ' ');
    if (clean === 'ac tech') return 'AC Repair';
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  return (
    <Card
      eyebrow={t('sec_top_categories') || 'Top Categories'}
      title={t('sec_by_volume') || 'By volume'}
      actions={
        <Dropdown
          trigger={
            <button
              type="button"
              aria-label="Category options"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                display: 'flex',
                padding: 4,
                cursor: 'pointer',
              }}
            >
              <MoreHorizontal size={16} />
            </button>
          }
          items={[
            {
              key: 'view_all',
              label: 'View all categories',
              onClick: () => {},
            },
          ]}
        />
      }
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', flexGrow: 1 }}>
        {categories.map((cat, idx) => {
          const percentage = (cat.tasksCount / maxTasks) * 100;
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--text-strong)' }}>
                  {formatCategoryName(cat.nameKey)}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {formatNumber(cat.tasksCount, language)} tasks
                  </span>
                  {cat.trendPercentage != null && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)' }}>
                      +{cat.trendPercentage}%
                    </span>
                  )}
                </div>
              </div>

              <ProgressBar value={percentage} dense />
            </div>
          );
        })}
      </div>
    </Card>
  );
};
export default TopCategories;
