import React from 'react';
import { AlertOctagon, ShieldAlert, CheckCircle, FileText } from 'lucide-react';
import { KpiCard } from '../../../components/ui/KpiCard';
import { useLanguage } from '../../../context/LanguageContext';

interface ReportsKpisProps {
  counts?: {
    all?: number;
    pending?: number;
    investigating?: number;
    resolved?: number;
    dismissed?: number;
  };
  loading?: boolean;
}

export const ReportsKpis: React.FC<ReportsKpisProps> = ({ counts, loading }) => {
  const { t } = useLanguage();

  const pending = counts?.pending ?? 0;
  const investigating = counts?.investigating ?? 0;
  const resolved = counts?.resolved ?? 0;
  const dismissed = counts?.dismissed ?? 0;

  return (
    <div className="ui-kpi-grid ui-kpi-grid--4">
      <KpiCard
        icon={<AlertOctagon size={16} />}
        label={t('reports_kpi_pending')}
        value={pending}
        tone={pending > 0 ? 'danger' : 'default'}
        loading={loading}
      />
      <KpiCard
        icon={<ShieldAlert size={16} />}
        label={t('reports_kpi_investigating')}
        value={investigating}
        tone="default"
        loading={loading}
      />
      <KpiCard
        icon={<CheckCircle size={16} />}
        label={t('reports_kpi_resolved')}
        value={resolved}
        tone="default"
        loading={loading}
      />
      <KpiCard
        icon={<FileText size={16} />}
        label={t('reports_kpi_dismissed')}
        value={dismissed}
        tone="default"
        loading={loading}
      />
    </div>
  );
};
