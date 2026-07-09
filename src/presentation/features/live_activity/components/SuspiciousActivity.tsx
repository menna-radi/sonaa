import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import type { SuspiciousAlert, AlertSeverity } from '../../../../domain/entities/LiveActivity';

interface SuspiciousActivityProps {
  alerts: SuspiciousAlert[];
}

const SEVERITY_STYLE: Record<AlertSeverity, { bg: string; text: string; label: string }> = {
  high:   { bg: '#FEF2F2', text: '#DC2626', label: 'high' },
  medium: { bg: '#FFFBEB', text: '#D97706', label: 'medium' },
  low:    { bg: '#F0FDF4', text: '#16A34A', label: 'low' },
};

export const SuspiciousActivity: React.FC<SuspiciousActivityProps> = ({ alerts }) => {
  const unresolvedCount = alerts.length;

  return (
    <div
      className="glass-card live-desktop-suspicious-card"
      style={{
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-surface)',
        padding: '16px',
        height: '100%',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', textAlign: 'start' }}>
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '8px',
          padding: '6px',
          display: 'flex',
        }}>
          <AlertTriangle size={14} color="#DC2626" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            Suspicious Activity
          </div>
          <div style={{ fontSize: '0.7rem', color: '#DC2626', fontWeight: 600 }}>
            {unresolvedCount} alerts unresolved
          </div>
        </div>
      </div>

      {/* Alert list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alerts.map((alert) => {
          const style = SEVERITY_STYLE[alert.severity];
          return (
            <div
              key={alert.id}
              style={{
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-md)',
                padding: '12px',
                textAlign: 'start',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-primary)', flex: 1, marginInlineEnd: '8px' }}>
                  {alert.title}
                </span>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: style.text,
                  background: style.bg,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  flexShrink: 0,
                }}>
                  {style.label}
                </span>
              </div>

              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>
                {alert.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-disabled)' }}>
                  {alert.minutesAgo === 0 ? 'Just now' : `${alert.minutesAgo}m ago`}
                </span>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                  padding: 0,
                }}>
                  Investigate <ArrowRight size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SuspiciousActivity;
