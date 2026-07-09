import React from 'react';
import type { BusyZone } from '../../../../domain/entities/LiveActivity';

interface BusyZonesProps {
  zones: BusyZone[];
}

const ZONE_COLORS = [
  '#171717',
  '#404040',
  '#737373',
  '#A3A3A3',
  '#D4D4D4',
];

const SERVICES = [
  { name: 'API Gateway',     status: 'Operational' },
  { name: 'Payments',        status: 'Operational' },
  { name: 'Notifications',   status: 'Operational' },
  { name: 'Geo Services',    status: 'Operational' },
];

const STATUS_COLOR: Record<string, string> = {
  Operational: 'var(--color-success)',
  Degraded:    '#F59E0B',
  Down:        'var(--color-danger)',
};

export const BusyZones: React.FC<BusyZonesProps> = ({ zones }) => {
  return (
    <div
      className="glass-card live-desktop-busy-zones-card"
      style={{
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-surface)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Header & Active Jobs Title - Height 40px */}
      <div className="busy-zones-header" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '40px', marginBottom: '16px', textAlign: 'start' }}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>Busy Zones</div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Active jobs by zone</div>
      </div>

      {/* 2. Representation of Busy Zones list - Height 102px */}
      <div className="busy-zones-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '102px', overflow: 'hidden' }}>
        {zones.slice(0, 3).map((zone, idx) => (
          <div key={zone.name} style={{ textAlign: 'start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  width: '6px', height: '6px',
                  borderRadius: '50%',
                  background: ZONE_COLORS[idx] ?? 'var(--text-muted)',
                  flexShrink: 0,
                }} />
                <span className="busy-zone-name" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                  {zone.name}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {zone.activeJobs}
              </span>
            </div>

            {/* Progress bar */}
            <div style={{
              height: '3px',
              background: 'var(--bg-surface-hover)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${zone.fillPercentage}%`,
                background: ZONE_COLORS[idx] ?? '#171717',
                borderRadius: '2px',
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Divider - border-top-width: 1px */}
      <div className="busy-zones-divider" style={{ borderTop: '1px solid var(--border-color)', margin: '16px 0' }} />

      {/* 4. System Status - Height 136px */}
      <div className="system-status-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '136px', textAlign: 'start', justifyContent: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
          System Status
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {SERVICES.map((svc) => (
            <div
              key={svc.name}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                {svc.name}
              </span>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: STATUS_COLOR[svc.status] ?? 'var(--text-muted)',
              }}>
                <span style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: STATUS_COLOR[svc.status] ?? 'var(--text-muted)',
                  flexShrink: 0,
                }} />
                {svc.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusyZones;
