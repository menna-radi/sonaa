import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Category } from '../../../../domain/entities/Category';
import { KpiCard } from '../../../components/ui';
import { Layers, FolderTree, Eye, Briefcase } from 'lucide-react';
import { formatNumber } from '../../../../core/utils/format';

export interface ServiceKpisProps {
  categories: Category[];
  loading: boolean;
}

export const ServiceKpis: React.FC<ServiceKpisProps> = ({ categories, loading }) => {
  const { t, language } = useLanguage();

  const active = categories.filter((c) => c.isActive ?? c.visible).length;
  const subcategories = categories.reduce((sum, c) => sum + (c.subcategoriesCount || 0), 0);
  const tasks = categories.reduce((sum, c) => sum + (c.taskVolume ?? 0), 0);

  return (
    <div className="ui-kpi-grid ui-kpi-grid--4">
      <KpiCard
        icon={<Layers size={16} />}
        label={t('categories_kpi_total')}
        value={formatNumber(categories.length, language)}
        loading={loading}
      />
      <KpiCard
        icon={<Eye size={16} />}
        label={t('categories_kpi_active')}
        value={formatNumber(active, language)}
        loading={loading}
      />
      <KpiCard
        icon={<FolderTree size={16} />}
        label={t('categories_kpi_subs')}
        value={formatNumber(subcategories, language)}
        loading={loading}
      />
      <KpiCard
        icon={<Briefcase size={16} />}
        label={t('categories_kpi_tasks')}
        value={formatNumber(tasks, language)}
        loading={loading}
      />
    </div>
  );
};
