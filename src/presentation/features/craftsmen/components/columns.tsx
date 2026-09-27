import React from 'react';
import type { ColumnDef } from '../../../components/ui/DataTable';
import type { Craftsman } from '../hooks/useCraftsmen';
import { Avatar, VerifiedMark, ScoreChip, StatusPill } from '../../../components/ui';
import { Star } from 'lucide-react';

export const getCraftsmenColumns = (
  onSelect?: (craftsman: Craftsman) => void
): ColumnDef<Craftsman>[] => [
  {
    key: 'craftsman',
    header: 'Craftsman',
    render: (c) => {
      const presence =
        c.status === 'suspended'
          ? 'flagged'
          : c.isAvailable
          ? 'online'
          : 'offline';

      const isVerified =
        c.verifications?.nationalId ||
        (c.verifications?.selfieMatch && c.verifications?.bankIban);

      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', minWidth: 160 }}>
          <Avatar
            src={c.avatarUrl}
            name={c.name}
            size={32}
            presence={presence}
          />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 'var(--fs-caption)',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {c.name}
              </span>
              {isVerified && <VerifiedMark size={14} />}
            </div>
            <span style={{ fontSize: 'var(--fs-micro)', color: 'var(--text-muted)' }}>
              {c.trade}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    key: 'rating',
    header: 'Rating',
    render: (c) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Star size={13} fill="var(--text-primary)" stroke="none" />
        <span style={{ fontWeight: 600, fontSize: 'var(--fs-caption)', color: 'var(--text-primary)' }}>
          {Number(c.rating || 5.0).toFixed(1)}
        </span>
        <span style={{ fontSize: 'var(--fs-micro)', color: 'var(--text-faint)' }}>
          ({c.reviewsCount || 0})
        </span>
      </div>
    ),
  },
  {
    key: 'jobs',
    header: 'Jobs',
    align: 'end',
    render: (c) => (
      <span
        style={{
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 500,
          fontSize: 'var(--fs-caption)',
          color: 'var(--text-secondary)',
        }}
      >
        {c.jobsCount || 0}
      </span>
    ),
  },
  {
    key: 'trust',
    header: 'Trust',
    render: (c) => {
      const score = Math.round(Number(c.trustScore ?? 0.85) * 100);
      return <ScoreChip score={score} />;
    },
  },
  {
    key: 'status',
    header: 'Status',
    align: 'end',
    render: (c) => {
      if (c.status === 'suspended') {
        return <StatusPill variant="danger" label="Suspended" />;
      }
      if (!c.isAvailable) {
        return <StatusPill variant="neutral" label="Offline" />;
      }
      return <StatusPill variant="success" label="Online" dot />;
    },
  },
];
