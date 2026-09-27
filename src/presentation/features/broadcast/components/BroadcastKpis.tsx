import React from 'react';
import { Send, Calendar, Eye, Users } from 'lucide-react';
import { KpiCard } from '../../../components/ui/KpiCard';
import { useLanguage } from '../../../context/LanguageContext';

interface BroadcastKpisProps {
  kpis: {
    totalSent: string | number;
    scheduled: string | number;
    scheduledSub?: string;
    avgOpenRate: string;
    totalReach: string;
  };
  loading?: boolean;
}

export const BroadcastKpis: React.FC<BroadcastKpisProps> = ({ kpis, loading = false }) => {
  const { t } = useLanguage();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--sp-4)',
        width: '100%',
      }}
    >
      <KpiCard
        icon={<Send size={16} />}
        label={t('broadcast_total_sent') || 'Total Sent (30d)'}
        value={kpis.totalSent}
        delta={18}
        caption="vs prev period"
        loading={loading}
      />
      <KpiCard
        icon={<Calendar size={16} />}
        label={t('broadcast_scheduled') || 'Scheduled'}
        value={kpis.scheduled}
        caption={kpis.scheduledSub || 'Upcoming queued'}
        loading={loading}
      />
      <KpiCard
        icon={<Eye size={16} />}
        label={t('broadcast_avg_open_rate') || 'Avg Open Rate'}
        value={kpis.avgOpenRate}
        delta={4}
        caption="this month"
        loading={loading}
      />
      <KpiCard
        icon={<Users size={16} />}
        label={t('broadcast_total_reach') || 'Total Reach'}
        value={kpis.totalReach}
        caption="Across all channels"
        loading={loading}
      />
    </div>
  );
};
