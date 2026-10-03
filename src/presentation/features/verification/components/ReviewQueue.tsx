import React from 'react';
import type { Submission } from '../types';
import type { QueueStatus } from '../hooks/useVerificationQueue';
import { Card, Segmented, ListItem, Avatar, EmptyState, StatusPill, Button } from '../../../components/ui';
import { useLanguage } from '../../../context/LanguageContext';
import { formatRelativeTime } from '../../../../core/utils/format';
import { tf } from '../utils';
import { CheckCircle2, ChevronRight } from 'lucide-react';

interface ReviewQueueProps {
  submissions: Submission[];
  selectedId: string;
  onSelect: (submission: Submission) => void;
  activeFilter: QueueStatus;
  onFilterChange: (f: QueueStatus) => void;
  counts: {
    pending: number;
    flagged: number;
    approved: number;
    all: number;
  };
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  autoVerifyEnabled?: boolean;
}

export const ReviewQueue: React.FC<ReviewQueueProps> = ({
  submissions,
  selectedId,
  onSelect,
  activeFilter,
  onFilterChange,
  counts,
  page,
  pageCount,
  onPageChange,
  autoVerifyEnabled = true,
}) => {
  const { t, language } = useLanguage();
  const tabs = [
    { value: 'pending', label: t('vr_tab_pending'), count: counts.pending },
    { value: 'flagged', label: t('vr_tab_flagged'), count: counts.flagged, tone: 'danger' as const },
    { value: 'approved', label: t('vr_tab_approved'), count: counts.approved },
    { value: 'all', label: t('vr_tab_all'), count: counts.all },
  ];

  return (
    <Card
      eyebrow={t('vr_queue_eyebrow')}
      title={t('vr_queue_title')}
      padding="none"
      className="review-queue-card"
    >
      <div className="vr-queue-filters">
        <Segmented
          value={activeFilter}
          onChange={(val) => onFilterChange(val as QueueStatus)}
          items={tabs}
          className="review-queue-tabs"
        />
      </div>

      <div className="vr-queue-list">
        {submissions.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 size={32} className="vr-icon-success" />}
            title={t('vr_queue_clear_title')}
            description={autoVerifyEnabled ? t('vr_queue_clear_auto') : t('vr_queue_clear_manual')}
          />
        ) : (
          submissions.map((sub) => (
            <ListItem
              key={sub.id}
              selected={sub.id === selectedId}
              onClick={() => onSelect(sub)}
              leading={<Avatar src={sub.avatar} name={sub.name} size={32} />}
              title={sub.name}
              subtitle={`${sub.role || t('vr_role_default')} · ${
                sub.submittedAt ? formatRelativeTime(sub.submittedAt, language) : '—'
              }`}
              trailing={
                <div className="vr-queue-trailing">
                  {sub.risk === 'High' && <StatusPill variant="danger" label={t('vr_high_risk')} />}
                  <ChevronRight size={14} className="vr-icon-faint ui-icon--directional" />
                </div>
              }
            />
          ))
        )}
      </div>

      {pageCount > 1 && (
        <div className="vr-queue-pager">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            {t('vr_btn_prev')}
          </Button>
          <span className="vr-queue-pager__label ui-num">
            {tf(t, 'vr_page_of', { n: `${page} / ${pageCount}` })}
          </span>
          <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
            {t('vr_btn_next')}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ReviewQueue;
