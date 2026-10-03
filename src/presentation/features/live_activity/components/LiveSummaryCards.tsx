import React from 'react';
import { Briefcase, Users, AlertTriangle, MapPin } from 'lucide-react';
import type { LiveActivitySummary } from '../../../../domain/entities/LiveActivity';
import { KpiCard } from '../../../components/ui';
import { useLanguage } from '../../../context/LanguageContext';
import { formatNumber } from '../../../../core/utils/format';
import { LIVE_FABRICATED_FIELDS_TRUSTED } from '../flags';

interface LiveSummaryCardsProps {
  summary: LiveActivitySummary | null;
  loading?: boolean;
}

export const LiveSummaryCards: React.FC<LiveSummaryCardsProps> = ({ summary, loading = false }) => {
  const { t, language } = useLanguage();
  const num = (v: number | undefined) => (v === undefined ? '—' : formatNumber(v, language));

  return (
    <div className="ui-kpi-grid ui-kpi-grid--3">
      <KpiCard icon={<Briefcase size={16} />} label={t('live_kpi_active_jobs')} value={num(summary?.activeJobs)} loading={loading} />
      <KpiCard icon={<Users size={16} />} label={t('live_kpi_online')} value={num(summary?.onlineCraftsmen)} loading={loading} />
      <KpiCard
        icon={<AlertTriangle size={16} />}
        label={t('live_kpi_sos')}
        value={num(summary?.sosCount)}
        tone={summary && summary.sosCount > 0 ? 'danger' : 'default'}
        loading={loading}
      />
      {LIVE_FABRICATED_FIELDS_TRUSTED && (
        <KpiCard icon={<MapPin size={16} />} label={t('live_kpi_zones')} value={num(summary?.busyZonesCount)} loading={loading} />
      )}
    </div>
  );
};

export default LiveSummaryCards;
