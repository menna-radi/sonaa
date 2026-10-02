import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Card } from '../../../components/ui';
import { GroupedBarChart } from '../../../components/charts';
import type { CohortData } from '../../../../domain/repositories/MetricRepository';

interface CohortVelocityProps {
  data: CohortData[];
}

export const CohortVelocity: React.FC<CohortVelocityProps> = ({ data }) => {
  const { t } = useLanguage();

  const categories = data.map((d) => d.week);
  const series = [
    { name: t('nav_customers'), color: 'var(--text-primary)', values: data.map((d) => d.users) },
    { name: t('nav_craftsmen'), color: 'var(--text-muted)', values: data.map((d) => d.craftsmen) },
    { name: t('nav_tasks'), color: 'var(--border-strong)', values: data.map((d) => d.tasks) },
  ];

  return (
    <Card title={t('sec_weekly_cohort')} subtitle={t('sec_marketplace_growth')} className="ov-card-fill">
      <div className="ov-chart-wrap">
        <GroupedBarChart
          categories={categories}
          series={series}
          height={180}
          ariaLabel={t('sec_weekly_cohort')}
        />
      </div>
    </Card>
  );
};

export default CohortVelocity;
