import React from 'react';
import { Briefcase, Users, AlertTriangle } from 'lucide-react';
import type { LiveActivitySummary } from '../../../../domain/entities/LiveActivity';

interface LiveSummaryCardsProps {
  summary: LiveActivitySummary | null;
}

export const LiveSummaryCards: React.FC<LiveSummaryCardsProps> = ({ summary }) => {
  const cards = [
    {
      label: 'Active jobs',
      sub: 'In progress',
      value: summary?.activeJobs.toLocaleString() ?? '—',
      icon: <Briefcase size={16} />,
      color: 'var(--text-primary)',
      bg: 'var(--bg-surface)',
      border: 'var(--border-color)',
    },
    {
      label: 'Online now',
      sub: 'Craftsmen',
      value: summary?.onlineCraftsmen.toLocaleString() ?? '—',
      icon: <Users size={16} />,
      color: 'var(--text-primary)',
      bg: 'var(--bg-surface)',
      border: 'var(--border-color)',
    },
    {
      label: 'SOS',
      sub: 'Emergencies',
      value: summary?.sosCount.toLocaleString() ?? '—',
      icon: <AlertTriangle size={16} />,
      color: '#DC2626',
      bg: '#FFF1F2',
      border: '#FECDD3',
    },
  ];

  return (
    <div className="live-summary-grid">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="live-summary-card"
          style={{
            background: card.bg,
            border: `1px solid ${card.border}`,
            borderRadius: 'var(--border-radius-md)',
            padding: '14px 12px',
            textAlign: 'start',
          }}
        >
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {card.label}
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: card.color, fontFamily: 'var(--font-title)', lineHeight: 1.2, margin: '4px 0' }}>
            {card.value}
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-disabled)', fontWeight: 500 }}>
            {card.sub}
          </span>
        </div>
      ))}
    </div>
  );
};

export default LiveSummaryCards;
