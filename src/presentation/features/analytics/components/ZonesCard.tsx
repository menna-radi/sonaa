import React from 'react';
import { MapPin } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { Card } from '../../../components/ui/Card';
import { StatusPill } from '../../../components/ui/StatusPill';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import type { ZoneData } from '../hooks/useAnalytics';

export interface ZonesCardProps {
  zones: ZoneData[];
}

export const ZonesCard: React.FC<ZonesCardProps> = ({ zones }) => {
  const { t } = useLanguage();

  if (!zones || zones.length === 0) return null;

  return (
    <Card
      title={t('analytics_high_demand_zones')}
      subtitle={t('analytics_riyadh_districts')}
    >
      <div className="analytics-zones-list">
        {zones.map((zone, idx) => (
          <div key={idx} className="analytics-zone-item">
            <div className="analytics-zone-header">
              <div className="analytics-zone-name">
                <MapPin size={14} />
                <span>{zone.name}</span>
              </div>
              <div className="analytics-zone-meta">
                <span className="analytics-zone-tasks ui-num">
                  {zone.tasksCount} {t('analytics_tasks_count')}
                </span>
                <StatusPill variant="neutral">{zone.trend}</StatusPill>
              </div>
            </div>
            <ProgressBar
              value={zone.barWidth}
              max={100}
              tone={zone.barWidth > 75 ? 'danger' : zone.barWidth > 50 ? 'warning' : 'default'}
            />
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ZonesCard;
