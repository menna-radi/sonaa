import React from 'react';
import { Send, Calendar, Users } from 'lucide-react';
import { KpiCard } from '../../../components/ui/KpiCard';
import { useLanguage } from '../../../context/LanguageContext';
import { formatNumber } from '../../../../core/utils/format';

interface BroadcastKpisProps {
  sent: number;
  scheduled: number;
  reach: number;
  loading?: boolean;
}

export const BroadcastKpis: React.FC<BroadcastKpisProps> = ({ sent, scheduled, reach, loading = false }) => {
  const { t, language } = useLanguage();

  return (
    <div className="ui-kpi-grid ui-kpi-grid--3">
      <KpiCard
        icon={<Send size={16} />}
        label={t('broadcast_kpi_sent')}
        value={formatNumber(sent, language)}
        loading={loading}
      />
      <KpiCard
        icon={<Calendar size={16} />}
        label={t('broadcast_scheduled')}
        value={formatNumber(scheduled, language)}
        loading={loading}
      />
      <KpiCard
        icon={<Users size={16} />}
        label={t('broadcast_total_reach')}
        value={formatNumber(reach, language)}
        loading={loading}
      />
    </div>
  );
};
