import React from 'react';

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

export const SystemStatus: React.FC = () => {
  return (
    <div
      className="glass-card"
      style={{
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-surface)',
        padding: '16px',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '12px', textAlign: 'start' }}>
        System Status
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {SERVICES.map((svc) => (
          <div
            key={svc.name}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {svc.name}
            </span>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: STATUS_COLOR[svc.status] ?? 'var(--text-muted)',
            }}>
              <span style={{
                width: '6px',
                height: '6px',
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
  );
};

export default SystemStatus;
