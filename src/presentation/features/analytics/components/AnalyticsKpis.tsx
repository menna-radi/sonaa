import React from 'react';
import { Users, Activity, CheckSquare, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { KpiCard } from '../../../components/ui/KpiCard';
import type { MetricCardState } from '../hooks/useAnalytics';

export interface AnalyticsKpisProps {
  userGrowth: MetricCardState;
  activeCraftsmen: MetricCardState;
  marketplaceActivity: MetricCardState;
  conversionRate: MetricCardState;
  loading?: boolean;
}

export const AnalyticsKpis: React.FC<AnalyticsKpisProps> = ({
  userGrowth,
  activeCraftsmen,
  marketplaceActivity,
  conversionRate,
  loading,
}) => {
  const { t } = useLanguage();

  return (
    <div className="analytics-kpi-grid">
      <KpiCard
        icon={<Users size={16} />}
        label={t('analytics_user_growth')}
        value={userGrowth.value}
        loading={loading}
      />
      <KpiCard
        icon={<Activity size={16} />}
        label={t('analytics_active_craftsmen')}
        value={activeCraftsmen.value}
        loading={loading}
      />
      <KpiCard
        icon={<CheckSquare size={16} />}
        label={t('analytics_marketplace_activity')}
        value={marketplaceActivity.value}
        loading={loading}
      />
      <KpiCard
        icon={<TrendingUp size={16} />}
        label={t('analytics_conversion_rate')}
        value={conversionRate.value}
        loading={loading}
      />
    </div>
  );
};

export default AnalyticsKpis;
