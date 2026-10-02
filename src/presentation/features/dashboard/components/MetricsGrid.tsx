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

  const metricConfigs: Record<string, { icon: React.ReactNode; labelKey: string }> = {
    users: { icon: <Users size={16} />, labelKey: 'metrics_total_users' },
    craftsmen: { icon: <Wrench size={16} />, labelKey: 'metrics_active_craftsmen' },
    tasks: { icon: <Briefcase size={16} />, labelKey: 'metrics_active_tasks' },
    revenue: { icon: <Wallet size={16} />, labelKey: 'metrics_revenue_mtd' },
    emergency: { icon: <Siren size={16} />, labelKey: 'metrics_emergency_reqs' },
    verification: { icon: <ShieldCheck size={16} />, labelKey: 'metrics_verification_reqs' },
  };

  const metricOrder = ['users', 'craftsmen', 'tasks', 'revenue', 'emergency', 'verification'];

  return (
    <div className="ui-kpi-grid">
      {metricOrder.map((id) => {
        const metric = metrics.find((m) => m.id === id);
        const config = metricConfigs[id];
        if (!config) return null;

        const val = metric ? metric.value : 0;
        const formattedValue = id === 'revenue' ? formatMoney(val, 'ILS', language) : formatNumber(val, language);
        const isEmergency = id === 'emergency' && val > 0;

        // Caption only when backed by live data (online count from the backend).
        const caption =
          id === 'craftsmen' && metric?.onlineCount != null
            ? `${formatNumber(metric.onlineCount, language)} ${t('metrics_online_now')}`
            : undefined;

        return (
          <KpiCard
            key={id}
            icon={config.icon}
            label={t(config.labelKey) || (metric ? t(metric.nameKey) : id)}
            value={formattedValue}
            caption={caption}
            tone={isEmergency ? 'danger' : 'default'}
            loading={loading}
          />
        );
      })}
    </div>
  );
};
export default MetricsGrid;
