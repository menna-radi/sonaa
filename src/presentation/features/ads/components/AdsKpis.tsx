import React, { useMemo } from 'react';
import { BarChart3, Activity, TrendingUp, CheckCircle2, DollarSign, Megaphone } from 'lucide-react';
import { KpiCard } from '../../../components/ui/KpiCard';
import { formatMoney } from '../../../../core/utils/format';
import { Campaign } from '../types';

interface AdsKpisProps {
  campaigns: Campaign[];
  loading?: boolean;
}

export const AdsKpis: React.FC<AdsKpisProps> = ({ campaigns, loading }) => {
  const metrics = useMemo(() => {
    const activeCount = campaigns.filter((c) => c.status === 'Active').length;
    const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
    const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
    const avgCtr =
      totalImpressions > 0
        ? ((totalConversions / totalImpressions) * 100).toFixed(1)
        : '0.0';
    const totalClicks = totalConversions;

    const formatNum = (n: number) => {
      if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
      if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
      return n.toLocaleString();
    };

    return {
      impressions: formatNum(totalImpressions),
      clicks: formatNum(totalClicks),
      ctr: `${avgCtr}%`,
      conversions: totalConversions.toLocaleString(),
      budgetMoney: formatMoney(totalBudget, 'ILS'),
      active: activeCount,
      avgCtrVal: avgCtr,
    };
  }, [campaigns]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 'var(--sp-4)',
        width: '100%',
      }}
    >
      <KpiCard
        icon={<BarChart3 size={16} />}
        label="Total Impressions"
        value={metrics.impressions}
        caption="Live ad views"
        loading={loading}
      />
      <KpiCard
        icon={<Activity size={16} />}
        label="Total Clicks"
        value={metrics.clicks}
        caption="User engagements"
        loading={loading}
      />
      <KpiCard
        icon={<TrendingUp size={16} />}
        label="Average CTR"
        value={metrics.ctr}
        caption="Click-through rate"
        loading={loading}
      />
      <KpiCard
        icon={<CheckCircle2 size={16} />}
        label="Conversions"
        value={metrics.conversions}
        caption="Completed actions"
        loading={loading}
      />
      <KpiCard
        icon={<DollarSign size={16} />}
        label="Allocated Budget"
        value={metrics.budgetMoney}
        caption="Campaigns spend"
        loading={loading}
      />
      <KpiCard
        icon={<Megaphone size={16} />}
        label="Active Campaigns"
        value={metrics.active}
        caption="Currently serving"
        loading={loading}
      />
    </div>
  );
};
