import React from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { Card } from '../../../components/ui/Card';
import { StatusPill } from '../../../components/ui/StatusPill';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { ANALYTICS_FABRICATED_IDS, type KpiData } from '../hooks/useAnalytics';

export interface PlatformHealthCardProps {
  kpis: KpiData[];
}

export const PlatformHealthCard: React.FC<PlatformHealthCardProps> = ({ kpis }) => {
  const { t } = useLanguage();

  const realKpis = (kpis || []).filter((k) => !ANALYTICS_FABRICATED_IDS.includes(k.id));

  if (realKpis.length === 0) return null;

  return (
    <Card
      title={
        <div className="ui-row ui-row--between" style={{ width: '100%' }}>
          <span>{t('analytics_platform_health')}</span>
          <StatusPill variant="success" dot pulse>
            <Check size={12} />
            <span>{t('analytics_all_healthy')}</span>
          </StatusPill>
        </div>
      }
      subtitle={t('analytics_operational_kpis')}
    >
      <div className="analytics-health-grid">
        {realKpis.map((kpi) => (
          <div key={kpi.id} className="analytics-health-card">
            <div className="analytics-health-top">
              <span className="analytics-health-name">
                {t(kpi.nameKey)}
              </span>
              <StatusPill variant={kpi.isOnTrack ? 'success' : 'warning'}>
                {t(kpi.statusKey)}
              </StatusPill>
            </div>

            <div className="analytics-health-metric">
              <span className="analytics-health-value ui-num">
                {kpi.value}
              </span>
              <span className="analytics-health-unit">
                {kpi.unit}
              </span>
            </div>

            <ProgressBar
              value={kpi.value}
              max={100}
              tone={kpi.isOnTrack ? 'success' : 'warning'}
            />
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PlatformHealthCard;
