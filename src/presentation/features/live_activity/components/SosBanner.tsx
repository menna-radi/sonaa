import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { ActivityEvent } from '../../../../domain/entities/LiveActivity';

interface SosBannerProps {
  event: ActivityEvent | null;
}

export const SosBanner: React.FC<SosBannerProps> = ({ event }) => {
  if (!event) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#FFF1F2',
        border: '1px solid #FECDD3',
        borderRadius: 'var(--border-radius-md)',
        padding: '14px var(--spacing-md)',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        {/* Red SOS icon pill */}
        <div style={{
          background: '#DC2626',
          borderRadius: '10px',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <AlertTriangle size={18} color="#FFFFFF" />
        </div>

        <div style={{ textAlign: 'start', minWidth: 0 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9F1239', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            SOS · {event.subtitle.split('·')[1]?.trim() ?? event.subtitle}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#BE123C', marginTop: '2px', lineBreak: 'anywhere' }}>
            {event.subtitle}
          </div>
        </div>
      </div>

      <button
        style={{
          background: '#FFFFFF',
          border: '1px solid #FECDD3',
          borderRadius: '15px',
          color: '#DC2626',
          fontWeight: 700,
          fontSize: '0.78rem',
          padding: '5px 14px',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        View
      </button>
    </div>
  );
};

export default SosBanner;
