import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
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
  const { navigate } = useNavigation();
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
      eyebrow={t('sec_top_categories')}
      title={t('sec_by_volume')}
      actions={
        <Dropdown
          trigger={
            <button type="button" aria-label={t('sec_top_categories')} className="ov-icon-btn">
              <MoreHorizontal size={16} />
            </button>
          }
          items={[
            {
              key: 'view_all',
              label: t('view_all'),
              onClick: () => navigate('service_management'),
            },
          ]}
        />
      }
      className="ov-card-fill"
    >
      <div className="ov-cat-list">
        {categories.map((cat, idx) => {
          const percentage = (cat.tasksCount / maxTasks) * 100;
          return (
            <div key={idx} className="ov-cat-row">
              <div className="ov-cat-head">
                <span className="ov-cat-name">{formatCategoryName(cat.nameKey)}</span>
                <div className="ov-cat-meta">
                  <span className="ov-cat-count">
                    {formatNumber(cat.tasksCount, language)} {t('unit_tasks')}
                  </span>
                  {cat.trendPercentage != null && (
                    <span className="ov-cat-trend">+{cat.trendPercentage}%</span>
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
