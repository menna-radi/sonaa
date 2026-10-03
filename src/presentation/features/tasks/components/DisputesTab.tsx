import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Button, Card, DataTable, EmptyState, ErrorState, Segmented, StatusPill } from '../../../components/ui';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import { formatMoney, formatRelativeTime } from '../../../../core/utils/format';
import type { Dispute, DisputeStatus } from '../../../../domain/entities/Dispute';
import { useDisputes, DISPUTES_PAGE_SIZE } from '../hooks/useDisputes';
import { ResolveDisputeModal } from './ResolveDisputeModal';
import { Scale } from 'lucide-react';

type Filter = DisputeStatus | 'ALL';
const FILTERS: Filter[] = ['PENDING', 'RESOLVED', 'ALL'];

export const DisputesTab: React.FC = () => {
  const { t, language } = useLanguage();
  const [status, setStatus] = useState<Filter>('PENDING');
  const [page, setPage] = useState(1);
  const [resolving, setResolving] = useState<Dispute | null>(null);

  const q = useDisputes({ status, page, limit: DISPUTES_PAGE_SIZE });
  const totalPages = Math.max(1, Math.ceil(q.total / DISPUTES_PAGE_SIZE));
  const pendingCount = q.counts?.pending;

  return (
    <div className="ui-stack">
      <div className="ui-toolbar">
        <Segmented
          value={status}
          onChange={(v) => {
            setStatus(v as Filter);
            setPage(1);
          }}
          items={FILTERS.map((s) => ({
            value: s,
            label: t(`disputes_filter_${s.toLowerCase()}`),
            count: s === 'PENDING' ? pendingCount : undefined,
          }))}
        />
      </div>
      <Card padding="none">
        {q.error ? (
          <ErrorState title={t('status_error_title')} message={q.error.message} onRetry={() => q.refetch()} retryLabel={t('btn_retry')} />
        ) : (
          <DataTable
            columns={[
              {
                key: 'task',
                header: t('disputes_col_task'),
                render: (d: Dispute) => (
                  <span>
                    <bdi className="ui-num ui-text-strong">{d.taskDisplayId}</bdi>
                    <br />
                    <span className="ui-caption">{d.taskTitle || '—'}</span>
                  </span>
                ),
              },
              {
                key: 'parties',
                header: t('disputes_col_parties'),
                render: (d: Dispute) => (
                  <span>
                    {d.customerName}
                    {d.craftsmanName ? ` ↔ ${d.craftsmanName}` : ''}
                  </span>
                ),
              },
              {
                key: 'reason',
                header: t('disputes_col_reason'),
                render: (d: Dispute) => <span>{t(`dispute_reason_${d.reason.toLowerCase()}`)}</span>,
              },
              {
                key: 'amount',
                header: t('billing_col_amount'),
                align: 'end',
                render: (d: Dispute) => <bdi className="ui-num">{formatMoney(d.amount, 'ILS', language)}</bdi>,
              },
              {
                key: 'opened',
                header: t('disputes_col_opened'),
                render: (d: Dispute) => (
                  <span>{d.createdAt ? formatRelativeTime(d.createdAt, language) : '—'}</span>
                ),
              },
              {
                key: 'status',
                header: t('billing_col_status'),
                render: (d: Dispute) => (
                  <StatusPill variant={pillVariantFor('dispute', d.status)} label={t(statusLabelKey('dispute', d.status))} />
                ),
              },
              {
                key: 'actions',
                header: t('billing_col_actions'),
                align: 'end',
                render: (d: Dispute) =>
                  d.status === 'PENDING' ? (
                    <Button size="sm" variant="outline" onClick={() => setResolving(d)}>
                      {t('disputes_resolve')}
                    </Button>
                  ) : (
                    ''
                  ),
              },
            ]}
            rows={q.rows}
            rowKey={(d: Dispute) => d.id}
            loading={q.loading}
            empty={<EmptyState icon={<Scale size={20} />} title={t('empty_disputes')} />}
            pagination={{ page, totalPages, totalItems: q.total, pageSize: DISPUTES_PAGE_SIZE, onPageChange: setPage }}
            mobile={(d: Dispute) => (
              <div className="task-card">
                <div className="task-card__top">
                  <span>
                    <bdi className="ui-num ui-text-strong">{d.taskDisplayId}</bdi>
                    <br />
                    <span className="ui-caption">
                      {d.customerName}
                      {d.craftsmanName ? ` ↔ ${d.craftsmanName}` : ''}
                    </span>
                  </span>
                  <StatusPill variant={pillVariantFor('dispute', d.status)} label={t(statusLabelKey('dispute', d.status))} />
                </div>
                <div className="task-card__bottom">
                  <span className="ui-caption">{t(`dispute_reason_${d.reason.toLowerCase()}`)}</span>
                  {d.status === 'PENDING' ? (
                    <Button size="sm" variant="outline" onClick={() => setResolving(d)}>
                      {t('disputes_resolve')}
                    </Button>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            )}
          />
        )}
      </Card>
      <ResolveDisputeModal dispute={resolving} onClose={() => setResolving(null)} />
    </div>
  );
};

export default DisputesTab;
