/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import type { ColumnDef } from '../../../components/ui/DataTable';
import type { Craftsman } from '../hooks/useCraftsmen';
import { Avatar, VerifiedMark, ScoreChip, StatusPill } from '../../../components/ui';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import { formatDate, formatNumber } from '../../../../core/utils/format';
import { Star } from 'lucide-react';

const scoreOf = (c: Craftsman): number => {
  const t = c.trustScore;
  return Math.round(t <= 1 ? t * 100 : t);
};

export const CraftsmanMobileCard: React.FC<{
  craftsman: Craftsman;
  selected: boolean;
  onSelect: (c: Craftsman) => void;
  t: (k: string) => string;
}> = ({ craftsman: c, selected, onSelect, t }) => {
  return (
    <div
      className={`craftsman-card${selected ? ' is-selected' : ''}`}
      onClick={() => onSelect(c)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(c);
        }
      }}
    >
      <div className="craftsman-card__top">
        <div className="craftsman-card__who">
          <Avatar src={c.avatarUrl} name={c.name} size={32} />
          <div className="craftsman-cell__identity">
            <span className="craftsman-cell__name">
              {c.name}
              {c.isVerifiedId ? <VerifiedMark size={14} /> : ''}
            </span>
            <span className="craftsman-cell__trade">{c.trade}</span>
          </div>
        </div>
        <div className="craftsman-card__stats">
          <Star size={12} fill="var(--text-strong)" stroke="none" />
          <span className="craftsman-rating__value">{Number(c.rating || 0).toFixed(1)}</span>
          <ScoreChip score={scoreOf(c)} />
        </div>
      </div>
      <div className="craftsman-card__bottom">
        <span className="ui-caption">
          {formatNumber(c.jobsCount || 0, 'en')} {t('craftsmen_jobs_done')}
        </span>
        <StatusPill variant={pillVariantFor('craftsman', c.status)} label={t(statusLabelKey('craftsman', c.status))} />
      </div>
    </div>
  );
};

export const getCraftsmenColumns = (t: (k: string) => string, language: 'en' | 'ar' | 'he'): ColumnDef<Craftsman>[] => [
  {
    key: 'craftsman',
    header: t('craftsmen_col_craftsman'),
    render: (c) => (
      <div className="craftsman-cell">
        <Avatar src={c.avatarUrl} name={c.name} size={32} />
        <div className="craftsman-cell__identity">
          <span className="craftsman-cell__name">
            {c.name}
            {c.isVerifiedId ? <VerifiedMark size={14} /> : ''}
          </span>
          <span className="craftsman-cell__trade">{c.trade}</span>
        </div>
      </div>
    ),
  },
  {
    key: 'rating',
    header: t('craftsmen_col_rating'),
    render: (c) => (
      <span className="craftsman-rating">
        <Star size={13} fill="var(--text-strong)" stroke="none" />
        <span className="craftsman-rating__value">{Number(c.rating || 0).toFixed(1)}</span>
        <span className="craftsman-rating__count">({formatNumber(c.reviewsCount || 0, language)})</span>
      </span>
    ),
  },
  {
    key: 'jobs',
    header: t('craftsmen_col_jobs'),
    align: 'end',
    render: (c) => <span className="craftsman-jobs">{formatNumber(c.jobsCount || 0, language)}</span>,
  },
  {
    key: 'billing',
    header: t('craftsmen_col_billing'),
    render: (c) => (
      <span className="ui-row">
        {c.billing?.billingModel ? (
          <StatusPill
            variant={pillVariantFor('subscription', c.billing.billingModel)}
            label={t(statusLabelKey('subscription', c.billing.billingModel))}
          />
        ) : (
          ''
        )}
        {(c.billing?.freeTasksRemaining ?? 0) > 0 ? (
          <StatusPill
            variant="info"
            label={`${t('craftsmen_free_short')} ${c.billing?.freeTasksRemaining ?? 0}`}
          />
        ) : (
          ''
        )}
        {c.billing?.commissionLocked ? <StatusPill variant="danger" label={t('status_locked')} /> : ''}
      </span>
    ),
  },
  {
    key: 'status',
    header: t('craftsmen_col_status'),
    align: 'end',
    render: (c) => (
      <StatusPill variant={pillVariantFor('craftsman', c.status)} label={t(statusLabelKey('craftsman', c.status))} />
    ),
  },
  {
    key: 'joined',
    header: t('craftsmen_col_joined'),
    render: (c) => (
      <span className="ui-caption">{c.joinedDate ? formatDate(c.joinedDate, language) : '—'}</span>
    ),
  },
];
