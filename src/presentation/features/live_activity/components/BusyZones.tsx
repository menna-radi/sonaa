import React from 'react';
import { MapPin } from 'lucide-react';
import type { BusyZone } from '../../../../domain/entities/LiveActivity';
import { Card, ProgressBar } from '../../../components/ui';
import { useLanguage } from '../../../context/LanguageContext';
import { formatNumber } from '../../../../core/utils/format';
import { LIVE_FABRICATED_FIELDS_TRUSTED } from '../flags';

interface BusyZonesProps {
  zones: BusyZone[];
}

/** Hidden until the backend stops deriving zones from placeholders (flag in flags.ts). */
export const BusyZones: React.FC<BusyZonesProps> = ({ zones }) => {
  const { t, language } = useLanguage();
  if (!LIVE_FABRICATED_FIELDS_TRUSTED) return null;

  const maxJobs = Math.max(...zones.map((z) => z.activeJobs), 1);

  return (
    <Card eyebrow={t('live_zones_eyebrow')} title={t('live_zones_title')} className="live-card-fill">
      {zones.length === 0 ? (
        <div className="live-empty">{t('live_zones_empty')}</div>
      ) : (
        <div className="live-list">
          {zones.map((zone) => (
            <div key={zone.name} className="ui-stack ui-stack--tight">
              <div className="live-zone__row">
                <span className="live-zone__name">
                  <MapPin size={12} />
                  <span className="ui-clamp-1" title={zone.name}>
                    {zone.name}
                  </span>
                </span>
                <span className="live-zone__count ui-num">{formatNumber(zone.activeJobs, language)}</span>
              </div>
              <ProgressBar value={Math.round((zone.activeJobs / maxJobs) * 100)} max={100} size="sm" />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default BusyZones;
