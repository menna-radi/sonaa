import React from 'react';
import type { BusyZone } from '../../../../domain/entities/LiveActivity';
import { Card, ProgressBar } from '../../../components/ui';
import { MapPin } from 'lucide-react';

interface BusyZonesProps {
  zones: BusyZone[];
}

export const BusyZones: React.FC<BusyZonesProps> = ({ zones }) => {
  const maxJobs = Math.max(...zones.map((z) => z.activeJobs), 1);

  return (
    <Card
      eyebrow="Busy Zones"
      title="Active jobs by zone"
      className="busy-zones-card live-desktop-busy-zones-card"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {zones.length === 0 ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 120,
            color: 'var(--text-muted)',
            fontSize: 'var(--fs-caption)',
            textAlign: 'center',
          }}
        >
          All zones normal · No pending load
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', flex: 1 }}>
          {zones.map((zone) => {
            const pct = Math.round((zone.activeJobs / maxJobs) * 100);
            return (
              <div key={zone.name} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)', minWidth: 0 }}>
                    <MapPin size={12} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
                    <span
                      style={{
                        fontSize: 'var(--fs-caption)',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={zone.name}
                    >
                      {zone.name}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 'var(--fs-caption)',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {zone.activeJobs}
                  </span>
                </div>

                <ProgressBar value={pct} max={100} size="sm" />
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default BusyZones;
