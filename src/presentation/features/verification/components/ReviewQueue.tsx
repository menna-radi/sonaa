import React from 'react';
import type { Submission } from '../types';
import { Card, Segmented, ListItem, Avatar, EmptyState, StatusPill } from '../../../components/ui';
import { CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';

interface ReviewQueueProps {
  submissions: Submission[];
  selectedId: string;
  onSelect: (submission: Submission) => void;
  activeFilter: 'pending' | 'flagged' | 'approved' | 'all';
  onFilterChange: (f: 'pending' | 'flagged' | 'approved' | 'all') => void;
  counts: {
    pending: number;
    flagged: number;
    approved: number;
    all: number;
  };
  autoVerifyEnabled?: boolean;
}

export const ReviewQueue: React.FC<ReviewQueueProps> = ({
  submissions,
  selectedId,
  onSelect,
  activeFilter,
  onFilterChange,
  counts,
  autoVerifyEnabled = true,
}) => {
  const tabs = [
    { value: 'pending', label: 'Pending', count: counts.pending },
    { value: 'flagged', label: 'Flagged', count: counts.flagged, tone: 'danger' as const },
    { value: 'approved', label: 'Approved', count: counts.approved },
    { value: 'all', label: 'All', count: counts.all },
  ];

  return (
    <Card
      eyebrow="Review Queue"
      title="Awaiting moderation"
      padding="none"
      className="review-queue-card"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
    >
      <div style={{ padding: 'var(--sp-3)', borderBottom: '1px solid var(--border-subtle)' }}>
        <Segmented
          value={activeFilter}
          onChange={(val) => onFilterChange(val as any)}
          items={tabs}
          className="review-queue-tabs"
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {submissions.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 size={32} style={{ color: 'var(--success)' }} />}
            title="Queue is clear"
            description={
              autoVerifyEnabled
                ? 'All applications processed. Real-time auto-verification is currently active.'
                : 'No craftsman submissions awaiting moderator decision.'
            }
          />
        ) : (
          submissions.map((sub) => {
            const isSelected = sub.id === selectedId;
            return (
              <ListItem
                key={sub.id}
                selected={isSelected}
                onClick={() => onSelect(sub)}
                leading={<Avatar src={sub.avatar} name={sub.name} size={32} />}
                title={sub.name}
                subtitle={`${sub.role || 'Craftsman'} · ${sub.submittedAgo || 'Today'}`}
                trailing={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {sub.risk === 'High' && (
                      <StatusPill variant="danger" label="High Risk" />
                    )}
                    <ChevronRight size={14} style={{ color: 'var(--text-faint)' }} />
                  </div>
                }
              />
            );
          })
        )}
      </div>
    </Card>
  );
};

export default ReviewQueue;
