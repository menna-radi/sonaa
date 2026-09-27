import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Metric } from '../../../../domain/entities/Metric';
import { KpiCard } from '../../../components/ui/KpiCard';
import { formatNumber, formatMoney } from '../../../../core/utils/format';
import { Users, Wrench, Briefcase, Wallet, Siren, ShieldCheck } from 'lucide-react';

interface MetricsGridProps {
  metrics: Metric[];
  loading?: boolean;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics, loading = false }) => {
  const { t, language } = useLanguage();

  const metricConfigs: Record<
    string,
    {
      icon: React.ReactNode;
      labelKey: string;
      captionKey?: string;
      defaultCaption: string;
      defaultDelta?: number;
    }
  > = {
    users: {
      icon: <Users size={16} />,
      labelKey: 'kpi_total_users',
      defaultCaption: 'vs last week',
      defaultDelta: 12.4,
    },
    craftsmen: {
      icon: <Wrench size={16} />,
      labelKey: 'kpi_active_craftsmen',
      defaultCaption: '312 online now',
      defaultDelta: 8.2,
    },
    tasks: {
      icon: <Briefcase size={16} />,
      labelKey: 'kpi_active_tasks',
      defaultCaption: 'active operations',
      defaultDelta: 5.6,
    },
    revenue: {
      icon: <Wallet size={16} />,
      labelKey: 'kpi_revenue_mtd',
      defaultCaption: 'vs last month',
      defaultDelta: 18.9,
    },
    emergency: {
      icon: <Siren size={16} />,
      labelKey: 'kpi_emergency_reqs',
      defaultCaption: 'last 24 hours',
      defaultDelta: undefined,
    },
    verification: {
      icon: <ShieldCheck size={16} />,
      labelKey: 'kpi_verification_reqs',
      defaultCaption: 'pending review',
      defaultDelta: undefined,
    },
  };

  const metricOrder = ['users', 'craftsmen', 'tasks', 'revenue', 'emergency', 'verification'];

  return (
    <div
      className="dashboard-metrics-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 'var(--gap-grid)',
        marginBottom: 'var(--gap-grid)',
      }}
    >
      {metricOrder.map((id) => {
        const metric = metrics.find((m) => m.id === id);
        const config = metricConfigs[id];
        if (!config) return null;

        const val = metric ? metric.value : 0;
        const formattedValue =
          id === 'revenue'
            ? formatMoney(val, 'ILS', language)
            : formatNumber(val, language);

        const isEmergency = id === 'emergency' && val > 0;

        return (
          <KpiCard
            key={id}
            icon={config.icon}
            label={t(config.labelKey) || (metric ? t(metric.nameKey) : id)}
            value={formattedValue}
            delta={config.defaultDelta}
            caption={config.defaultCaption}
            tone={isEmergency ? 'danger' : 'default'}
            loading={loading}
          />
        );
      })}
    </div>
  );
};
export default MetricsGrid;
